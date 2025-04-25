import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Base schema for users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// API Call logs for rate limiting
export const apiCalls = pgTable("api_calls", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  callType: text("call_type").notNull(),
});

export const insertApiCallSchema = createInsertSchema(apiCalls).pick({
  userId: true,
  callType: true,
});

// Templates
export const templateTypes = [
  "general",
  "research",
  "creative",
  "tech",
  "technical_tutorial",
  "business_case_study",
  "narrative_essay",
  "code_documentation",
] as const;

export const templateSchema = z.enum(templateTypes);

// Request schemas
export const generatePromptSchema = z.object({
  prompt: z.string().min(1),
  template: templateSchema.default("general"),
});

export const refinePromptSchema = z.object({
  prompt: z.string().min(1),
  additional_input: z.string().min(1),
  refinement_count: z.number().int().min(0),
  choice: z.enum(["add_context"]),
});

export const testPromptSchema = z.object({
  prompt: z.string().min(1),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertApiCall = z.infer<typeof insertApiCallSchema>;
export type ApiCall = typeof apiCalls.$inferSelect;
export type TemplateType = z.infer<typeof templateSchema>;
export type GeneratePromptRequest = z.infer<typeof generatePromptSchema>;
export type RefinePromptRequest = z.infer<typeof refinePromptSchema>;
export type TestPromptRequest = z.infer<typeof testPromptSchema>;
