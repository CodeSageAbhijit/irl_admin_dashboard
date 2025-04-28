import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Inventory items schema
export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  itemId: text("item_id").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  quantity: integer("quantity").notNull().default(0),
  status: text("status").notNull().default("In Stock"),
  notes: text("notes"),
  imageUrl: text("image_url"),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

export const insertItemSchema = createInsertSchema(items).pick({
  name: true,
  category: true,
  quantity: true,
  notes: true,
  imageUrl: true,
});

export const updateItemSchema = createInsertSchema(items).pick({
  name: true,
  category: true,
  quantity: true,
  notes: true,
  imageUrl: true,
});

export type InsertItem = z.infer<typeof insertItemSchema>;
export type UpdateItem = z.infer<typeof updateItemSchema>;
export type Item = typeof items.$inferSelect;
