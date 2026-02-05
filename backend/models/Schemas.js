import mongoose from 'mongoose';

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'student'],
    default: 'student'
  }
}, {
  timestamps: true
});

// Student Schema
const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  course: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    default: null
  }
}, {
  timestamps: true
});

// Room Schema
const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['single', 'double', 'triple', 'dormitory']
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  occupants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  price: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

export const User = mongoose.model('User', userSchema);
export const Student = mongoose.model('Student', studentSchema);
export const Room = mongoose.model('Room', roomSchema);