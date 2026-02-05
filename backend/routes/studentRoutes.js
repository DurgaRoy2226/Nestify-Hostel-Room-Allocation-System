import express from "express";
import Student from "../models/Student.js";
import Room from "../models/Room.js";

const router = express.Router();

// Get all students (with room populated)
router.get("/", async (req, res) => {
  try {
    const students = await Student.find().populate("room");
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create student + assign room safely
router.post("/", async (req, res) => {
  try {
    const { name, email, course, room } = req.body;

    let assignedRoom = null;

    if (room) {
      const roomDoc = await Room.findById(room).populate("occupants");

      if (!roomDoc) {
        return res.status(404).json({ message: "Room not found" });
      }

      if ((roomDoc.occupants?.length || 0) >= roomDoc.capacity) {
        return res.status(400).json({ message: "Room is full" });
      }

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

// Change student's room (re-assign)
router.put("/:id/change-room", async (req, res) => {
  try {
    const { room } = req.body;
    const student = await Student.findById(req.params.id);

    if (!student) return res.status(404).json({ message: "Student not found" });

    // Remove from old room
    if (student.room) {
      await Room.findByIdAndUpdate(student.room, {
        $pull: { occupants: student._id }
      });
    }

    // Assign to new room (if provided)
    if (room) {
      const roomDoc = await Room.findById(room).populate("occupants");

      if (!roomDoc) {
        return res.status(404).json({ message: "Room not found" });
      }

      if ((roomDoc.occupants?.length || 0) >= roomDoc.capacity) {
        return res.status(400).json({ message: "Room is full" });
      }

      await Room.findByIdAndUpdate(room, {
        $push: { occupants: student._id }
      });

      student.room = room;
    } else {
      student.room = null;
    }

    await student.save();
    res.json({ message: "Room changed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete student + free room occupancy
router.delete("/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (student?.room) {
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
