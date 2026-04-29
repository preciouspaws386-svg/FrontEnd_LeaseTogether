import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Layout/Sidebar';
import TopBar from '../../components/Layout/TopBar';
import Modal from '../../components/UI/Modal';
import MatchContactForm from '../../components/meetups/MatchContactForm';

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
  const [matched, setMatched] = useState(null);

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

  useEffect(() => {
    if (!user?._id) return;
    if (matched) return;
    const found = meetups.find((m) => {
      if (m.status !== 'Accepted') return false;
      const isRequester = m.requester?._id?.toString?.() === user._id?.toString?.() || m.requester?._id === user._id;
      const isReceiver = m.receiver?._id?.toString?.() === user._id?.toString?.() || m.receiver?._id === user._id;
      if (isRequester) return !m.requesterSubmitted;
      if (isReceiver) return !m.receiverSubmitted;
      return false;
    });
    if (found) setMatched(found);
  }, [meetups, user, matched]);

  const sent = useMemo(() => meetups.filter((m) => m.requester?._id === user?._id), [meetups, user]);
  const received = useMemo(() => meetups.filter((m) => m.receiver?._id === user?._id), [meetups, user]);
  const list = tab === 'sent' ? sent : received;

  const openMatch = (m) => setMatched(m);

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
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                      <span className={`status-badge ${STATUS_CLASS[m.status] || ''}`}>
                        <span className="badge-dot" />
                        {m.status}
                      </span>
                      {m.status === 'Accepted' && (
                        <button className="btn btn-primary btn-xs" onClick={() => openMatch(m)}>
                          Add contact info
                        </button>
                      )}
                    </div>
                  </div>
                  {m.status === 'Completed' && (
                    <div style={{ marginTop: 14, padding: '10px 12px', border: '1px solid var(--accent-line)', background: 'rgba(59,130,246,0.08)', borderRadius: 12 }}>
                      Congratulations 🎉 You will receive a text message shortly with your match's contact information.
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <Modal isOpen={!!matched} onClose={() => setMatched(null)} title="You Matched!">
        {matched && (
          <MatchContactForm
            meetup={matched}
            currentUserId={user?._id}
            schoolName={user?.school?.name || ''}
            onUpdated={(next) => {
              setMatched(next);
              setTimeout(() => load(), 0);
            }}
          />
        )}
      </Modal>
    </div>
  );
}

