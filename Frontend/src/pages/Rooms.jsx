import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { socket } from "../socket";

const Rooms = () => {
  const { token, user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomNumber, setRoomNumber] = useState("");
  const [type, setType] = useState("Single");
  const [capacity, setCapacity] = useState(1);
  const [price, setPrice] = useState(1000);
  const [block, setBlock] = useState("A");
  const [floor, setFloor] = useState(1);
  const [filterBlock, setFilterBlock] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const fetchRooms = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/rooms", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRooms(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchRooms();
  }, [token]);

  useEffect(() => {
    socket.on("rooms:updated", fetchRooms);
    return () => socket.off("rooms:updated", fetchRooms);
  }, []);

  const addRoom = async () => {
    if (!roomNumber) return alert("Room number required");
    try {
      await axios.post(
        "http://localhost:5000/api/rooms",
        { roomNumber, type, capacity, price, block, floor },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRoomNumber("");
      setType("Single");
      setCapacity(1);
      setPrice(1000);
      setBlock("A");
      setFloor(1);
      fetchRooms();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to add room");
    }
  };

  const deleteRoom = async (id) => {
    if (!window.confirm("Delete this room?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/rooms/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRooms();
    } catch (err) {
      alert("Failed to delete room");
    }
  };

  const getStatus = (room) => {
    const occ = room.occupants?.length || 0;
    if (occ === 0) return "free";
    if (occ >= room.capacity) return "full";
    return "partial";
  };

  const statusConfig = {
    free: { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.4)', color: '#22c55e', label: '✅ Available' },
    partial: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)', color: '#f59e0b', label: '⚡ Partial' },
    full: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', color: '#ef4444', label: '🔒 Full' },
  };

  // Filter logic
  const filteredRooms = rooms.filter(room => {
    const blockMatch = filterBlock === "all" || room.block === filterBlock;
    const typeMatch = filterType === "all" || room.type === filterType;
    return blockMatch && typeMatch;
  });

  const freeCount = rooms.filter(r => getStatus(r) === "free").length;
  const partialCount = rooms.filter(r => getStatus(r) === "partial").length;
  const fullCount = rooms.filter(r => getStatus(r) === "full").length;

  return (
    <div className="app-bg p-6 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold"
          style={{ background: 'linear-gradient(135deg, #ffb703, #ff5f6d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          🏠 Rooms
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage hostel rooms and availability</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Available', count: freeCount, color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)' },
          { label: 'Partial', count: partialCount, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
          { label: 'Full', count: fullCount, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 text-center"
            style={{ background: s.bg, border: `1px solid ${s.border}` }}>
            <div className="text-3xl font-extrabold" style={{ color: s.color }}>{s.count}</div>
            <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add Room Form — Admin only */}
      {user?.role === "admin" && (
        <div className="glass-panel rounded-2xl p-5 mb-8">
          <h2 className="font-bold mb-4">➕ Add New Room</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <input
              className="bg-transparent border border-white/20 rounded-xl p-3 outline-none text-white text-sm"
              placeholder="Room No. (e.g. 101)"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
            />
            <select
              className="border border-white/20 rounded-xl p-3 outline-none text-white text-sm"
              style={{ background: 'rgba(255,255,255,0.05)' }}
              value={type}
              onChange={(e) => setType(e.target.value)}>
              <option value="Single">Single</option>
              <option value="Double">Double</option>
              <option value="Triple">Triple</option>
            </select>
            <input
              type="number" min="1"
              className="bg-transparent border border-white/20 rounded-xl p-3 outline-none text-white text-sm"
              placeholder="Capacity"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
            <input
              type="number" min="0"
              className="bg-transparent border border-white/20 rounded-xl p-3 outline-none text-white text-sm"
              placeholder="Price (₹/mo)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <select
              className="border border-white/20 rounded-xl p-3 outline-none text-white text-sm"
              style={{ background: 'rgba(255,255,255,0.05)' }}
              value={block}
              onChange={(e) => setBlock(e.target.value)}>
              <option value="A">Block A</option>
              <option value="B">Block B</option>
              <option value="C">Block C</option>
            </select>
            <button onClick={addRoom} className="neon-btn px-4 py-3 text-white font-semibold text-sm">
              Add Room
            </button>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-2">
          <span className="text-sm py-2" style={{ color: 'var(--text-muted)' }}>Block:</span>
          {["all", "A", "B", "C"].map(b => (
            <button key={b} onClick={() => setFilterBlock(b)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: filterBlock === b ? 'linear-gradient(135deg, #ff8a00, #ff5f6d)' : 'rgba(255,255,255,0.08)',
                color: filterBlock === b ? 'white' : 'var(--text-muted)',
                border: filterBlock === b ? 'none' : '1px solid rgba(255,255,255,0.12)'
              }}>
              {b === "all" ? "All Blocks" : `Block ${b}`}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <span className="text-sm py-2" style={{ color: 'var(--text-muted)' }}>Type:</span>
          {["all", "Single", "Double", "Triple"].map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: filterType === t ? 'linear-gradient(135deg, #ff8a00, #ff5f6d)' : 'rgba(255,255,255,0.08)',
                color: filterType === t ? 'white' : 'var(--text-muted)',
                border: filterType === t ? 'none' : '1px solid rgba(255,255,255,0.12)'
              }}>
              {t === "all" ? "All Types" : t}
            </button>
          ))}
        </div>
      </div>

      {/* Floor Plan View */}
      <div className="glass-panel rounded-2xl p-6 mb-8">
        <h2 className="font-bold text-lg mb-4">🗺️ Floor Plan View</h2>
        <div className="grid gap-2"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(75px, 1fr))' }}>
          {filteredRooms.map(room => {
            const st = getStatus(room);
            const s = statusConfig[st];
            return (
              <div key={room._id}
                title={`Room ${room.roomNumber} • ${room.type} • Block ${room.block} • ${room.occupants?.length || 0}/${room.capacity} • ₹${room.price}`}
                className="rounded-xl p-2 text-center transition-all hover:scale-105 cursor-pointer"
                style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                <div className="text-xs font-bold" style={{ color: s.color }}>{room.roomNumber}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {room.occupants?.length || 0}/{room.capacity}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {room.type?.charAt(0)}
                </div>
              </div>
            );
          })}
        </div>
        {/* Legend */}
        <div className="flex gap-5 mt-5 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded" style={{ background: 'rgba(34,197,94,0.5)' }} />
            Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded" style={{ background: 'rgba(245,158,11,0.5)' }} />
            Partial
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded" style={{ background: 'rgba(239,68,68,0.5)' }} />
            Full
          </span>
        </div>
      </div>

      {/* Rooms List */}
      {loading ? (
        <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
          <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: '#ff8a00', borderTopColor: 'transparent' }} />
          Loading rooms...
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="glass-panel rounded-2xl p-10 text-center">
          <div className="text-5xl mb-3">🏠</div>
          <p style={{ color: 'var(--text-muted)' }}>No rooms found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {filteredRooms.map(room => {
            const st = getStatus(room);
            const s = statusConfig[st];
            return (
              <div key={room._id} className="glass-panel rounded-2xl p-5 hover-lift">
                {/* Room Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                      style={{ background: 'linear-gradient(135deg, #ff8a00, #ff5f6d)' }}>
                      {room.roomNumber}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Room {room.roomNumber}</h3>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Block {room.block} • Floor {room.floor}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full font-semibold"
                    style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
                    {s.label}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  {[
                    ['Type', room.type],
                    ['Capacity', `${room.capacity} persons`],
                    ['Occupied', `${room.occupants?.length || 0}/${room.capacity}`],
                    ['Price', `₹${room.price?.toLocaleString()}/mo`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm py-1 border-b"
                      style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                      <span className="text-white font-medium">{v}</span>
                    </div>
                  ))}
                </div>

                {/* Occupancy Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                    <span>Occupancy</span>
                    <span>{Math.round(((room.occupants?.length || 0) / room.capacity) * 100)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <div className="h-1.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${((room.occupants?.length || 0) / room.capacity) * 100}%`,
                        background: st === 'full' ? '#ef4444' : st === 'partial' ? '#f59e0b' : '#22c55e'
                      }} />
                  </div>
                </div>

                {/* Occupants */}
                {room.occupants?.length > 0 && (
                  <div className="mb-4 p-2 rounded-lg text-xs"
                    style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <p className="mb-1" style={{ color: 'var(--text-muted)' }}>Occupants:</p>
                    {room.occupants.map((occ, i) => (
                      <p key={i} className="text-white">• {occ.name || occ}</p>
                    ))}
                  </div>
                )}

                {/* Delete Button — Admin only */}
                {user?.role === "admin" && (
                  <button onClick={() => deleteRoom(room._id)}
                    className="w-full py-2 rounded-xl text-sm transition-all hover:scale-105"
                    style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
                    🗑️ Delete Room
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Rooms;