import express from "express";
import Room from "../models/Room.js";

const router = express.Router();

// ✅ CREATE ROOM
router.post("/", async (req, res) => {
  try {
    const { roomNumber, capacity, type, floor, price, block } = req.body;

    const room = new Room({
      roomNumber,
      capacity,
      type,
      floor,
      price,
      block,
    });

    // ✅ Auto create beds
    const beds = [];
    for (let i = 1; i <= capacity; i++) {
      beds.push({
        bedNumber: i,
        isOccupied: false,
      });
    }

    room.beds = beds;

    await room.save();

    res.status(201).json({
      success: true,
      message: "Room created successfully",
      room,
    });
  } catch (error) {
    console.log("ROOM CREATE ERROR:", error); // 👈 important
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ✅ GET ALL ROOMS
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find();

    res.json({
      success: true,
      rooms,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ✅ GET AVAILABLE ROOMS
router.get("/available", async (req, res) => {
  try {
    const rooms = await Room.find();

    const availableRooms = rooms.map((room) => {
      const freeBeds = room.beds.filter((bed) => !bed.isOccupied);

      return {
        _id: room._id,
        roomNumber: room.roomNumber,
        capacity: room.capacity,
        occupiedBeds: room.occupiedBeds,
        freeBeds: freeBeds.length,
        beds: room.beds,
        type: room.type,
        floor: room.floor,
        price: room.price,
        block: room.block,
      };
    });

    res.json({
      success: true,
      rooms: availableRooms,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;