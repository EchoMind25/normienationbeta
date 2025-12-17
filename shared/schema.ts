import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, boolean, timestamp, decimal, uuid, primaryKey, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Token metrics for $NORMIE
export const tokenMetricsSchema = z.object({
  price: z.number(),
  priceChange24h: z.number(),
  marketCap: z.number(),
  marketCapChange24h: z.number(),
  volume24h: z.number(),
  liquidity: z.number(),
  totalSupply: z.number(),
  circulatingSupply: z.number(),
  burnedTokens: z.number(),
  lockedTokens: z.number(),
  holders: z.number(),
  lastUpdated: z.string(),
});

export type TokenMetrics = z.infer<typeof tokenMetricsSchema>;

// Price history for charts
export const pricePointSchema = z.object({
  timestamp: z.number(),
  price: z.number(),
  volume: z.number(),
});

export type PricePoint = z.infer<typeof pricePointSchema>;

// Dev buy transaction for chart markers
export const devBuySchema = z.object({
  signature: z.string(),
  timestamp: z.number(),
  amount: z.number(),
  price: z.number(),
});

export type DevBuy = z.infer<typeof devBuySchema>;

// Poll for community engagement
export const pollSchema = z.object({
  id: z.string(),
  question: z.string(),
  options: z.array(z.object({
    id: z.string(),
    text: z.string(),
    votes: z.number(),
  })),
  totalVotes: z.number(),
  endsAt: z.string().optional(),
  isActive: z.boolean(),
});

export type Poll = z.infer<typeof pollSchema>;

export const insertPollSchema = pollSchema.omit({ id: true, totalVotes: true });
export type InsertPoll = z.infer<typeof insertPollSchema>;

// Activity feed item
export const activityItemSchema = z.object({
  id: z.string(),
  type: z.enum(["burn", "lock", "trade", "milestone"]),
  message: z.string(),
  amount: z.number().optional(),
  timestamp: z.string(),
});

export type ActivityItem = z.infer<typeof activityItemSchema>;

// =====================================================
// PHASE 2: User Authentication & Profile Tables
// =====================================================

// Icons table for customizable profile icons
export const icons = pgTable("icons", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  fileUrl: text("file_url").notNull(),
  uploadedBy: uuid("uploaded_by"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertIconSchema = createInsertSchema(icons).omit({ id: true, createdAt: true });
export type InsertIcon = z.infer<typeof insertIconSchema>;
export type Icon = typeof icons.$inferSelect;

// Users table with wallet and email authentication
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  walletAddress: varchar("wallet_address", { length: 44 }).unique(),
  email: varchar("email", { length: 255 }).unique(),
  passwordHash: text("password_hash"),
  username: varchar("username", { length: 50 }).unique().notNull(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  selectedIconId: uuid("selected_icon_id").references(() => icons.id),
  role: varchar("role", { length: 20 }).default("user"),
  holdingsVisible: boolean("holdings_visible").default(false),
  bannedAt: timestamp("banned_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_users_wallet").on(table.walletAddress),
  index("idx_users_email").on(table.email),
]);

export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  bannedAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// User sessions for JWT token management
export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  token: varchar("token", { length: 500 }).unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_sessions_token").on(table.token),
]);

export const insertSessionSchema = createInsertSchema(sessions).omit({ id: true, createdAt: true });
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

// Password reset tokens
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  token: varchar("token", { length: 255 }).unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({ 
  id: true, 
  createdAt: true,
  used: true,
});
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

// =====================================================
// PHASE 2: NFT Tables
// =====================================================

// NFTs table
export const nfts = pgTable("nfts", {
  id: uuid("id").primaryKey().defaultRandom(),
  mintAddress: varchar("mint_address", { length: 44 }).unique().notNull(),
  ownerId: uuid("owner_id").references(() => users.id),
  creatorId: uuid("creator_id").references(() => users.id),
  metadataUri: text("metadata_uri").notNull(),
  name: varchar("name", { length: 100 }),
  description: text("description"),
  imageUrl: text("image_url"),
  priceSol: decimal("price_sol", { precision: 20, scale: 9 }),
  priceNormie: decimal("price_normie", { precision: 20, scale: 9 }),
  royaltyPercentage: decimal("royalty_percentage", { precision: 5, scale: 2 }).default("5.0"),
  status: varchar("status", { length: 20 }).default("minted"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_nfts_owner").on(table.ownerId),
  index("idx_nfts_status").on(table.status),
]);

export const insertNftSchema = createInsertSchema(nfts).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
});
export type InsertNft = z.infer<typeof insertNftSchema>;
export type Nft = typeof nfts.$inferSelect;

