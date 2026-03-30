import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  course: { type: String },
  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", default: null },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  
  // ✅ NEW: Duration fields
  checkInDate: { type: Date, default: null },
  checkOutDate: { type: Date, default: null },
  
  feesStatus: { type: String, enum: ["paid", "pending", "overdue"], default: "pending" },
  feesHistory: [{
    amount: Number,
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ["success", "failed"], default: "success" }
  }],
  maintenanceRequests: [{
    issue: String,
    status: { type: String, enum: ["pending", "resolved"], default: "pending" },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Student || mongoose.model("Student", studentSchema);