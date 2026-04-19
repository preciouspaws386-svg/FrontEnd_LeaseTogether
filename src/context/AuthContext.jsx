import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get('/auth/me');
        if (!mounted) return;
        setUser(res.data?.user || null);
      } catch (err) {
        if (!mounted) return;
        setUser(null);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
  };

  const updateStatus = async (isOpenToRoommate) => {
    const res = await api.patch('/users/status', { isOpenToRoommate });
    setUser(res.data.user);
    return res.data.user;
  };

  const updateProfile = async (data) => {
    const res = await api.patch('/users/profile', data);
    setUser(res.data.user);
    return res.data.user;
  };

  const updatePhotos = async (photos) => {
    const res = await api.post('/users/photos', { photos });
    setUser(res.data.user);
    return res.data.user;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateStatus, updateProfile, updatePhotos }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

