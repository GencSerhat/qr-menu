import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = Router();

/**
 * POST /auth/login
 * body: { email, password }
 * return: { token, user: { id, name, email, role } }
 */

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "E-posta ve şifre gereklidir." });
    }
    const user = await User.findOne({
      email: email.toLowerCase(),
      isActive: true,
    });
    if (!user) {
      return res.status(401).json({ error: "Geçersiz kimlik bilgileri" });
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      return res.status(401).json({ error: "Geçersiz kimlik bilgileri" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res
        .status(500)
        .json({ error: "Sunucu yapılandırma hatası (JWT_SECRET yok)" });
    }
    const payload = { sub: user._id.toString(), role: user.role };
    const token = jwt.sign(payload, secret, { expiresIn: "7d" });

    res.json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("POST /auth/login error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
