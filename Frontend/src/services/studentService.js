import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/students';

// Set up axios interceptor to include auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getAllStudents = async () => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getStudentById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const createStudent = async (studentData) => {
  try {
    const response = await axios.post(API_BASE_URL, studentData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const updateStudent = async (id, studentData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}`, studentData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const deleteStudent = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const allocateRoom = async (studentId, roomId) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/${studentId}/allocate/${roomId}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const deallocateRoom = async (studentId) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/${studentId}/deallocate`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};