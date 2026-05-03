import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import AdminAppShell from '../../components/Layout/AdminAppShell';
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

  const toggleDisabled = async (u) => {
    try {
      const next = !u.isDisabled;
      await api.patch(`/admin/users/${u._id}/disable`, { isDisabled: next });
      toast.success(next ? 'User disabled' : 'User enabled');
      await loadUsers(apartmentId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    }
  };

  const resetSchool = async (u) => {
    if (!window.confirm('Reset this user school assignment? They will be forced to re-select on next login.')) return;
    try {
      await api.patch(`/admin/users/${u._id}/reset-school`);
      toast.success('School reset');
      await loadUsers(apartmentId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset school');
    }
  };

  return (
    <AdminAppShell title="Users">
          <div style={{ marginBottom: 16 }}>
            <select
              className="form-select admin-toolbar-select"
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
                  <th>School</th>
                  <th>Campus</th>
                  <th>Status</th>
                  <th>Major</th>
                  <th>Age</th>
                  <th>Role</th>
                  <th>Disabled</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="11" style={{ padding: 22, color: 'var(--grey-2)' }}>
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
                      <td>{u.school?.name || '—'}</td>
                      <td>{u.campusPreference || '—'}</td>
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
                      <td>{u.isDisabled ? 'Yes' : 'No'}</td>
                      <td>
                        <div className="admin-table-actions">
                          <button
                            className={`btn btn-xs ${u.isDisabled ? 'btn-secondary' : 'btn-danger-ghost'}`}
                            onClick={() => toggleDisabled(u)}
                          >
                            {u.isDisabled ? 'Enable' : 'Disable'}
                          </button>
                          <button className="btn btn-secondary btn-xs" onClick={() => resetSchool(u)}>
                            Reset School
                          </button>
                        </div>
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

