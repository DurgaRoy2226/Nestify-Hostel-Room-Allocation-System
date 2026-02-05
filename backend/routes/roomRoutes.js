import express from 'express';
import { Room, Student } from '../models/Schemas.js';

const router = express.Router();

// Get all rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find().populate('occupants');
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get room by ID
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('occupants');
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new room (Admin only)
router.post('/', async (req, res) => {
  try {
    const { roomNumber, type, capacity, price } = req.body;
    
    // Check if room already exists
    const existingRoom = await Room.findOne({ roomNumber });
    if (existingRoom) {
      return res.status(400).json({ message: 'Room already exists' });
    }
    
    const newRoom = new Room({
      roomNumber,
      type,
      capacity,
      price
    });
    
    await newRoom.save();
    res.status(201).json(newRoom);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update room (Admin only)
router.put('/:id', async (req, res) => {
  try {
    const { roomNumber, type, capacity, price } = req.body;
    
    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      { roomNumber, type, capacity, price },
      { new: true }
    );
    
    if (!updatedRoom) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    res.json(updatedRoom);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete room (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const deletedRoom = await Room.findByIdAndDelete(req.params.id);
    
    if (!deletedRoom) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // Remove room reference from students
    await Student.updateMany(
      { room: deletedRoom._id },
      { $unset: { room: "" } }
    );
    
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;