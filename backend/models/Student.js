const studentSchema = new mongoose.Schema({
  name: String,
  email: String,
  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room" }
});

export default mongoose.model("Student", studentSchema);
