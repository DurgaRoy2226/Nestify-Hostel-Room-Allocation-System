import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["student", "admin"],
    default: "student"  // ✅ FIX: default student, admin nahi
  },
  isApproved: { type: Boolean, default: false }, // ✅ NEW: admin approve karega
  phone: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.User || mongoose.model("User", userSchema);
