import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { socket } from "../socket";

const StatCard = ({ label, value, icon }) => (
  <div className="glass-panel p-6 hover-lift">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm opacity-70">{label}</span>
      <span className="opacity-60">{icon}</span>
    </div>
    <div className="text-3xl font-extrabold">{value}</div>
    <div className="mt-3 h-1 rounded-full bg-gradient-to-r from-[#ff8a00] to-[#ff5f6d]" />
  </div>
);

export default function Dashboard() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({
    totalRooms: 0,
    occupiedRooms: 0,
    totalStudents: 0,
    availableRooms: 0,
  });
  const [activity, setActivity] = useState([]);

  const fetchAll = useCallback(async () => {
    if (!token) return;
    const cfg = { headers: { Authorization: `Bearer ${token}` } };

    try {
      // 👑 Admin: full data routes | 🎓 Student: stats-only routes
      const isAdmin = user?.role === "admin";

      const [r, s] = await Promise.all([
        isAdmin
          ? axios.get("http://localhost:5000/api/rooms", cfg)
          : axios.get("http://localhost:5000/api/rooms/stats", cfg),
        isAdmin
          ? axios.get("http://localhost:5000/api/students", cfg)
          : axios.get("http://localhost:5000/api/students/stats", cfg),
      ]);

      if (isAdmin) {
        const rooms = r.data || [];
        const students = s.data || [];
        const totalRooms = rooms.length;
        const occupiedRooms = rooms.filter(x => (x.occupants?.length || 0) > 0).length;
        const totalStudents = students.length;
        const availableRooms = Math.max(totalRooms - occupiedRooms, 0);
        setStats({ totalRooms, occupiedRooms, totalStudents, availableRooms });
      } else {
        // 🎓 Student stats response structure
        setStats({
          totalRooms: r.data.totalRooms || 0,
          occupiedRooms: r.data.occupiedRooms || 0,
          availableRooms: r.data.availableRooms || 0,
          totalStudents: s.data.totalStudents || 0,
        });
      }
    } catch (e) {
      console.error("Dashboard stats error:", e?.response?.data || e.message);
    }
  }, [token, user?.role]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    socket.on("rooms:updated", () => {
      setActivity(a => [{ t: "Rooms updated" }, ...a].slice(0, 6));
      fetchAll();
    });
    socket.on("students:updated", () => {
      setActivity(a => [{ t: "Students updated" }, ...a].slice(0, 6));
      fetchAll();
    });
    return () => {
      socket.off("rooms:updated");
      socket.off("students:updated");
    };
  }, [fetchAll]);

  return (
    <div className="app-bg p-8 min-h-screen">
      <div className="mb-10">
        <h1 className="text-3xl font-bold">Overview</h1>
        <p className="opacity-70 mt-1">Welcome back, {user?.email || "User"}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard label="Total Rooms" value={stats.totalRooms} icon="🏠" />
        <StatCard label="Students" value={stats.totalStudents} icon="👥" />
        <StatCard label="Occupied" value={stats.occupiedRooms} icon="🔒" />
        <StatCard label="Available" value={stats.availableRooms} icon="✨" />
      </div>

      <div className="glass-panel p-6">
        <h2 className="font-semibold mb-4">Live Activity</h2>
        <ul className="space-y-2 text-sm opacity-80">
          {activity.length === 0 ? (
            <li>No recent activity</li>
          ) : (
            activity.map((a, i) => <li key={i}>• {a.t}</li>)
          )}
        </ul>
      </div>
    </div>
  );
}
