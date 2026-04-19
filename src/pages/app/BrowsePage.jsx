import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Sidebar from '../../components/Layout/Sidebar';
import TopBar from '../../components/Layout/TopBar';
import ProfileCard from '../../components/ProfileCard';
import Modal from '../../components/UI/Modal';
import StatusBadge from '../../components/UI/StatusBadge';
import TagPill from '../../components/UI/TagPill';
import ProfileAvatar from '../../components/UI/ProfileAvatar';
import IntentBadge from '../../components/UI/IntentBadge';

const TIMES = ['10:00 AM', '12:00 PM', '3:00 PM', '6:00 PM'];
const DURATIONS = ['10 minutes', '15 minutes'];

function buildDays() {
  const labels = ['Today', 'Tomorrow', 'In 2 Days', 'In 3 Days', 'In 4 Days'];
  return labels.map((label, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { label, value: `${label} (${formatted})` };
  });
}

export default function BrowsePage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [intentFilter, setIntentFilter] = useState('All');
  const [detailUser, setDetailUser] = useState(null);
  const [schedUser, setSchedUser] = useState(null);
  const [sched, setSched] = useState({ day: '', time: '', duration: '10 minutes' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api
      .get('/users/community')
      .then((r) => setUsers(r.data.users || []))
      .catch((err) => toast.error(err.response?.data?.message || 'Failed to load community'));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchSearch = `${u.firstName} ${u.lastInitial}`.toLowerCase().includes(q);
      const match = !q || matchSearch;
      if (!match) return false;
      if (filter === 'Open Only' && !u.isOpenToRoommate) return false;
      if (filter === 'ASAP Move-in' && u.moveInTimeframe !== 'ASAP') return false;
      if (intentFilter !== 'All' && u.intent !== intentFilter) return false;
      return true;
    });
  }, [users, search, filter, intentFilter]);

  const days = useMemo(() => buildDays(), []);

  const send = async () => {
    if (!sched.day || !sched.time) return toast.error('Pick a day and time');
    setSending(true);
    try {
      await api.post('/meetups', {
        receiverId: schedUser._id,
        scheduledDate: sched.day,
        scheduledTime: sched.time,
        duration: sched.duration,
      });
      toast.success('✅ Meetup request sent!');
      setSchedUser(null);
      setDetailUser(null);
      setSched({ day: '', time: '', duration: '10 minutes' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <TopBar title="Browse Community">
          <input className="form-input" style={{ width: 240 }} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name..." />
          <select className="form-select" style={{ width: 230 }} value={intentFilter} onChange={(e) => setIntentFilter(e.target.value)}>
            <option value="All">All intents</option>
            <option value="Looking for a Roommate">Looking for a Roommate</option>
            <option value="Looking to Swap Rooms">Looking to Swap Rooms</option>
            <option value="Lease Available">Lease Available</option>
          </select>
        </TopBar>
        <div className="page-body">
          <div className="page-header">
            <div className="page-title">Community Profiles</div>
            <div className="page-subtitle">Browse residents in your apartment community</div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
            {['All', 'Open Only', 'ASAP Move-in'].map((f) => (
              <button key={f} className={`btn btn-sm ${filter === f ? 'btn-ghost-accent' : 'btn-secondary'}`} onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: '50px 0', textAlign: 'center', color: 'var(--grey-2)' }}>
              <div style={{ fontSize: 34, marginBottom: 10 }}>🔍</div>
              No profiles found
            </div>
          ) : (
            <div className="card-grid">
              {filtered.map((u) => (
                <ProfileCard
                  key={u._id}
                  user={u}
                  onClick={() => setDetailUser(u)}
                  onRequestMeetUp={(u2) => setSchedUser(u2)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={!!detailUser}
        onClose={() => setDetailUser(null)}
        title={detailUser ? `${detailUser.firstName} ${detailUser.lastInitial}.` : ''}
      >
        {detailUser && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <ProfileAvatar name={detailUser.firstName} size={54} />
              <div>
                <div style={{ marginBottom: 6 }}>{detailUser.intent && <IntentBadge intent={detailUser.intent} />}</div>
                <StatusBadge isOpen={detailUser.isOpenToRoommate} />
                <div style={{ fontSize: 12, color: 'var(--grey-2)', marginTop: 4 }}>
                  {detailUser.apartmentName || detailUser.apartment?.name || 'Community'} · Age {detailUser.age || '—'}
                </div>
              </div>
            </div>
            {detailUser.bio && (
              <div style={{ fontStyle: 'italic', fontSize: 13, color: 'var(--grey-1)', marginBottom: 16 }}>
                "{detailUser.bio}"
              </div>
            )}
            <div className="tag-row" style={{ marginBottom: 14 }}>
              {[detailUser.socialVibe, detailUser.lifestylePace].filter(Boolean).map((t) => (
                <TagPill key={t} label={t} />
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                ['Age', detailUser.age],
                ['Major', detailUser.major],
                ['Move-in', detailUser.moveInTimeframe],
                ['Social vibe', detailUser.socialVibe],
                ['Lifestyle', detailUser.lifestylePace],
                ['Recharges by', detailUser.rechargeStyle],
                ['Conflict style', detailUser.conflictStyle],
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 11, color: 'var(--grey-2)', marginBottom: 2 }}>{k}</div>
                  <div style={{ fontSize: 13 }}>{v || '—'}</div>
                </div>
              ))}
            </div>
            {detailUser.isOpenToRoommate && (
              <button className="btn btn-primary btn-full" onClick={() => setSchedUser(detailUser)}>
                Request Apartment Meet-Up
              </button>
            )}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!schedUser}
        onClose={() => setSchedUser(null)}
        title={schedUser ? `Schedule a Meet-Up with ${schedUser.firstName} ${schedUser.lastInitial}.` : ''}
      >
        {schedUser && (
          <div>
            <div className="form-group">
              <label className="form-label">Pick Day</label>
              <div className="sched-grid">
                {days.map((d) => (
                  <div key={d.value} className={`sched-opt ${sched.day === d.value ? 'on' : ''}`} onClick={() => setSched((s) => ({ ...s, day: d.value }))}>
                    {d.label}
                  </div>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Pick Time</label>
              <div className="sched-grid">
                {TIMES.map((t) => (
                  <div key={t} className={`sched-opt ${sched.time === t ? 'on' : ''}`} onClick={() => setSched((s) => ({ ...s, time: t }))}>
                    {t}
                  </div>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Duration</label>
              <div className="opts">
                {DURATIONS.map((d) => (
                  <div key={d} className={`opt ${sched.duration === d ? 'on' : ''}`} onClick={() => setSched((s) => ({ ...s, duration: d }))}>
                    {d}
                  </div>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input className="form-input" value="Leasing Office / Clubhouse" readOnly />
            </div>
            <button className="btn btn-primary btn-full" disabled={sending} onClick={send}>
              {sending ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

