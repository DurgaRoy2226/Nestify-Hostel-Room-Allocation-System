import React from "react";

const Rooms = () => {
  return (
    <div className="p-6 text-white">
      
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-yellow-400 flex items-center gap-2">
          🏠 Rooms
        </h1>
        <p className="text-gray-400">
          Manage hostel rooms and availability
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-500/10 p-6 rounded-xl text-center border border-green-500/20">
          <h2 className="text-3xl font-bold text-green-400">0</h2>
          <p>Available</p>
        </div>

        <div className="bg-yellow-500/10 p-6 rounded-xl text-center border border-yellow-500/20">
          <h2 className="text-3xl font-bold text-yellow-400">0</h2>
          <p>Partial</p>
        </div>

        <div className="bg-red-500/10 p-6 rounded-xl text-center border border-red-500/20">
          <h2 className="text-3xl font-bold text-red-400">0</h2>
          <p>Full</p>
        </div>
      </div>

      {/* ADD ROOM */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-lg p-4 rounded-xl flex gap-3 flex-wrap mb-6">
        <input
          type="text"
          placeholder="Room No. (e.g. 101)"
          className="p-2 rounded bg-transparent border"
        />

        <select className="p-2 rounded bg-transparent border">
          <option>Single</option>
          <option>Double</option>
          <option>Triple</option>
        </select>

        <input
          type="number"
          placeholder="Capacity"
          className="p-2 rounded bg-transparent border"
        />

        <input
          type="number"
          placeholder="Price"
          className="p-2 rounded bg-transparent border"
        />

        <select className="p-2 rounded bg-transparent border">
          <option>Block A</option>
          <option>Block B</option>
          <option>Block C</option>
        </select>

        <button className="bg-orange-500 px-4 py-2 rounded hover:bg-orange-600">
          Add Room
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded bg-orange-500">
            All Blocks
          </button>
          <button className="px-3 py-1 rounded bg-white/10">Block A</button>
          <button className="px-3 py-1 rounded bg-white/10">Block B</button>
          <button className="px-3 py-1 rounded bg-white/10">Block C</button>
        </div>

        <div className="flex gap-2">
          <button className="px-3 py-1 rounded bg-orange-500">
            All Types
          </button>
          <button className="px-3 py-1 rounded bg-white/10">Single</button>
          <button className="px-3 py-1 rounded bg-white/10">Double</button>
          <button className="px-3 py-1 rounded bg-white/10">Triple</button>
        </div>
      </div>

      {/* FLOOR PLAN */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center text-gray-400">
        📍 Floor Plan View (Rooms will appear here)
      </div>
    </div>
  );
};

export default Rooms;