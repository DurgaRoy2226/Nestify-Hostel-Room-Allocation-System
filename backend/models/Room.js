import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  type: { type: String, default: "Single" },
  capacity: { type: Number, required: true },
  price: { type: Number, default: 0 },
  floor: { type: Number, default: 1 },
  block: { type: String, default: "A" },
  amenities: [String],
  occupants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  isOccupied: { type: Boolean, default: false }
});

export default mongoose.models.Room || mongoose.model("Room", roomSchema);