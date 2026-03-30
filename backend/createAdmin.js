import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // Pehle check karo admin already hai ya nahi
    const existing = await User.findOne({ role: "admin" });
    if (existing) {
      console.log("⚠️ Admin already exists:", existing.email);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    const admin = new User({
      name: "Admin",
      email: "admin@nestify.com",
      password: hashedPassword,
      role: "admin",
      isApproved: true,
    });

    await admin.save();
    console.log("👑 Admin created successfully!");
    console.log("📧 Email: admin@nestify.com");
    console.log("🔑 Password: Admin@123");

  } catch (e) {
    console.error("❌ Error:", e.message);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
};

createAdmin();