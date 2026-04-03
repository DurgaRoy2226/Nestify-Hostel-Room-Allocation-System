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

// ✅ Get all maintenance issues
router.get('/maintenance', protect, adminOnly, async (req, res) => {
  try {
    const students = await Student.find({ 'maintenanceRequests.0': { $exists: true } }).populate('room');
    
    let allIssues = [];
    students.forEach(student => {
      student.maintenanceRequests.forEach(issue => {
        allIssues.push({
          ...issue.toObject(),
          studentId: student._id,
          studentName: student.name,
          roomNumber: student.room ? student.room.roomNumber : 'Unassigned',
          userId: student.userId
        });
      });
    });

    // Sort by newest first
    allIssues.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(allIssues);
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

// ✅ Resolve maintenance issue
router.put('/maintenance/:studentId/:issueId/resolve', protect, adminOnly, async (req, res) => {
  try {
    const { studentId, issueId } = req.params;
    
    const student = await Student.findOneAndUpdate(
      { _id: studentId, "maintenanceRequests._id": issueId },
      { $set: { "maintenanceRequests.$.status": "resolved" } },
      { new: true }
    );

    if (!student) return res.status(404).json({ message: 'Student or issue not found' });

    // Try to notify the student
    try {
      if (student.userId) {
        const { default: Notification } = await import('../models/Notification.js');
        await Notification.create({
          userId: student.userId,
          message: "Your maintenance request has been resolved.",
          type: "success"
        });
      }
    } catch (notifErr) {
      console.log('Notification error: ', notifErr);
    }

    res.json({ message: 'Issue resolved successfully' });
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

export default router;