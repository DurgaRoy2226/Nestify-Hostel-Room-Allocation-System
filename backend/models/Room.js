import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  type: { type: String, default: "Single" },   // ❌ enum nahi hona chahiye
  capacity: { type: Number, required: true },
  price: { type: Number, default: 0 },
  occupants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }]
});

export default mongoose.models.Room || mongoose.model("Room", roomSchema);
