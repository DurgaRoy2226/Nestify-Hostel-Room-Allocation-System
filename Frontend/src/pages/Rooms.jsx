import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { socket } from "../socket";

const Rooms = () => {
  const { token, user } = useAuth(); // ✅ user added
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [roomNumber, setRoomNumber] = useState("");
  const [type, setType] = useState("Single");
  const [capacity, setCapacity] = useState(1);
  const [price, setPrice] = useState(1000);

  const fetchRooms = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/rooms", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRooms(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchRooms();
  }, [token]);

  const addRoom = async () => {
    if (!roomNumber) return alert("Room number required");

    try {
      await axios.post(
        "http://localhost:5000/api/rooms",
        { roomNumber, type, capacity, price },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRoomNumber("");
      setType("Single");
      setCapacity(1);
      setPrice(1000);
      fetchRooms();
    } catch (err) {
      console.error(err?.response?.data || err.message);
      alert("Failed to add room");

      useEffect(() => {
        socket.on("rooms:updated", () => {
          fetchRooms();   // tumhara existing fetchRooms function
        });

        return () => {
          socket.off("rooms:updated");
        };
      }, []);
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
      console.error(err?.response?.data || err.message);
      alert("Failed to delete room");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-8">Rooms</h1>

      {/* 👑 Add Room (Admin only) */}
      {user?.role === "admin" && (
        <div className="glass-card rounded-3xl p-6 mb-10 grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            className="bg-transparent border border-white/20 rounded-xl p-3 outline-none"
            placeholder="Room Number"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
          />
          <input
            className="bg-transparent border border-white/20 rounded-xl p-3 outline-none"
            placeholder="Type (Single/Double)"
            value={type}
            onChange={(e) => setType(e.target.value)}
          />
          <input
            type="number"
            min="1"
            className="bg-transparent border border-white/20 rounded-xl p-3 outline-none"
            placeholder="Capacity"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
          />
          <input
            type="number"
            min="0"
            className="bg-transparent border border-white/20 rounded-xl p-3 outline-none"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <button
            onClick={addRoom}
            className="px-6 py-3 rounded-xl bg-primary-500 text-black font-semibold hover:opacity-90"
          >
            Add Room
          </button>
        </div>
      )}

      {/* Rooms List */}
      {loading ? (
        <p>Loading rooms...</p>
      ) : rooms.length === 0 ? (
        <div className="glass-card rounded-3xl p-10 text-center text-dark-400">
          No rooms yet. Add your first room ✨
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div key={room._id} className="glass-card rounded-3xl p-6 hover-lift">
              <h3 className="text-xl font-semibold">Room {room.roomNumber}</h3>
              <p className="text-dark-400 mt-1">Type: {room.type}</p>
              <p className="text-dark-400 mt-1">Capacity: {room.capacity}</p>
              <p className="text-dark-400 mt-1">
                Occupied: {room.occupants?.length || 0}
              </p>
              <p className="text-dark-400 mt-1">Price: ₹{room.price}</p>

              {/* 👑 Delete (Admin only) */}
              {user?.role === "admin" && (
                <button
                  onClick={() => deleteRoom(room._id)}
                  className="mt-4 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Rooms;
