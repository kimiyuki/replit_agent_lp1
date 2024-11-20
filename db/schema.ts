import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const contacts = pgTable("contacts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  subject: text("subject").default("").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").default(""),
  company: text("company").default(""),
  department: text("department").default(""),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertContactSchema = createInsertSchema(contacts, {
  name: z.string().min(1, "名前は必須です"),
  email: z.string().email("正しいメールアドレスを入力してください"),
  phone: z.string().optional(),
  message: z.string().min(1, "メッセージは必須です"),
});

export const insertUserSchema = createInsertSchema(users, {
  username: z.string().min(1, "ユーザー名は必須です"),
  password: z.string().min(6, "パスワードは6文字以上必要です"),
});

export const selectContactSchema = createSelectSchema(contacts);
export const selectUserSchema = createSelectSchema(users);

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = z.infer<typeof selectContactSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof selectUserSchema>;
