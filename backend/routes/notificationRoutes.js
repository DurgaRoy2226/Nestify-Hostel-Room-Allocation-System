import express from "express";
import { protect } from "../middleware/auth.js";
import Notification from "../models/Notification.js";

const router = express.Router();

// Get my notifications
router.get("/", protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark all as read
router.put("/mark-read", protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.userId, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ message: "Marked all as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
