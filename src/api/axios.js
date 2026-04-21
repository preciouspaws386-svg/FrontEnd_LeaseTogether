import axios from 'axios';

const apiBaseURL = (process.env.REACT_APP_API_URL || 'https://backend-leasetogether.onrender.com').trim().replace(/\/+$/, '');

const instance = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
});

export default instance;

