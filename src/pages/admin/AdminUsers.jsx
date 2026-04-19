import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import AdminSidebar from '../../components/Layout/AdminSidebar';
import TopBar from '../../components/Layout/TopBar';
import StatusBadge from '../../components/UI/StatusBadge';

export default function AdminUsers() {
  const [apartments, setApartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [apartmentId, setApartmentId] = useState('');

  const loadUsers = async (aptId) => {
    try {
      const q = aptId ? `?apartmentId=${aptId}` : '';
      const res = await api.get(`/admin/users${q}`);
      setUsers(res.data.users || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load users');
    }
  };

  useEffect(() => {
    api
      .get('/admin/apartments')
      .then((r) => setApartments(r.data.apartments || []))
      .catch(() => {});
    loadUsers('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="app-layout">
      <AdminSidebar />
      <div className="main-content">
        <TopBar title="Users" />
        <div className="page-body">
          <div style={{ marginBottom: 16 }}>
            <select
              className="form-select"
              style={{ width: 320 }}
              value={apartmentId}
              onChange={(e) => {
                const v = e.target.value;
                setApartmentId(v);
                loadUsers(v);
              }}
            >
              <option value="">All Apartments</option>
              {apartments.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Apartment</th>
                  <th>Status</th>
                  <th>Major</th>
                  <th>Age</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: 22, color: 'var(--grey-2)' }}>
                      No users
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id}>
                      <td style={{ fontWeight: 700 }}>
                        {u.firstName} {u.lastInitial}.
                      </td>
                      <td style={{ color: 'var(--grey-2)' }}>{u.email}</td>
                      <td>{u.apartment?.name || u.apartmentName || '—'}</td>
                      <td>
                        <StatusBadge isOpen={!!u.isOpenToRoommate} />
                      </td>
                      <td>{u.major || '—'}</td>
                      <td>{u.age || '—'}</td>
                      <td>
                        <span
                          style={{
                            fontSize: 11,
                            padding: '3px 8px',
                            borderRadius: 20,
                            background: u.role === 'admin' ? 'var(--accent-dim)' : 'var(--ink-4)',
                            color: u.role === 'admin' ? 'var(--accent)' : 'var(--grey-2)',
                            border: `1px solid ${u.role === 'admin' ? 'var(--accent-line)' : 'var(--line)'}`,
                          }}
                        >
                          {u.role}
                        </span>
                      </td>
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

