import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const contacts = pgTable("contacts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").default(""),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertContactSchema = createInsertSchema(contacts, {
  name: z.string().min(1, "名前は必須です"),
  email: z.string().email("正しいメールアドレスを入力してください"),
  phone: z.string().optional(),
  message: z.string().min(1, "メッセージは必須です"),
});

export const selectContactSchema = createSelectSchema(contacts);
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = z.infer<typeof selectContactSchema>;
