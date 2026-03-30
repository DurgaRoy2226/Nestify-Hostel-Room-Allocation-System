import express from 'express';
import Student from '../models/Student.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/verify', protect, async (req, res) => {
  try {
    const { studentId, amount } = req.body;
    await Student.findByIdAndUpdate(studentId, {
      feesStatus: 'paid',
      $push: {
        feesHistory: {
          amount,
          date: new Date(),
          status: 'success'
        }
      }
    });
    res.json({ message: 'Payment recorded!' });
  } catch (e) {
    res.status(500).json({ message: 'Failed', error: e.message });
  }
});

export default router;