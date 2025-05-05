import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Gallery items table to store example images
export const galleryItems = pgTable("gallery_items", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  clothingType: text("clothing_type").notNull(),
  displayOrder: integer("display_order").default(0),
});

// Upload history to track user uploads
export const uploadHistory = pgTable("upload_history", {
  id: serial("id").primaryKey(),
  originalImageUrl: text("original_image_url").notNull(),
  processedImageUrl: text("processed_image_url"),
  clothingType: text("clothing_type"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

// Define schemas for data validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertGalleryItemSchema = createInsertSchema(galleryItems).pick({
  imageUrl: true,
  clothingType: true,
  displayOrder: true,
});

export const insertUploadHistorySchema = createInsertSchema(uploadHistory).pick({
  originalImageUrl: true,
  processedImageUrl: true,
  clothingType: true,
});

// Define types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertGalleryItem = z.infer<typeof insertGalleryItemSchema>;
export type GalleryItem = typeof galleryItems.$inferSelect;

export type InsertUploadHistory = z.infer<typeof insertUploadHistorySchema>;
export type UploadHistory = typeof uploadHistory.$inferSelect;
