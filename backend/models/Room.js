import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: true,
      unique: true,
    },

    capacity: {
      type: Number,
      required: true,
      default: 1,
    },

    // ✅ Single / Double / Triple
    type: {
      type: String,
      enum: ["Single", "Double", "Triple"],
      default: "Single",
    },

    // ✅ NEW (frontend se aa raha hai)
    price: {
      type: Number,
      default: 0,
    },

    block: {
      type: String,
      default: "A",
    },

    floor: {
      type: Number,
      default: 1,
    },

    // ✅ occupancy tracking
    occupiedBeds: {
      type: Number,
      default: 0,
    },

    beds: [
      {
        bedNumber: Number,
        isOccupied: {
          type: Boolean,
          default: false,
        },
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
          default: null,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Room", roomSchema);