import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Sidebar from '../../components/Layout/Sidebar';
import TopBar from '../../components/Layout/TopBar';
import Modal from '../../components/UI/Modal';
import ConfirmationCode from '../../components/UI/ConfirmationCode';

export default function NotificationsPage() {
  const { user } = useAuth();
  const { refresh } = useNotifications() || {};
  const [meetups, setMeetups] = useState([]);
  const [confirmed, setConfirmed] = useState(null);

  const load = async () => {
    try {
      const res = await api.get('/meetups/mine');
      setMeetups(res.data.meetups || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load notifications');
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pending = useMemo(
    () => meetups.filter((m) => m.receiver?._id === user?._id && m.status === 'Pending'),
    [meetups, user]
  );

  const respond = async (id, action) => {
    try {
      const res = await api.patch(`/meetups/${id}/respond`, { action });
      if (action === 'accept') setConfirmed(res.data.meetup);
      if (action === 'accept') toast.success('✅ Meetup confirmed! Check your code');
      else toast('Request declined');
      await load();
      await refresh?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <TopBar title="Notifications" />
        <div className="page-body">
          <div className="page-header">
            <div className="page-title">Pending Requests</div>
            <div className="page-subtitle">{pending.length} awaiting your response</div>
          </div>

          {pending.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--grey-2)' }}>
              <div style={{ fontSize: 34, marginBottom: 10 }}>🔔</div>
              No new notifications
            </div>
          ) : (
            pending.map((m) => (
              <div key={m._id} className="notif-card unread">
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
                  {m.requester ? `${m.requester.firstName} ${m.requester.lastInitial}.` : 'Someone'} requested an Apartment
                  Meet-Up with you
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--grey-2)', marginBottom: 12 }}>
                  {m.scheduledDate} · {m.scheduledTime} · {m.duration} · {m.location}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-primary btn-sm" onClick={() => respond(m._id, 'accept')}>
                    ✅ Accept
                  </button>
                  <button className="btn btn-danger-ghost btn-sm" onClick={() => respond(m._id, 'decline')}>
                    ❌ Decline
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Modal isOpen={!!confirmed} onClose={() => setConfirmed(null)} title="Meet-Up Confirmed">
        {confirmed && (
          <div>
            <div style={{ marginBottom: 16, fontSize: 12.5, color: 'var(--grey-2)' }}>
              {confirmed.scheduledDate} · {confirmed.scheduledTime} · {confirmed.duration} · {confirmed.location}
            </div>
            <ConfirmationCode code={confirmed.confirmationCode} />
            <div style={{ marginTop: 10, fontSize: 12, color: 'var(--grey-2)', textAlign: 'center' }}>
              Show this code at the leasing office upon arrival.
            </div>
            <div style={{ marginTop: 16 }}>
              <button className="btn btn-secondary btn-full" onClick={() => setConfirmed(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

