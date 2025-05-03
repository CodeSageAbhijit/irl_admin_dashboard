import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
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

// Simplified Inventory Items Schema
export const items = pgTable("items", {
  id: serial("id").primaryKey(), // Unique identifier
  name: text("name").notNull(), // Name of the item
  image_url: text("image_url"), // URL for the item image
  quantity: integer("quantity").notNull().default(0), // Quantity in stock
});


// Zod schemas
export const insertItemSchema = createInsertSchema(items).pick({
  name: true,
  // category: true,
  quantity: true,
  // description: true, // ✅ renamed
  image_url: true,
});

export const updateItemSchema = createInsertSchema(items).pick({
  name: true,
  // category: true,
  quantity: true,
  // description: true, // ✅ renamed
  image_url: true,
});

export type InsertItem = z.infer<typeof insertItemSchema>;
export type UpdateItem = z.infer<typeof updateItemSchema>;
export type Item = typeof items.$inferSelect;
