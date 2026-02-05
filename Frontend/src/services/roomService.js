import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/rooms';

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

export const getAllRooms = async () => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getRoomById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id});
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const createRoom = async (roomData) => {
  try {
    const response = await axios.post(API_BASE_URL, roomData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const updateRoom = async (id, roomData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}`, roomData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const deleteRoom = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};