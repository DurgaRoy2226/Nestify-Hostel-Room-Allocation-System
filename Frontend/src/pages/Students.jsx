import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { socket } from "../socket";

const Students = () => {
  const { token } = useAuth();

  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [course, setCourse] = useState("");
  const [roomId, setRoomId] = useState("");

  const fetchStudentsAndRooms = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const [studentsRes, roomsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/students", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/rooms", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);
      setRooms(Array.isArray(roomsRes.data) ? roomsRes.data : []);
    } catch (err) {
      console.error("Fetch students error:", err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Initial fetch
  useEffect(() => {
    fetchStudentsAndRooms();
  }, [fetchStudentsAndRooms]);

  // 🔌 Socket listeners (REAL-TIME)
  useEffect(() => {
    socket.on("students:updated", fetchStudentsAndRooms);
    socket.on("rooms:updated", fetchStudentsAndRooms);

    return () => {
      socket.off("students:updated", fetchStudentsAndRooms);
      socket.off("rooms:updated", fetchStudentsAndRooms);
    };
  }, [fetchStudentsAndRooms]);

  const addStudent = async () => {
    if (!name || !email) return alert("Name and Email required");

    try {
      await axios.post(
        "http://localhost:5000/api/students",
        { name, email, course, room: roomId || null },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setName("");
      setEmail("");
      setCourse("");
      setRoomId("");
      fetchStudentsAndRooms();
    } catch (err) {
      console.error("Add student error:", err?.response?.data || err.message);
      alert("Failed to add student");
    }
  };

  const removeStudent = async (id) => {
    if (!window.confirm("Delete this student?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/students/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchStudentsAndRooms();
    } catch (err) {
      console.error("Delete student error:", err?.response?.data || err.message);
      alert("Failed to delete student");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-8">Students</h1>

      {/* Add Student */}
      <div className="glass-card rounded-3xl p-6 mb-10 grid grid-cols-1 md:grid-cols-5 gap-4">
        <input
          className="bg-transparent border border-white/20 rounded-xl p-3 outline-none"
          placeholder="Student Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="bg-transparent border border-white/20 rounded-xl p-3 outline-none"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="bg-transparent border border-white/20 rounded-xl p-3 outline-none"
          placeholder="Course"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
        />
        <select
          className="bg-transparent border border-white/20 rounded-xl p-3 outline-none text-white"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        >
          <option value="">Assign Room (optional)</option>
          {rooms.map((room) => (
            <option key={room._id} value={room._id} className="text-black">
              Room {room.roomNumber} ({room.occupants?.length || 0}/{room.capacity})
            </option>
          ))}
        </select>
        <button
          onClick={addStudent}
          className="px-6 py-3 rounded-xl bg-primary-500 text-black font-semibold hover:opacity-90"
        >
          Add Student
        </button>
      </div>

      {/* Students List */}
      {loading ? (
        <p>Loading students...</p>
      ) : students.length === 0 ? (
        <div className="glass-card rounded-3xl p-10 text-center text-dark-400">
          No students yet. Add your first student ✨
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {students.map((student) => (
            <div key={student._id} className="glass-card rounded-3xl p-6 hover-lift">
              <h3 className="text-xl font-semibold">{student.name}</h3>
              <p className="text-dark-400 mt-1">{student.email}</p>
              <p className="text-dark-400 mt-1">Course: {student.course || "N/A"}</p>
              <p className="text-dark-400 mt-1">
                Room: {student.room?.roomNumber || "Not Assigned"}
              </p>

              <button
                onClick={() => removeStudent(student._id)}
                className="mt-4 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Students;
