import express from "express";
import Room from "../models/Room.js";
import Student from "../models/Student.js";

const router = express.Router();

router.get("/stats", async (req, res) => {
  try {
    const totalRooms = await Room.countDocuments();
    const totalStudents = await Student.countDocuments();
    const occupiedRooms = await Room.countDocuments({ isOccupied: true });
    const availableRooms = totalRooms - occupiedRooms;

    res.json({
      totalRooms,
      totalStudents,
      occupiedRooms,
      availableRooms,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
