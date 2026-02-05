import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({
    totalRooms: 0,
    occupiedRooms: 0,
    totalStudents: 0,
    availableRooms: 0
  });
  const [recentAllocations, setRecentAllocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        // Fetch rooms and students data
        const roomsResponse = await axios.get('http://localhost:5000/api/rooms', config);
        const studentsResponse = await axios.get('http://localhost:5000/api/students', config);

        const rooms = roomsResponse.data;
        const students = studentsResponse.data;

        // Calculate statistics
        const totalRooms = rooms.length;
        const occupiedRooms = rooms.filter(room => room.occupants.length > 0).length;
        const totalStudents = students.length;
        const availableRooms = totalRooms - occupiedRooms;

        setStats({
          totalRooms,
          occupiedRooms,
          totalStudents,
          availableRooms
        });

        // Get recent allocations (students with rooms)
        const allocations = students
          .filter(student => student.room)
          .slice(0, 5)
          .map(student => ({
            studentName: student.name,
            roomNumber: student.room?.roomNumber,
            course: student.course
          }));

        setRecentAllocations(allocations);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-primary-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-secondary-400">
          Dashboard
        </h1>
        <p className="text-dark-400 mt-2">Welcome back, {user?.email}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-card rounded-2xl p-6 hover-lift">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-primary-500/20 mr-4">
              <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <p className="text-dark-400 text-sm">Total Rooms</p>
              <p className="text-2xl font-bold">{stats.totalRooms}</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 hover-lift">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-secondary-500/20 mr-4">
              <svg className="w-6 h-6 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-dark-400 text-sm">Total Students</p>
              <p className="text-2xl font-bold">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 hover-lift">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-500/20 mr-4">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-dark-400 text-sm">Occupied Rooms</p>
              <p className="text-2xl font-bold">{stats.occupiedRooms}</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 hover-lift">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-500/20 mr-4">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 18l-4-4m0 0l4-4m-4 4h16" />
              </svg>
            </div>
            <div>
              <p className="text-dark-400 text-sm">Available Rooms</p>
              <p className="text-2xl font-bold">{stats.availableRooms}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Allocations */}
      <div className="glass-card rounded-2xl p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Recent Allocations</h2>
        </div>

        {recentAllocations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-dark-400 text-sm border-b border-dark-700">
                  <th className="pb-3">Student Name</th>
                  <th className="pb-3">Course</th>
                  <th className="pb-3">Room Number</th>
                </tr>
              </thead>
              <tbody>
                {recentAllocations.map((allocation, index) => (
                  <tr key={index} className="border-b border-dark-800 last:border-0">
                    <td className="py-4">{allocation.studentName}</td>
                    <td className="py-4">{allocation.course}</td>
                    <td className="py-4">
                      <span className="px-3 py-1 rounded-full bg-primary-500/20 text-primary-400 text-sm">
                        {allocation.roomNumber}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-dark-400">
            <svg className="w-16 h-16 mx-auto text-dark-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="mt-4">No recent allocations found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;