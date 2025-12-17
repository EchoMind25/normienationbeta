import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nacl from "tweetnacl";
import { storage } from "./storage";
import type { User } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");
const ADMIN_WALLET_ADDRESS = process.env.ADMIN_WALLET_ADDRESS || "";
const SESSION_DURATION_DAYS = 7;

export interface JWTPayload {
  userId: string;
  walletAddress: string | null;
  email: string | null;
  role: string;
  iat: number;
  exp: number;
}

export interface AuthRequest extends Request {
  user?: User;
  token?: string;
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return Buffer.from(str, "base64").toString();
}

export function createJWT(payload: Omit<JWTPayload, "iat" | "exp">): string {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + SESSION_DURATION_DAYS * 24 * 60 * 60,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  
  const hmac = crypto.createHmac("sha256", JWT_SECRET);
  hmac.update(signatureInput);
  const signature = hmac.digest("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;
    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    
    const hmac = crypto.createHmac("sha256", JWT_SECRET);
    hmac.update(signatureInput);
    const expectedSignature = hmac.digest("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

    if (signature !== expectedSignature) return null;

    const payload: JWTPayload = JSON.parse(base64UrlDecode(encodedPayload));
    
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateChallenge(): string {
  const timestamp = Date.now();
  const random = crypto.randomBytes(16).toString("hex");
  return `Sign this message to authenticate with Normie Nation: ${random}-${timestamp}`;
}

export function verifyWalletSignature(
  message: string,
  signature: string,
  publicKey: string
): boolean {
  try {
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = Buffer.from(signature, "base64");
    const publicKeyBytes = Buffer.from(publicKey, "base64");
    
    return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
  } catch {
    return false;
  }
}

export function isAdmin(user: User): boolean {
  return user.role === "admin" || user.walletAddress === ADMIN_WALLET_ADDRESS;
}

export function determineRole(walletAddress: string | null): string {
  if (walletAddress && walletAddress === ADMIN_WALLET_ADDRESS) {
    return "admin";
  }
  return "user";
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.authToken;
    
    const token = authHeader?.startsWith("Bearer ") 
      ? authHeader.slice(7) 
      : cookieToken;

    if (!token) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const payload = verifyJWT(token);
    if (!payload) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    const session = await storage.getSessionByToken(token);
    if (!session) {
      res.status(401).json({ error: "Session expired" });
      return;
    }

    const user = await storage.getUser(payload.userId);
    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    if (user.bannedAt) {
      res.status(403).json({ error: "Account banned" });
      return;
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(500).json({ error: "Authentication error" });
  }
}

export async function optionalAuthMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.authToken;
    
    const token = authHeader?.startsWith("Bearer ") 
      ? authHeader.slice(7) 
      : cookieToken;

    if (token) {
      const payload = verifyJWT(token);
      if (payload) {
        const session = await storage.getSessionByToken(token);
        if (session) {
          const user = await storage.getUser(payload.userId);
          if (user && !user.bannedAt) {
            req.user = user;
            req.token = token;
          }
        }
      }
    }
    next();
  } catch {
    next();
  }
}

export async function adminMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user || !isAdmin(req.user)) {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
}

export function generatePasswordResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
