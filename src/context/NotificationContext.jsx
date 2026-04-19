import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user, loading } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  const refresh = async () => {
    if (!user?._id) return setPendingCount(0);
    const res = await api.get('/meetups/mine');
    const meetups = res.data?.meetups || [];
    const pending = meetups.filter((m) => m?.status === 'Pending' && m?.receiver?._id === user._id);
    setPendingCount(pending.length);
  };

  useEffect(() => {
    if (loading) return;
    refresh().catch(() => setPendingCount(0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user?._id]);

  const value = useMemo(() => ({ pendingCount, refresh }), [pendingCount]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export const useNotifications = () => useContext(NotificationContext);

