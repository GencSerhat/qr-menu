import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import { connect } from "mongoose";

dotenv.config();

const {
  MONGODB_URI,
  ADMIN_EMAIL = "admin@example.com",
  ADMIN_PASSWORD = "admin12345",
  ADMIN_NAME = "Admin",
} = process.env;

async function main() {
  if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI .env içinde tanımlı olmalı");
    process.exit(1);
  }

  await connectDB(MONGODB_URI);

  const email = ADMIN_EMAIL.toLowerCase();
  let user = await User.findOne({ email });

  if (user) {
    console.log(`ℹ️  Kullanıcı zaten var: ${email} (şifre güncellenecek)`);
    user.passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    user.name = ADMIN_NAME;
    user.isActive = true;
    await user.save();
  } else {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    user = await User.create({
      name: ADMIN_NAME,
      email,
      passwordHash,
      role: "admin",
      isActive: true,
    });
    console.log(`✅ Admin oluşturuldu: ${email}`);
  }
  console.log("🎯 Giriş bilgileri ->", { email, password: ADMIN_PASSWORD });
  process.exit(0);
}
main().catch((e) => {
  console.error("❌ Seed hatası:", e);
  process.exit(1);
});
