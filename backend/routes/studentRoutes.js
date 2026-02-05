import express from 'express';
import { Student, Room } from '../models/Schemas.js';

const router = express.Router();

// Get all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().populate('room');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get student by ID
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('room');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new student
router.post('/', async (req, res) => {
  try {
    const { name, email, course, year } = req.body;
    
    // Check if student already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student already exists' });
    }
    
    const newStudent = new Student({
      name,
      email,
      course,
      year
    });
    
    await newStudent.save();
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update student
router.put('/:id', async (req, res) => {
  try {
    const { name, email, course, year } = req.body;
    
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      { name, email, course, year },
      { new: true }
    );
    
    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete student
router.delete('/:id', async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    
    if (!deletedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // If student had a room, remove them from it
    if (deletedStudent.room) {
      await Room.findByIdAndUpdate(deletedStudent.room, {
        $pull: { occupants: deletedStudent._id }
      });
    }
    
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Allocate room to student
router.patch('/:id/allocate/:roomId', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    const room = await Room.findById(req.params.roomId);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // Check if room is full
    if (room.occupants.length >= room.capacity) {
      return res.status(400).json({ message: 'Room is full' });
    }
    
    // Remove student from previous room if they had one
    if (student.room) {
      await Room.findByIdAndUpdate(student.room, {
        $pull: { occupants: student._id }
      });
    }
    
    // Allocate new room
    student.room = room._id;
    room.occupants.push(student._id);
    
    await student.save();
    await room.save();
    
    res.json({ message: 'Room allocated successfully', student, room });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Deallocate room from student
router.patch('/:id/deallocate', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // If student doesn't have a room
    if (!student.room) {
      return res.status(400).json({ message: 'Student is not allocated to any room' });
    }
    
    // Remove student from room
    await Room.findByIdAndUpdate(student.room, {
      $pull: { occupants: student._id }
    });
    
    // Remove room from student
    student.room = null;
    await student.save();
    
    res.json({ message: 'Room deallocated successfully', student });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;