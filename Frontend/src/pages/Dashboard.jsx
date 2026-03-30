import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { socket } from "../socket";

const StatCard = ({ label, value, icon, color, pct }) => (
  <div className="glass-panel p-6 hover-lift kpi-glow rounded-2xl">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span className="text-2xl">{icon}</span>
    </div>
    <div className="text-4xl font-extrabold mb-3" style={{ color }}>{value}</div>
    {pct !== undefined && (
      <div className="space-y-1">
        <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
          <span>Occupancy</span><span>{pct}%</span>
        </div>
        <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <div className="h-1.5 rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: `linear-gradient(90deg, #ff8a00, #ff5f6d)` }} />
        </div>
      </div>
    )}
    {pct === undefined && (
      <div className="h-1 rounded-full" style={{ background: 'linear-gradient(90deg, #ff8a00, #ff5f6d)' }} />
    )}
  </div>
);

const RoomFloorPlan = ({ rooms }) => {
  const getStatus = (room) => {
    const occ = room.occupants?.length || 0;
    if (occ === 0) return 'free';
    if (occ >= room.capacity) return 'full';
    return 'mid';
  };

  const statusStyle = {
    free: { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.4)', color: '#22c55e', label: '✓' },
    mid:  { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)', color: '#f59e0b', label: '~' },
    full: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', color: '#ef4444', label: '✕' },
  };

  return (
    <div className="glass-panel rounded-2xl p-6">
      <h2 className="font-bold text-lg mb-4">🗺️ Room Floor Plan</h2>
      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))' }}>
        {rooms.map((room) => {
          const st = getStatus(room);
          const s = statusStyle[st];
          return (
            <div key={room._id} title={`Room ${room.roomNumber} • ${room.type} • ${room.occupants?.length || 0}/${room.capacity}`}
              className="rounded-xl p-2 text-center cursor-pointer transition-all hover:scale-105"
              style={{ background: s.bg, border: `1px solid ${s.border}` }}>
              <div className="text-xs font-bold" style={{ color: s.color }}>{room.roomNumber}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{room.occupants?.length || 0}/{room.capacity}</div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: 'rgba(34,197,94,0.4)' }} />Available</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: 'rgba(245,158,11,0.4)' }} />Partial</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: 'rgba(239,68,68,0.4)' }} />Full</span>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { user, token } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [stats, setStats] = useState({ totalRooms: 0, occupiedRooms: 0, totalStudents: 0, availableRooms: 0 });
  const [rooms, setRooms] = useState([]);
  const [activity, setActivity] = useState([]);

  const fetchAll = useCallback(async () => {
    if (!token) return;
    const cfg = { headers: { Authorization: `Bearer ${token}` } };
    try {
      if (isAdmin) {
        const [r, s] = await Promise.all([
          axios.get("http://localhost:5000/api/rooms", cfg),
          axios.get("http://localhost:5000/api/students", cfg),
        ]);
        const roomData = r.data || [];
        const totalRooms = roomData.length;
        const occupiedRooms = roomData.filter(x => (x.occupants?.length || 0) > 0).length;
        setStats({ totalRooms, occupiedRooms, totalStudents: s.data.length, availableRooms: totalRooms - occupiedRooms });
        setRooms(roomData);
      } else {
        const [r, s] = await Promise.all([
          axios.get("http://localhost:5000/api/rooms/stats", cfg),
          axios.get("http://localhost:5000/api/students/stats", cfg),
        ]);
        setStats({ totalRooms: r.data.totalRooms || 0, occupiedRooms: r.data.occupiedRooms || 0, availableRooms: r.data.availableRooms || 0, totalStudents: s.data.totalStudents || 0 });
      }
    } catch (e) {
      console.error("Dashboard error:", e?.response?.data || e.message);
    }
  }, [token, isAdmin]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    socket.on("rooms:updated", () => { setActivity(a => [{ t: "🏠 Rooms updated", time: new Date().toLocaleTimeString() }, ...a].slice(0, 6)); fetchAll(); });
    socket.on("students:updated", () => { setActivity(a => [{ t: "👤 Students updated", time: new Date().toLocaleTimeString() }, ...a].slice(0, 6)); fetchAll(); });
    return () => { socket.off("rooms:updated"); socket.off("students:updated"); };
  }, [fetchAll]);

  const occupancyPct = stats.totalRooms > 0 ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100) : 0;

  return (
    <div className="app-bg p-6 min-h-screen">
      {/* Header */}
      <div className="mb-8 fade-in">
        <h1 className="text-4xl font-extrabold" style={{ background: 'linear-gradient(135deg, #ffb703, #ff5f6d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {isAdmin ? '👑 Admin Dashboard' : '🎓 My Dashboard'}
        </h1>
        <p className="mt-1" style={{ color: 'var(--text-muted)' }}>Welcome back, <span className="text-white font-medium">{user?.name || user?.email}</span></p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard label="Total Rooms" value={stats.totalRooms} icon="🏠" color="#ffb703" pct={occupancyPct} />
        <StatCard label="Students" value={stats.totalStudents} icon="👥" color="#ff8a00" />
        <StatCard label="Occupied" value={stats.occupiedRooms} icon="🔒" color="#ef4444" />
        <StatCard label="Available" value={stats.availableRooms} icon="✨" color="#22c55e" />
      </div>

      {/* Floor Plan + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {isAdmin && rooms.length > 0
            ? <RoomFloorPlan rooms={rooms} />
            : <div className="glass-panel rounded-2xl p-6 text-center" style={{ color: 'var(--text-muted)' }}>
                No rooms added yet. Admin can add rooms from the Rooms page.
              </div>
          }
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#22c55e' }} />
            Live Activity
          </h2>
          {activity.length === 0
            ? <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No recent activity</p>
            : <ul className="space-y-3">
                {activity.map((a, i) => (
                  <li key={i} className="flex items-center justify-between text-sm p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <span>{a.t}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{a.time}</span>
                  </li>
                ))}
              </ul>
          }
        </div>
      </div>
    </div>
  );
}