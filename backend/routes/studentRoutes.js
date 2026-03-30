import express from "express";
import Student from "../models/Student.js";
import Room from "../models/Room.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// ✅ Stats route — sabse pehle
router.get("/stats", protect, async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    res.json({ totalStudents });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get my profile — Student apna data dekhe
router.get("/me", protect, async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.userId }).populate("room");
    if (!student) return res.status(404).json({ message: "Student profile not found" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get all students — Admin only
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const students = await Student.find().populate("room");
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Create student — Admin only
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { name, email, course, room } = req.body;
    let assignedRoom = null;

    if (room) {
      const roomDoc = await Room.findById(room).populate("occupants");
      if (!roomDoc) return res.status(404).json({ message: "Room not found" });
      if ((roomDoc.occupants?.length || 0) >= roomDoc.capacity)
        return res.status(400).json({ message: "Room is full" });
      assignedRoom = roomDoc._id;
    }

    const student = await Student.create({ name, email, course, room: assignedRoom });

    if (assignedRoom) {
      await Room.findByIdAndUpdate(assignedRoom, {
        $push: { occupants: student._id }
      });
    }

    res.status(201).json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Update student room + dates — Admin only
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate } = req.body;
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Remove from old room
    if (student.room && student.room.toString() !== room) {
      await Room.findByIdAndUpdate(student.room, {
        $pull: { occupants: student._id }
      });
    }

    // Assign new room
    if (room && student.room?.toString() !== room) {
      const roomDoc = await Room.findById(room).populate("occupants");
      if (!roomDoc) return res.status(404).json({ message: "Room not found" });
      if ((roomDoc.occupants?.length || 0) >= roomDoc.capacity)
        return res.status(400).json({ message: "Room is full" });

      await Room.findByIdAndUpdate(room, {
        $push: { occupants: student._id }
      });
      student.room = room;
    } else if (!room) {
      student.room = null;
    }

    if (checkInDate) student.checkInDate = new Date(checkInDate);
    if (checkOutDate) student.checkOutDate = new Date(checkOutDate);

    await student.save();
    const updated = await Student.findById(student._id).populate("room");
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Maintenance request — Student
router.post("/maintenance", protect, async (req, res) => {
  try {
    const { issue } = req.body;
    if (!issue) return res.status(400).json({ message: "Issue required" });

    const student = await Student.findOneAndUpdate(
      { userId: req.user.userId },
      { $push: { maintenanceRequests: { issue, status: "pending" } } },
      { new: true }
    );

    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json({ message: "Maintenance request submitted!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Delete student — Admin only
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (student.room) {
      await Room.findByIdAndUpdate(student.room, {
        $pull: { occupants: student._id }
      });
    }

    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;