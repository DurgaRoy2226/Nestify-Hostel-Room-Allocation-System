import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Students = () => {
  const { token, user } = useAuth();
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    course: '',
    year: ''
  });
  const [allocationData, setAllocationData] = useState({
    roomId: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        const studentsResponse = await axios.get('http://localhost:5000/api/students', config);
        const roomsResponse = await axios.get('http://localhost:5000/api/rooms', config);

        setStudents(studentsResponse.data);
        setRooms(roomsResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data');
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAllocationChange = (e) => {
    setAllocationData({
      ...allocationData,
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

      if (selectedStudent) {
        // Update existing student
        await axios.put(`http://localhost:5000/api/students/${selectedStudent._id}`, formData, config);
      } else {
        // Create new student
        await axios.post('http://localhost:5000/api/students', formData, config);
      }

      // Refresh data
      const response = await axios.get('http://localhost:5000/api/students', config);
      setStudents(response.data);
      
      // Reset form
      setFormData({ name: '', email: '', course: '', year: '' });
      setSelectedStudent(null);
      setShowAddForm(false);
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleAllocate = async (studentId) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      await axios.patch(
        `http://localhost:5000/api/students/${studentId}/allocate/${allocationData.roomId}`,
        {},
        config
      );

      // Refresh data
      const configRefresh = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const response = await axios.get('http://localhost:5000/api/students', configRefresh);
      setStudents(response.data);
      
      setAllocationData({ roomId: '' });
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleDeallocate = async (studentId) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      await axios.patch(
        `http://localhost:5000/api/students/${studentId}/deallocate`,
        {},
        config
      );

      // Refresh data
      const response = await axios.get('http://localhost:5000/api/students', config);
      setStudents(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      await axios.delete(`http://localhost:5000/api/students/${studentId}`, config);

      // Refresh data
      const response = await axios.get('http://localhost:5000/api/students', config);
      setStudents(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleEdit = (student) => {
    setFormData({
      name: student.name,
      email: student.email,
      course: student.course,
      year: student.year
    });
    setSelectedStudent(student);
    setShowAddForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-primary-400">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-secondary-400">
            Students
          </h1>
          <p className="text-dark-400 mt-2">Manage student records and allocations</p>
        </div>
        
        {user?.role === 'admin' && (
          <button
            onClick={() => {
              setFormData({ name: '', email: '', course: '', year: '' });
              setSelectedStudent(null);
              setShowAddForm(!showAddForm);
            }}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 transition-all font-medium"
          >
            {showAddForm ? 'Cancel' : 'Add Student'}
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
            {selectedStudent ? 'Edit Student' : 'Add New Student'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 focus:outline-none transition-colors text-white"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 focus:outline-none transition-colors text-white"
                  placeholder="john@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Course</label>
                <input
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 focus:outline-none transition-colors text-white"
                  placeholder="Computer Science"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Year</label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 focus:outline-none transition-colors text-white"
                >
                  <option value="">Select Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
            </div>
            
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 transition-all font-medium"
            >
              {selectedStudent ? 'Update Student' : 'Add Student'}
            </button>
          </form>
        </div>
      )}

      <div className="glass-card rounded-2xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-dark-400 text-sm border-b border-dark-700">
                <th className="pb-3">Name</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Course</th>
                <th className="pb-3">Year</th>
                <th className="pb-3">Room</th>
                {user?.role === 'admin' && <th className="pb-3">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id} className="border-b border-dark-800 last:border-0">
                  <td className="py-4">{student.name}</td>
                  <td className="py-4">{student.email}</td>
                  <td className="py-4">{student.course}</td>
                  <td className="py-4">{student.year}</td>
                  <td className="py-4">
                    {student.room ? (
                      <div className="flex items-center">
                        <span className="px-3 py-1 rounded-full bg-primary-500/20 text-primary-400 text-sm mr-2">
                          {student.room.roomNumber}
                        </span>
                        {user?.role === 'admin' && (
                          <button
                            onClick={() => handleDeallocate(student._id)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Deallocate
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center">
                        {user?.role === 'admin' ? (
                          <>
                            <select
                              name="roomId"
                              value={allocationData.roomId}
                              onChange={handleAllocationChange}
                              className="px-2 py-1 rounded bg-dark-800/50 border border-dark-700 text-sm mr-2"
                            >
                              <option value="">Select Room</option>
                              {rooms
                                .filter(room => room.occupants.length < room.capacity)
                                .map(room => (
                                  <option key={room._id} value={room._id}>
                                    {room.roomNumber} ({room.occupants.length}/{room.capacity})
                                  </option>
                                ))}
                            </select>
                            <button
                              onClick={() => handleAllocate(student._id)}
                              disabled={!allocationData.roomId}
                              className="px-3 py-1 rounded bg-green-500/20 text-green-400 text-sm disabled:opacity-50"
                            >
                              Allocate
                            </button>
                          </>
                        ) : (
                          <span className="text-dark-500 text-sm">Not allocated</span>
                        )}
                      </div>
                    )}
                  </td>
                  {user?.role === 'admin' && (
                    <td className="py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(student)}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(student._id)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          
          {students.length === 0 && (
            <div className="text-center py-12 text-dark-400">
              <svg className="w-16 h-16 mx-auto text-dark-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="mt-4">No students found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Students;