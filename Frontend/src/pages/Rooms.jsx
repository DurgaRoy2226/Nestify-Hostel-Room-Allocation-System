import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Rooms = () => {
  const { token, user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [formData, setFormData] = useState({
    roomNumber: '',
    type: 'single',
    capacity: 1,
    price: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        const response = await axios.get('http://localhost:5000/api/rooms', config);
        setRooms(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching rooms:', error);
        setError('Failed to load rooms');
        setLoading(false);
      }
    };

    if (token) {
      fetchRooms();
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      if (selectedRoom) {
        // Update existing room
        await axios.put(`http://localhost:5000/api/rooms/${selectedRoom._id}`, formData, config);
      } else {
        // Create new room
        await axios.post('http://localhost:5000/api/rooms', formData, config);
      }

      // Refresh data
      const response = await axios.get('http://localhost:5000/api/rooms', config);
      setRooms(response.data);
      
      // Reset form
      setFormData({ roomNumber: '', type: 'single', capacity: 1, price: '' });
      setSelectedRoom(null);
      setShowAddForm(false);
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      await axios.delete(`http://localhost:5000/api/rooms/${roomId}`, config);

      // Refresh data
      const response = await axios.get('http://localhost:5000/api/rooms', config);
      setRooms(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleEdit = (room) => {
    setFormData({
      roomNumber: room.roomNumber,
      type: room.type,
      capacity: room.capacity,
      price: room.price
    });
    setSelectedRoom(room);
    setShowAddForm(true);
  };

  const getRoomTypeColor = (type) => {
    switch (type) {
      case 'single': return 'bg-blue-500/20 text-blue-400';
      case 'double': return 'bg-green-500/20 text-green-400';
      case 'triple': return 'bg-yellow-500/20 text-yellow-400';
      case 'dormitory': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-primary-400">Loading rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-secondary-400">
            Rooms
          </h1>
          <p className="text-dark-400 mt-2">Manage hostel room inventory</p>
        </div>
        
        {user?.role === 'admin' && (
          <button
            onClick={() => {
              setFormData({ roomNumber: '', type: 'single', capacity: 1, price: '' });
              setSelectedRoom(null);
              setShowAddForm(!showAddForm);
            }}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 transition-all font-medium"
          >
            {showAddForm ? 'Cancel' : 'Add Room'}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-sm">
          {error}
        </div>
      )}

      {showAddForm && user?.role === 'admin' && (
        <div className="glass-card rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">
            {selectedRoom ? 'Edit Room' : 'Add New Room'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Room Number</label>
                <input
                  type="text"
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 focus:outline-none transition-colors text-white"
                  placeholder="A101"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 focus:outline-none transition-colors text-white"
                >
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                  <option value="triple">Triple</option>
                  <option value="dormitory">Dormitory</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  min="1"
                  max="20"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 focus:outline-none transition-colors text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Price ($)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 focus:outline-none transition-colors text-white"
                  placeholder="100.00"
                />
              </div>
            </div>
            
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 transition-all font-medium"
            >
              {selectedRoom ? 'Update Room' : 'Add Room'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div key={room._id} className="glass-card rounded-2xl p-6 hover-lift">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold">Room {room.roomNumber}</h3>
                <span className={`px-3 py-1 rounded-full text-sm mt-2 inline-block ${getRoomTypeColor(room.type)}`}>
                  {room.type.charAt(0).toUpperCase() + room.type.slice(1)}
                </span>
              </div>
              {user?.role === 'admin' && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(room)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(room._id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm text-dark-400 mb-1">
                <span>Occupancy</span>
                <span>{room.occupants.length}/{room.capacity}</span>
              </div>
              <div className="w-full bg-dark-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full" 
                  style={{ width: `${(room.occupants.length / room.capacity) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-dark-400 text-sm">Price</p>
                <p className="font-bold">${room.price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-dark-400 text-sm">Occupants</p>
                <p className="font-bold">{room.occupants.length}</p>
              </div>
            </div>

            {room.occupants.length > 0 && (
              <div className="mt-4 pt-4 border-t border-dark-700">
                <p className="text-dark-400 text-sm mb-2">Occupants:</p>
                <div className="flex flex-wrap gap-2">
                  {room.occupants.map((occupant, index) => (
                    <span 
                      key={index} 
                      className="px-2 py-1 rounded-full bg-dark-700 text-xs"
                    >
                      {occupant.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {rooms.length === 0 && (
        <div className="glass-card rounded-2xl p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-dark-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <p className="mt-4 text-dark-400">No rooms found</p>
          {user?.role === 'admin' && (
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 px-4 py-2 rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 transition-all font-medium"
            >
              Add Your First Room
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Rooms;