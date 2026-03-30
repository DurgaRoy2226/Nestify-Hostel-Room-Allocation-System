import express from 'express';
import User from '../models/User.js';
import Student from '../models/Student.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// ✅ Pending approvals list
router.get('/pending-users', protect, adminOnly, async (req, res) => {
  try {
    const pending = await User.find({ role: 'student', isApproved: false });
    res.json(pending);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Approve student
router.put('/approve/:userId', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isApproved: true },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Auto-create student profile
    const existing = await Student.findOne({ userId: user._id });
    if (!existing) {
      await Student.create({ name: user.name, email: user.email, userId: user._id });
    }

    res.json({ message: 'Student approved', user });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Reject/Delete student
router.delete('/reject/:userId', protect, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.json({ message: 'User rejected and deleted' });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;