import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user, loading } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!user?._id) return setPendingCount(0);
    if (user.role !== 'admin' && !user.subscriptionActive) return setPendingCount(0);
    const res = await api.get('/meetups/mine');
    const meetups = res.data?.meetups || [];
    const pending = meetups.filter((m) => m?.status === 'Pending' && m?.receiver?._id === user._id);
    setPendingCount(pending.length);
  }, [user?._id, user?.role, user?.subscriptionActive]);

  useEffect(() => {
    if (loading) return;
    refresh().catch(() => setPendingCount(0));
  }, [loading, refresh]);

  const value = useMemo(() => ({ pendingCount, refresh }), [pendingCount, refresh]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export const useNotifications = () => useContext(NotificationContext);

