import axios from 'axios';

const API = import.meta.env.VITE_API_URL;
const API_URL = '/api/auth';

export const register = async (username: string, email: string, password: string) => {
  const response = await axios.post(`${API}${API_URL}/register`, { username, email, password });
  return response.data;
};

export const login = async (email: string, password: string) => {
  const response = await axios.post(`${API}${API_URL}/login`, { email, password });
  return response.data;
};
