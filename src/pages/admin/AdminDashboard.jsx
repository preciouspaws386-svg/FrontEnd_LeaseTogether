import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import AdminSidebar from '../../components/Layout/AdminSidebar';
import TopBar from '../../components/Layout/TopBar';

const STATUS_CLASS = {
  Pending: 'status-pending',
  Accepted: 'status-accepted',
  Declined: 'status-declined',
  Cancelled: 'status-cancelled',
  Completed: 'status-completed',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({ apartments: 0, users: 0, active: 0, completed: 0 });
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [aRes, uRes, mRes] = await Promise.all([
          api.get('/admin/apartments'),
          api.get('/admin/users'),
          api.get('/admin/meetups'),
        ]);
        const apartments = aRes.data.apartments || [];
        const users = uRes.data.users || [];
        const meetups = mRes.data.meetups || [];
        setStats({
          apartments: apartments.length,
          users: users.length,
          active: meetups.filter((m) => m.status === 'Pending' || m.status === 'Accepted').length,
          completed: meetups.filter((m) => m.status === 'Completed').length,
        });
        setRecent(meetups.slice(0, 5));
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load dashboard');
      }
    };
    load();
  }, []);

  return (
    <div className="app-layout">
      <AdminSidebar />
      <div className="main-content">
        <TopBar title="Admin Dashboard" />
        <div className="page-body">
          <div className="stat-row">
            {[
              ['Total Apartments', stats.apartments],
              ['Total Users', stats.users],
              ['Active Meet-Ups', stats.active],
              ['Completed Meet-Ups', stats.completed],
            ].map(([label, value]) => (
              <div key={label} className="stat-card">
                <div className="stat-value">{value}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>

          <div className="page-header">
            <div className="page-title" style={{ fontSize: 18 }}>
              Recent Meet-Ups
            </div>
          </div>
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Requester</th>
                  <th>Receiver</th>
                  <th>Code</th>
                </tr>
              </thead>
              <tbody>
                {recent.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ padding: 22, color: 'var(--grey-2)' }}>
                      No meet-ups yet
                    </td>
                  </tr>
                ) : (
                  recent.map((m) => (
                    <tr key={m._id}>
                      <td>
                        <span className={`status-badge ${STATUS_CLASS[m.status] || ''}`}>
                          <span className="badge-dot" />
                          {m.status}
                        </span>
                      </td>
                      <td>
                        {m.requester ? `${m.requester.firstName} ${m.requester.lastInitial}.` : '—'}
                      </td>
                      <td>
                        {m.receiver ? `${m.receiver.firstName} ${m.receiver.lastInitial}.` : '—'}
                      </td>
                      <td style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>{m.confirmationCode}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

