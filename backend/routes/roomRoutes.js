import express from "express";
import Room from "../models/Room.js";
import Student from "../models/Student.js";
import { io } from "../server.js";

const router = express.Router();

// Get all rooms
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find().populate("occupants");
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create room + emit real-time update
router.post("/", async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);

    const roomNumber = req.body.roomNumber;
    const capacity = Number(req.body.capacity);

    if (!roomNumber || !capacity) {
      return res.status(400).json({ message: "roomNumber and capacity are required" });
    }

    const existingRoom = await Room.findOne({ roomNumber });
    if (existingRoom) {
      return res.status(400).json({ message: "Room already exists" });
    }

    const newRoom = await Room.create({
      roomNumber,
      capacity,
      type: req.body.type || "Single",
      price: Number(req.body.price) || 0,
      occupants: []
    });

    // 🔔 REAL-TIME SIGNAL
    io.emit("rooms:updated");

    res.status(201).json(newRoom);
  } catch (error) {
    console.error("🔥 Create Room Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Delete room + emit real-time update
router.delete("/:id", async (req, res) => {
  try {
    const deletedRoom = await Room.findByIdAndDelete(req.params.id);

    if (!deletedRoom) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Remove room reference from students
    await Student.updateMany(
      { room: deletedRoom._id },
      { $unset: { room: "" } }
    );

    // 🔔 REAL-TIME SIGNAL
    io.emit("rooms:updated");

    res.json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error("Delete Room Error:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