// NFT transactions
export const nftTransactions = pgTable("nft_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  nftId: uuid("nft_id").references(() => nfts.id),
  fromUserId: uuid("from_user_id").references(() => users.id),
  toUserId: uuid("to_user_id").references(() => users.id),
  transactionType: varchar("transaction_type", { length: 20 }),
  priceSol: decimal("price_sol", { precision: 20, scale: 9 }),
  priceNormie: decimal("price_normie", { precision: 20, scale: 9 }),
  txSignature: varchar("tx_signature", { length: 88 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNftTransactionSchema = createInsertSchema(nftTransactions).omit({ 
  id: true, 
  createdAt: true,
});
export type InsertNftTransaction = z.infer<typeof insertNftTransactionSchema>;
export type NftTransaction = typeof nftTransactions.$inferSelect;

// =====================================================
// PHASE 2: Chat Tables
// =====================================================

// Chat rooms
export const chatRooms = pgTable("chat_rooms", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(),
  creatorId: uuid("creator_id").references(() => users.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertChatRoomSchema = createInsertSchema(chatRooms).omit({ 
  id: true, 
  createdAt: true,
});
export type InsertChatRoom = z.infer<typeof insertChatRoomSchema>;
export type ChatRoom = typeof chatRooms.$inferSelect;

// Chat messages
export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  roomId: uuid("room_id").references(() => chatRooms.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id),
  content: text("content").notNull(),
  fileUrl: text("file_url"),
  isDeleted: boolean("is_deleted").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_chat_messages_room").on(table.roomId),
]);

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ 
  id: true, 
  createdAt: true,
  isDeleted: true,
});
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

// Chat room members
export const chatRoomMembers = pgTable("chat_room_members", {
  roomId: uuid("room_id").references(() => chatRooms.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  role: varchar("role", { length: 20 }).default("member"),
  encryptedKey: text("encrypted_key"),
  joinedAt: timestamp("joined_at").defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.roomId, table.userId] }),
]);

export const insertChatRoomMemberSchema = createInsertSchema(chatRoomMembers).omit({ 
  joinedAt: true,
});
export type InsertChatRoomMember = z.infer<typeof insertChatRoomMemberSchema>;
export type ChatRoomMember = typeof chatRoomMembers.$inferSelect;

// =====================================================
// Auth Challenge for Wallet Signature Verification
// =====================================================

export const authChallenges = pgTable("auth_challenges", {
  id: uuid("id").primaryKey().defaultRandom(),
  walletAddress: varchar("wallet_address", { length: 44 }).notNull(),
  challenge: varchar("challenge", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAuthChallengeSchema = createInsertSchema(authChallenges).omit({ 
  id: true, 
  createdAt: true,
  used: true,
});
export type InsertAuthChallenge = z.infer<typeof insertAuthChallengeSchema>;
export type AuthChallenge = typeof authChallenges.$inferSelect;

// =====================================================
// Normie token constants
// =====================================================

export const NORMIE_TOKEN = {
  address: "FrSFwE2BxWADEyUWFXDMAeomzuB4r83ZvzdG9sevpump",
  name: "NORMIE",
  symbol: "$NORMIE",
  decimals: 6,
  rpcEndpoint: "https://solana-rpc.publicnode.com",
  telegram: "@TheNormieNation",
  twitter: "@NormieCEO",
  description: "A 4chan-inspired memecoin focused on everyday 'normie' culture. Relentless burns, community raids, and merch empire.",
};

// Data sources:
// - DexScreener API for real-time token metrics (price, market cap, volume, liquidity)
// - Solana RPC for dev wallet transaction history
// - pump.fun for token info: https://pump.fun/coin/FrSFwE2BxWADEyUWFXDMAeomzuB4r83ZvzdG9sevpump
