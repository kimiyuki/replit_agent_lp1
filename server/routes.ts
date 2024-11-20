import type { Express } from "express";
import { db } from "../db";
import { contacts } from "@db/schema";
import { sendConfirmationEmail } from "./email";

export function registerRoutes(app: Express) {
  app.post("/api/contact", async (req, res) => {
    try {
      const contact = await db.insert(contacts).values({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone || null,
        message: req.body.message,
      }).returning();

      await sendConfirmationEmail({
        to: req.body.email,
        name: req.body.name,
      });

      res.json(contact[0]);
    } catch (error) {
      console.error("Contact submission error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
}
