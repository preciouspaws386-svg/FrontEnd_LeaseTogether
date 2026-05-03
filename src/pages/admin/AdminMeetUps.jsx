import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import AdminAppShell from '../../components/Layout/AdminAppShell';

const STATUS = ['Pending', 'Accepted', 'Declined', 'Cancelled', 'Completed'];
const STATUS_CLASS = {
  Pending: 'status-pending',
  Accepted: 'status-accepted',
  Declined: 'status-declined',
  Cancelled: 'status-cancelled',
  Completed: 'status-completed',
};

export default function AdminMeetUps() {
  const [meetups, setMeetups] = useState([]);
  const [status, setStatus] = useState('');
  const [code, setCode] = useState('');

  const load = async () => {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (code) params.append('code', code);
      const res = await api.get(`/admin/meetups?${params.toString()}`);
      setMeetups(res.data.meetups || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load meet-ups');
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const updateStatus = async (id, next) => {
    try {
      await api.patch(`/admin/meetups/${id}/status`, { status: next });
      toast.success('Updated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  return (
    <AdminAppShell title="Meet-Ups">
          <div className="admin-filters-row">
            <input className="form-input" placeholder="Search by code (RM-XXXX)" value={code} onChange={(e) => setCode(e.target.value)} />
            <button className="btn btn-secondary btn-sm" onClick={load}>
              Search
            </button>
            <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {STATUS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Requester</th>
                  <th>Receiver</th>
                  <th>Code</th>
                  <th>Status</th>
                  <th>Admin Action</th>
                </tr>
              </thead>
              <tbody>
                {meetups.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: 22, color: 'var(--grey-2)' }}>
                      No meet-ups found
                    </td>
                  </tr>
                ) : (
                  meetups.map((m) => (
                    <tr key={m._id}>
                      <td>{m.requester ? `${m.requester.firstName} ${m.requester.lastInitial}.` : '—'}</td>
                      <td>{m.receiver ? `${m.receiver.firstName} ${m.receiver.lastInitial}.` : '—'}</td>
                      <td style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>{m.confirmationCode}</td>
                      <td>
                        <span className={`status-badge ${STATUS_CLASS[m.status] || ''}`}>
                          <span className="badge-dot" />
                          {m.status}
                        </span>
                      </td>
                      <td>
                        <select
                          className="form-select"
                          value={m.status}
                          onChange={(e) => updateStatus(m._id, e.target.value)}
                          style={{ padding: '7px 10px', fontSize: 12 }}
                        >
                          {STATUS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
    </AdminAppShell>
  );
}

