import axios from 'axios';
import toast from 'react-hot-toast';

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

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const res = error.response;
    if (res?.status === 403 && res.data?.trialExpired === true) {
      toast.error('Your 7-day free trial has ended. Subscribe to continue.');
      const path = typeof window !== 'undefined' ? window.location.pathname : '';
      if (path !== '/subscription') {
        window.location.assign('/subscription');
      }
    }
    return Promise.reject(error);
  }
);

export default instance;

