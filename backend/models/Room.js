const roomSchema = new mongoose.Schema({
  roomNumber: String,
  capacity: Number,
  occupied: { type: Number, default: 0 }
});

export default mongoose.model("Room", roomSchema);
