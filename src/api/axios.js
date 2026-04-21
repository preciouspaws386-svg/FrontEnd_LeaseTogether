import axios from 'axios';

const apiBaseURL = (process.env.REACT_APP_API_URL || 'https://backend-leasetogether.onrender.com').trim().replace(/\/+$/, '');

const instance = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;

