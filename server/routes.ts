import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { fetchTokenMetrics, getMetrics, getPriceHistory, addPricePoint, fetchDevBuys, getDevBuys, getConnectionStatus, fetchHistoricalPrices } from "./solana";
import authRoutes from "./authRoutes";
import { db } from "./db";
import { manualDevBuys, users, sessions } from "@shared/schema";
import { eq, desc, and, gt } from "drizzle-orm";
import { verifyJWT } from "./auth";
import { z } from "zod";

const manualDevBuyInputSchema = z.object({
  timestamp: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date format"),
  amount: z.number().positive("Amount must be positive"),
  price: z.number().positive("Price must be positive"),
  label: z.string().max(100).optional(),
});

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") 
      ? authHeader.substring(7) 
      : req.cookies?.token;
    
    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const decoded = verifyJWT(token);
    if (!decoded) {
      return res.status(401).json({ error: "Invalid token" });
    }
    
    const [session] = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())));
    
    if (!session) {
      return res.status(401).json({ error: "Session expired or invalid" });
    }
    
    const [user] = await db.select().from(users).where(eq(users.id, decoded.userId));
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    (req as any).userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, try again later" },
  validate: { xForwardedForHeader: false },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many authentication attempts, try again later" },
  validate: { xForwardedForHeader: false },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.use(cookieParser());
  
  app.use("/api/auth", authLimiter, authRoutes);
  
  app.use("/api", apiLimiter);
  
  const updateMetrics = async () => {
    try {
      const metrics = await fetchTokenMetrics();
      addPricePoint(metrics);
    } catch (error) {
      console.error("[Metrics] Update error:", error);
    }
  };
  
  const updateDevBuys = async () => {
    try {
      await fetchDevBuys();
    } catch (error) {
      console.error("[DevBuys] Update error:", error);
    }
  };
  
  setInterval(updateMetrics, 5000);
  setInterval(updateDevBuys, 60000);
  updateDevBuys();
  
  app.get("/api/metrics", async (_req, res) => {
    try {
      res.set("Cache-Control", "no-store, no-cache, must-revalidate");
      res.set("Pragma", "no-cache");
      const metrics = await fetchTokenMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch metrics" });
    }
  });
  
  app.get("/api/price-history", async (req, res) => {
    try {
      res.set("Cache-Control", "no-store, no-cache, must-revalidate");
      res.set("Pragma", "no-cache");
      const timeRange = (req.query.range as string) || "live";
      
      if (timeRange === "live") {
        const history = getPriceHistory();
        res.json(history);
      } else {
        const history = await fetchHistoricalPrices(timeRange);
        res.json(history);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch price history" });
    }
  });
  
  app.get("/api/dev-buys", async (_req, res) => {
    try {
      res.set("Cache-Control", "no-store, no-cache, must-revalidate");
      res.set("Pragma", "no-cache");
      
      const apiDevBuys = getDevBuys();
      
      const manualBuys = await db.select().from(manualDevBuys);
      const manualDevBuysFormatted = manualBuys
        .filter(b => b.amount && b.price && b.timestamp)
        .map(b => {
          const amount = parseFloat(b.amount);
          const price = parseFloat(b.price);
          if (isNaN(amount) || isNaN(price)) return null;
          return {
            signature: `manual-${b.id}`,
            timestamp: new Date(b.timestamp).getTime(),
            amount,
            price,
            label: b.label,
            isManual: true,
          };
        })
        .filter((b): b is NonNullable<typeof b> => b !== null);
      
      const allBuys = [...apiDevBuys, ...manualDevBuysFormatted].sort((a, b) => b.timestamp - a.timestamp);
      res.json(allBuys);
    } catch (error) {
      console.error("[DevBuys] Error:", error);
      res.status(500).json({ error: "Failed to fetch dev buys" });
    }
  });
  
  app.get("/api/status", (_req, res) => {
    try {
      const status = getConnectionStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to get status" });
    }
  });
  
  app.get("/api/token", (_req, res) => {
    res.json({
      address: "FrSFwE2BxWADEyUWFXDMAeomzuB4r83ZvzdG9sevpump",
      name: "NORMIE",
      symbol: "$NORMIE",
      decimals: 6,
      telegram: "@TheNormieNation",
      twitter: "@NormieCEO",
    });
  });

  app.get("/api/admin/dev-buys", requireAdmin, async (_req, res) => {
    try {
      const buys = await db.select().from(manualDevBuys).orderBy(desc(manualDevBuys.timestamp));
      res.json(buys);
    } catch (error) {
      console.error("[Admin] Error fetching manual dev buys:", error);
      res.status(500).json({ error: "Failed to fetch manual dev buys" });
    }
  });

  app.post("/api/admin/dev-buys", requireAdmin, async (req, res) => {
    try {
      const validationResult = manualDevBuyInputSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validationResult.error.flatten() 
        });
      }
      
      const { timestamp, amount, price, label } = validationResult.data;
      
      const [newBuy] = await db.insert(manualDevBuys).values({
        timestamp: new Date(timestamp),
        amount: amount.toString(),
        price: price.toString(),
        label: label || null,
        addedBy: (req as any).userId,
      }).returning();
      
      res.json(newBuy);
    } catch (error) {
      console.error("[Admin] Error adding manual dev buy:", error);
      res.status(500).json({ error: "Failed to add manual dev buy" });
    }
  });

  app.delete("/api/admin/dev-buys/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(manualDevBuys).where(eq(manualDevBuys.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("[Admin] Error deleting manual dev buy:", error);
      res.status(500).json({ error: "Failed to delete manual dev buy" });
    }
  });

  return httpServer;
}
