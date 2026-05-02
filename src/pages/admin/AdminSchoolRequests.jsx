import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import AdminSidebar from '../../components/Layout/AdminSidebar';
import TopBar from '../../components/Layout/TopBar';

export default function AdminSchoolRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/school-requests');
      setRequests(res.data?.requests || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load school requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="app-layout">
      <AdminSidebar />
      <div className="main-content">
        <TopBar title="School Requests" />
        <div className="page-body">
          <div className="page-subtitle" style={{ marginBottom: 16 }}>
            Users who asked us to add a missing school.
          </div>
          {loading ? (
            <div style={{ padding: '24px 0', color: 'var(--grey-2)' }}>Loading…</div>
          ) : null}
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>School name</th>
                  <th>Email</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ padding: 22, color: 'var(--grey-2)' }}>
                      No requests yet
                    </td>
                  </tr>
                ) : (
                  requests.map((r) => (
                    <tr key={r._id}>
                      <td style={{ fontWeight: 700 }}>{r.schoolName}</td>
                      <td style={{ color: 'var(--grey-2)' }}>{r.userEmail || '—'}</td>
                      <td>{r.createdAt ? new Date(r.createdAt).toLocaleString() : '—'}</td>
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
