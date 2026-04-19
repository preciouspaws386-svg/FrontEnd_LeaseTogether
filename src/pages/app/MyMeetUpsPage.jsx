import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Layout/Sidebar';
import TopBar from '../../components/Layout/TopBar';
import ConfirmationCode from '../../components/UI/ConfirmationCode';

const STATUS_CLASS = {
  Pending: 'status-pending',
  Accepted: 'status-accepted',
  Declined: 'status-declined',
  Cancelled: 'status-cancelled',
  Completed: 'status-completed',
};

export default function MyMeetUpsPage() {
  const { user } = useAuth();
  const [meetups, setMeetups] = useState([]);
  const [tab, setTab] = useState('sent');

  const load = async () => {
    try {
      const res = await api.get('/meetups/mine');
      setMeetups(res.data.meetups || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load meet-ups');
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sent = useMemo(() => meetups.filter((m) => m.requester?._id === user?._id), [meetups, user]);
  const received = useMemo(() => meetups.filter((m) => m.receiver?._id === user?._id), [meetups, user]);
  const list = tab === 'sent' ? sent : received;

  const cancel = async (id) => {
    try {
      await api.patch(`/meetups/${id}/cancel`);
      toast.success('✅ Request cancelled');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <TopBar title="My Meet-Ups" />
        <div className="page-body">
          <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
            <button className={`btn btn-sm ${tab === 'sent' ? 'btn-ghost-accent' : 'btn-secondary'}`} onClick={() => setTab('sent')}>
              Sent Requests
            </button>
            <button className={`btn btn-sm ${tab === 'received' ? 'btn-ghost-accent' : 'btn-secondary'}`} onClick={() => setTab('received')}>
              Received Requests
            </button>
          </div>

          {list.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--grey-2)' }}>
              <div style={{ fontSize: 34, marginBottom: 10 }}>📅</div>
              No meet-ups yet
            </div>
          ) : (
            list.map((m) => {
              const other = tab === 'sent' ? m.receiver : m.requester;
              return (
                <div key={m._id} className="card" style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: 14.5, fontWeight: 700 }}>
                        {other ? `${other.firstName} ${other.lastInitial}.` : '—'}
                      </div>
                      <div style={{ fontSize: 12.5, color: 'var(--grey-2)', marginTop: 4 }}>
                        {m.scheduledDate} · {m.scheduledTime} · {m.duration}
                      </div>
                      <div style={{ fontSize: 12.5, color: 'var(--grey-2)' }}>{m.location}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                      <span className={`status-badge ${STATUS_CLASS[m.status] || ''}`}>
                        <span className="badge-dot" />
                        {m.status}
                      </span>
                      {tab === 'sent' && m.status === 'Pending' && (
                        <button className="btn btn-danger-ghost btn-xs" onClick={() => cancel(m._id)}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                  {m.status === 'Accepted' && (
                    <div style={{ marginTop: 16 }}>
                      <ConfirmationCode code={m.confirmationCode} />
                      <div style={{ marginTop: 10, fontSize: 12, color: 'var(--grey-2)', textAlign: 'center' }}>
                        Show this code at the leasing office upon arrival.
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

