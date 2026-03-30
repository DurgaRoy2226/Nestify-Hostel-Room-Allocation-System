import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { socket } from "../socket";

const getDaysLeft = (checkOutDate) => {
  if (!checkOutDate) return null;
  return Math.ceil((new Date(checkOutDate) - new Date()) / (1000 * 60 * 60 * 24));
};

const DaysLeftBadge = ({ checkOutDate }) => {
  const days = getDaysLeft(checkOutDate);
  if (days === null) return null;
  if (days <= 0) return (
    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
      style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444' }}>
      🔴 Overdue!
    </span>
  );
  if (days <= 7) return (
    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
      style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b' }}>
      ⚠️ {days} days left
    </span>
  );
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
      style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
      ✅ {days} days left
    </span>
  );
};

const Students = () => {
  const { token } = useAuth();
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  // Add student form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [course, setCourse] = useState("");
  const [roomId, setRoomId] = useState("");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [assignRoomId, setAssignRoomId] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const [sRes, rRes] = await Promise.all([
        axios.get("http://localhost:5000/api/students", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get("http://localhost:5000/api/rooms", {
          headers: { Authorization: `Bearer ${token}` }
        }),
      ]);
      setStudents(Array.isArray(sRes.data) ? sRes.data : []);
      setRooms(Array.isArray(rRes.data) ? rRes.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    socket.on("students:updated", fetchData);
    socket.on("rooms:updated", fetchData);
    return () => {
      socket.off("students:updated", fetchData);
      socket.off("rooms:updated", fetchData);
    };
  }, [fetchData]);

  const addStudent = async () => {
    if (!name || !email) return alert("Name and Email required");
    try {
      await axios.post("http://localhost:5000/api/students",
        { name, email, course, room: roomId || null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setName(""); setEmail(""); setCourse(""); setRoomId("");
      fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to add student");
    }
  };

  const removeStudent = async (id) => {
    if (!window.confirm("Delete this student?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/students/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      alert("Failed to delete student");
    }
  };

  const openAssignModal = (student) => {
    setSelectedStudent(student);
    setAssignRoomId(student.room?._id || "");
    setCheckInDate(student.checkInDate ? student.checkInDate.split('T')[0] : "");
    setCheckOutDate(student.checkOutDate ? student.checkOutDate.split('T')[0] : "");
    setShowModal(true);
  };

  const handleAssignRoom = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/students/${selectedStudent._id}`,
        {
          room: assignRoomId || null,
          checkInDate: checkInDate || null,
          checkOutDate: checkOutDate || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to assign room");
    }
  };

  // Filter logic
  const filteredStudents = students.filter(s => {
    if (filter === "assigned") return s.room;
    if (filter === "unassigned") return !s.room;
    if (filter === "vacating") {
      const days = getDaysLeft(s.checkOutDate);
      return days !== null && days <= 7;
    }
    return true;
  });

  const assignedCount = students.filter(s => s.room).length;
  const unassignedCount = students.filter(s => !s.room).length;
  const vacatingCount = students.filter(s => {
    const days = getDaysLeft(s.checkOutDate);
    return days !== null && days <= 7;
  }).length;

  const durationDays = checkInDate && checkOutDate
    ? Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="app-bg p-6 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold"
          style={{ background: 'linear-gradient(135deg, #ffb703, #ff5f6d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          👥 Students
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage students, room assignments and checkout dates</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-3 mb-8">
        {[
          { key: "all", label: "All Students", count: students.length, icon: "👥" },
          { key: "assigned", label: "Room Assigned", count: assignedCount, icon: "✅" },
          { key: "unassigned", label: "Not Assigned", count: unassignedCount, icon: "❌" },
          { key: "vacating", label: "Vacating Soon", count: vacatingCount, icon: "⚠️" },
        ].map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: filter === tab.key
                ? 'linear-gradient(135deg, #ff8a00, #ff5f6d)'
                : 'rgba(255,255,255,0.08)',
              color: filter === tab.key ? 'white' : 'var(--text-muted)',
              border: filter === tab.key ? 'none' : '1px solid rgba(255,255,255,0.12)'
            }}>
            {tab.icon} {tab.label}
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs"
              style={{ background: 'rgba(255,255,255,0.2)' }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Add Student Form */}
      <div className="glass-panel rounded-2xl p-5 mb-8">
        <h2 className="font-bold mb-4 text-base">➕ Add New Student</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            className="bg-transparent border border-white/20 rounded-xl p-3 outline-none text-white text-sm"
            placeholder="Student Name" value={name}
            onChange={(e) => setName(e.target.value)} />
          <input
            className="bg-transparent border border-white/20 rounded-xl p-3 outline-none text-white text-sm"
            placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)} />
          <input
            className="bg-transparent border border-white/20 rounded-xl p-3 outline-none text-white text-sm"
            placeholder="Course" value={course}
            onChange={(e) => setCourse(e.target.value)} />
          <select
            className="border border-white/20 rounded-xl p-3 outline-none text-white text-sm"
            style={{ background: 'rgba(255,255,255,0.05)' }}
            value={roomId} onChange={(e) => setRoomId(e.target.value)}>
            <option value="">Assign Room (optional)</option>
            {rooms.map(room => (
              <option key={room._id} value={room._id} className="text-black">
                Room {room.roomNumber} ({room.occupants?.length || 0}/{room.capacity})
              </option>
            ))}
          </select>
          <button onClick={addStudent} className="neon-btn px-4 py-3 text-white font-semibold text-sm">
            Add Student
          </button>
        </div>
      </div>

      {/* Students Grid */}
      {loading ? (
        <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
          <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: '#ff8a00', borderTopColor: 'transparent' }} />
          Loading students...
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="glass-panel rounded-2xl p-10 text-center">
          <div className="text-5xl mb-3">👥</div>
          <p style={{ color: 'var(--text-muted)' }}>No students found in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {filteredStudents.map(student => {
            const daysLeft = getDaysLeft(student.checkOutDate);
            return (
              <div key={student._id} className="glass-panel rounded-2xl p-5 hover-lift">
                {/* Student Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #ff8a00, #ff5f6d)', fontSize: '16px' }}>
                    {student.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white truncate">{student.name}</h3>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{student.email}</p>
                  </div>
                  <DaysLeftBadge checkOutDate={student.checkOutDate} />
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-muted)' }}>Course</span>
                    <span className="text-white">{student.course || "N/A"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-muted)' }}>Room</span>
                    <span style={{ color: student.room ? '#22c55e' : '#ef4444' }} className="font-semibold">
                      {student.room ? `Room ${student.room.roomNumber}` : "Not Assigned"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-muted)' }}>Fees</span>
                    <span style={{ color: student.feesStatus === 'paid' ? '#22c55e' : '#f59e0b' }}>
                      {student.feesStatus === 'paid' ? '✅ Paid' : '⏳ Pending'}
                    </span>
                  </div>

                  {/* Check-in / Check-out */}
                  {student.checkInDate && (
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'var(--text-muted)' }}>Check-in</span>
                      <span className="text-white">
                        {new Date(student.checkInDate).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  )}
                  {student.checkOutDate && (
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'var(--text-muted)' }}>Check-out</span>
                      <span style={{
                        color: daysLeft <= 0 ? '#ef4444' : daysLeft <= 7 ? '#f59e0b' : '#22c55e',
                        fontWeight: daysLeft <= 7 ? '600' : '400'
                      }}>
                        {new Date(student.checkOutDate).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  )}

                  {/* Duration */}
                  {student.checkInDate && student.checkOutDate && (
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'var(--text-muted)' }}>Duration</span>
                      <span style={{ color: '#ffb703' }}>
                        {Math.ceil((new Date(student.checkOutDate) - new Date(student.checkInDate)) / (1000 * 60 * 60 * 24))} days
                      </span>
                    </div>
                  )}
                </div>

                {/* Room Status Badge */}
                <div className="mb-4 px-3 py-1.5 rounded-lg text-xs text-center font-semibold"
                  style={{
                    background: student.room ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                    border: `1px solid ${student.room ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    color: student.room ? '#22c55e' : '#ef4444'
                  }}>
                  {student.room ? `✅ Room ${student.room.roomNumber} Assigned` : '❌ No Room Assigned'}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button onClick={() => openAssignModal(student)}
                    className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                    style={{ background: 'rgba(255,138,0,0.2)', border: '1px solid rgba(255,138,0,0.4)', color: '#ffb703' }}>
                    🏠 {student.room ? 'Edit / Change' : 'Assign Room'}
                  </button>
                  <button onClick={() => removeStudent(student._id)}
                    className="px-3 py-2 rounded-xl text-sm transition-all hover:scale-105"
                    style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Assign Room Modal */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-panel rounded-2xl p-8 w-full max-w-md mx-4 fade-in"
            style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">🏠 Assign Room & Duration</h2>
              <button onClick={() => setShowModal(false)}
                className="text-2xl hover:text-white transition"
                style={{ color: 'var(--text-muted)' }}>×</button>
            </div>

            {/* Student Info */}
            <div className="p-4 rounded-xl mb-5"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p className="font-bold text-white">{selectedStudent.name}</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{selectedStudent.email}</p>
              <p className="text-sm mt-1">
                Current Room:{' '}
                <span style={{ color: selectedStudent.room ? '#22c55e' : '#ef4444' }}>
                  {selectedStudent.room ? `Room ${selectedStudent.room.roomNumber}` : 'Not Assigned'}
                </span>
              </p>
            </div>

            {/* Room Select */}
            <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
              🏠 Select Room:
            </label>
            <select value={assignRoomId} onChange={(e) => setAssignRoomId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl outline-none text-white mb-4"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <option value="">❌ Remove Room Assignment</option>
              {rooms.map(room => (
                <option key={room._id} value={room._id} className="text-black">
                  Room {room.roomNumber} — {room.type} — {room.occupants?.length || 0}/{room.capacity} — ₹{room.price}/mo
                </option>
              ))}
            </select>

            {/* Check-in Date */}
            <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
              📅 Check-in Date:
            </label>
            <input type="date" value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl outline-none text-white mb-4"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', colorScheme: 'dark' }} />

            {/* Check-out Date */}
            <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
              📅 Check-out Date:
            </label>
            <input type="date" value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl outline-none text-white mb-4"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', colorScheme: 'dark' }} />

            {/* Duration Preview */}
            {durationDays !== null && durationDays > 0 && (
              <div className="p-3 rounded-xl mb-5 text-center text-sm"
                style={{ background: 'rgba(255,183,3,0.1)', border: '1px solid rgba(255,183,3,0.3)', color: '#ffb703' }}>
                📅 Total Duration: <strong>{durationDays} days</strong>
                {rooms.find(r => r._id === assignRoomId)?.price && (
                  <span className="ml-2">
                    • Est. Cost: ₹{Math.round((rooms.find(r => r._id === assignRoomId).price / 30) * durationDays).toLocaleString()}
                  </span>
                )}
              </div>
            )}

            <button onClick={handleAssignRoom}
              className="neon-btn w-full py-3 text-white font-bold">
              ✅ Confirm Assignment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;