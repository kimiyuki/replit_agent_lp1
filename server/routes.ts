import type { Express } from "express";
import { db } from "../db";
import { contacts } from "@db/schema";
import { sendConfirmationEmail } from "./email";

export function registerRoutes(app: Express) {
  app.post("/api/contact", async (req, res) => {
    try {
      // First, save the contact data
      const contact = await db.insert(contacts).values({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone || "",
        message: req.body.message,
      }).returning();

      try {
        // Then attempt to send the email
        await sendConfirmationEmail({
          to: req.body.email,
          name: req.body.name,
        });
        
        res.json({ ...contact[0], emailSent: true });
      } catch (emailError) {
        // If email fails, still return success but with a warning
        console.error("メール送信エラー:", emailError);
        res.json({ 
          ...contact[0], 
          emailSent: false,
          warning: "お問い合わせ内容は保存されましたが、確認メールの送信に失敗しました。担当者より改めてご連絡させていただきます。"
        });
      }
    } catch (error) {
      console.error("お問い合わせ送信エラー:", error);
      res.status(500).json({ 
        error: "申し訳ございませんが、システムエラーが発生しました。しばらく経ってからもう一度お試しください。" 
      });
    }
  });
}
