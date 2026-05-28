import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const roastsTable = pgTable("roasts", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  avatarUrl: text("avatar_url"),
  roast: text("roast").notNull(),
  intensity: text("intensity").notNull().default("medium"),
  publicRepos: integer("public_repos").default(0),
  followers: integer("followers").default(0),
  topLanguage: text("top_language"),
  totalStars: integer("total_stars").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRoastSchema = createInsertSchema(roastsTable).omit({ id: true, createdAt: true });
export type InsertRoast = z.infer<typeof insertRoastSchema>;
export type Roast = typeof roastsTable.$inferSelect;
