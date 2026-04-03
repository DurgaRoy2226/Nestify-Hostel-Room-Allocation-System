import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SelectRoom() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState(null);
  
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/rooms/available", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRooms(res.data.rooms || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, [token]);

  const handleBook = async (roomId) => {
    if (!window.confirm("Are you sure you want to select this room?")) return;
    setBookingId(roomId);
    try {
      await axios.post("http://localhost:5000/api/students/me/book-room", { roomId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Room selected successfully! Welcome to your new home. 🎉");
      navigate("/my-room");
    } catch (e) {
      alert(e.response?.data?.message || "Failed to book room.");
      setBookingId(null);
    }
  };

  if (loading) return (
    <div className="app-bg min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: '#ff8a00', borderTopColor: 'transparent' }} />
    </div>
  );

  return (
    <div className="app-bg p-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 fade-in flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold" style={{ background: 'linear-gradient(135deg, #ffb703, #ff5f6d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              🏨 Select Your Room
            </h1>
            <p className="mt-2" style={{ color: 'var(--text-muted)' }}>
              Browse available rooms and pick your favorite. The choice is yours!
            </p>
          </div>
          <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-xl text-sm font-semibold transition hover:bg-white/10" style={{ border: '1px solid rgba(255,255,255,0.2)' }}>
            ← Back
          </button>
        </div>

        {rooms.length === 0 ? (
          <div className="glass-panel rounded-2xl p-10 text-center">
             <div className="text-6xl mb-4">📭</div>
             <h2 className="text-xl font-bold mb-2">No Rooms Available</h2>
             <p style={{ color: 'var(--text-muted)' }}>Check back later or contact the admin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => {
              // Extract calculated available capacity. Depending on if freeBeds was returned properly or we just use capacity - occupants.length
              const bedsAvailable = room.freeBeds !== undefined ? room.freeBeds : (room.capacity - (room.occupiedBeds || 0));
              const isAvailable = bedsAvailable > 0;
              return (
                <div key={room._id} className="glass-panel rounded-2xl p-6 hover-lift transition-all flex flex-col justify-between fade-in"
                     style={{ border: isAvailable ? '1px solid rgba(255,138,0,0.3)' : '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-xs uppercase tracking-widest font-bold mb-1 block" style={{ color: '#ffb703' }}>Block {room.block || 'A'} • Floor {room.floor || 1}</span>
                        <h2 className="text-3xl font-bold">{room.roomNumber}</h2>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold"
                            style={{ background: 'rgba(255,255,255,0.1)' }}>
                        {room.type}
                      </span>
                    </div>
                    
                    <div className="space-y-3 mb-6 text-sm" style={{ color: 'var(--text-muted)' }}>
                      <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                        <span>Capacity</span>
                        <span className="text-white font-medium">{room.capacity} Persons</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                        <span>Available Beds</span>
                        <span className="font-bold px-2 py-0.5 rounded-full" style={{ background: isAvailable ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: isAvailable ? '#22c55e' : '#ef4444' }}>
                          {bedsAvailable}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Monthly Fees</span>
                        <span className="text-white font-medium tracking-wide">₹{(room.price || 5000).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    disabled={!isAvailable || bookingId === room._id}
                    onClick={() => handleBook(room._id)}
                    className="w-full py-3 rounded-xl font-bold text-white transition-all disabled:opacity-50"
                    style={{ 
                      background: isAvailable 
                        ? 'linear-gradient(135deg, #ff8a00, #ff5f6d)' 
                        : 'rgba(255,255,255,0.1)',
                      boxShadow: isAvailable ? '0 4px 15px rgba(255,138,0,0.3)' : 'none'
                    }}>
                    {bookingId === room._id ? 'Booking...' : isAvailable ? 'Select This Room' : 'Room Full'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
