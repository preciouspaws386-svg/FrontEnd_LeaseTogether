import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import AdminSidebar from '../../components/Layout/AdminSidebar';
import TopBar from '../../components/Layout/TopBar';

export default function AdminAccessCodes() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [apartments, setApartments] = useState([]);
  const [publicCount, setPublicCount] = useState(1);
  const [privateApartmentId, setPrivateApartmentId] = useState('');
  const [privateCount, setPrivateCount] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/access-codes');
      setCodes(res.data?.codes || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load access codes');
    } finally {
      setLoading(false);
    }
  };

  const loadApartments = async () => {
    try {
      const res = await api.get('/admin/apartments');
      setApartments(res.data?.apartments || []);
    } catch {
      setApartments([]);
    }
  };

  useEffect(() => {
    load();
    loadApartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generatePublic = async () => {
    try {
      const count = Number(publicCount) || 1;
      const res = await api.post('/admin/access-codes', { type: 'public', count });
      toast.success(`Generated ${res.data?.codes?.length || 1} public code(s)`);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate public codes');
    }
  };

  const generatePrivate = async () => {
    try {
      if (!privateApartmentId) return toast.error('Select an apartment for private codes');
      const count = Number(privateCount) || 1;
      await api.post('/admin/access-codes', { type: 'private', apartmentId: privateApartmentId, count });
      toast.success('Generated private code');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate private codes');
    }
  };

  const toggleStatus = async (id, nextStatus) => {
    try {
      await api.patch(`/admin/access-codes/${id}`, { status: nextStatus });
      toast.success('Updated');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const nowTable = useMemo(() => codes || [], [codes]);

  return (
    <div className="app-layout">
      <AdminSidebar />
      <div className="main-content">
        <TopBar title="Access Codes" />
        <div className="page-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <div className="card" style={{ padding: 14 }}>
              <div style={{ fontWeight: 900, marginBottom: 10 }}>Generate Public One-time Codes</div>
              <div className="form-group">
                <label className="form-label">Count</label>
                <input className="form-input" type="number" min={1} value={publicCount} onChange={(e) => setPublicCount(e.target.value)} />
              </div>
              <button className="btn btn-primary btn-full" disabled={loading} onClick={generatePublic}>
                Generate
              </button>
            </div>

            <div className="card" style={{ padding: 14 }}>
              <div style={{ fontWeight: 900, marginBottom: 10 }}>Generate Private Multi-use Codes</div>
              <div className="form-group">
                <label className="form-label">Apartment</label>
                <select className="form-select" value={privateApartmentId} onChange={(e) => setPrivateApartmentId(e.target.value)}>
                  <option value="">Select apartment</option>
                  {apartments.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Count (optional)</label>
                <input className="form-input" type="number" min={1} value={privateCount} onChange={(e) => setPrivateCount(e.target.value)} />
                <div style={{ fontSize: 12.5, color: 'var(--grey-2)', marginTop: 6 }}>
                  Backend currently generates a single private code per request.
                </div>
              </div>
              <button className="btn btn-primary btn-full" disabled={loading} onClick={generatePrivate}>
                Generate
              </button>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Used By</th>
                  <th>Created</th>
                  <th>Toggle</th>
                </tr>
              </thead>
              <tbody>
                {nowTable.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: 22, color: 'var(--grey-2)' }}>
                      No codes found
                    </td>
                  </tr>
                ) : (
                  nowTable.map((c) => (
                    <tr key={c._id}>
                      <td style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>{c.code}</td>
                      <td>{c.type}</td>
                      <td>{c.status}</td>
                      <td>{c.usedBy ? `${c.usedBy.firstName} ${c.usedBy.lastInitial}.` : '—'}</td>
                      <td>{c.createdAt ? new Date(c.createdAt).toLocaleString() : '—'}</td>
                      <td>
                        <button
                          className={`btn btn-sm ${c.status === 'active' ? 'btn-danger-ghost' : 'btn-secondary'}`}
                          onClick={() => toggleStatus(c._id, c.status === 'active' ? 'disabled' : 'active')}
                        >
                          {c.status === 'active' ? 'Disable' : 'Enable'}
                        </button>
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

