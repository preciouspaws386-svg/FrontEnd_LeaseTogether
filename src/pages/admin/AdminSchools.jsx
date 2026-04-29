import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import AdminSidebar from '../../components/Layout/AdminSidebar';
import TopBar from '../../components/Layout/TopBar';

export default function AdminSchools() {
  const [schools, setSchools] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    name: '',
    state: '',
    onCampusLocations: '',
    offCampusPartners: [],
  });

  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/admin/schools');
      setSchools(res.data?.schools || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load schools');
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

  const submit = async () => {
    if (!form.name.trim() || !form.state.trim()) return toast.error('Name and state are required');
    const onCampusLocations = String(form.onCampusLocations || '')
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        state: form.state.trim(),
        onCampusLocations,
        offCampusPartners: form.offCampusPartners,
      };

      if (editing) await api.put(`/admin/schools/${editing._id}`, payload);
      else await api.post('/admin/schools', payload);

      toast.success(editing ? 'School updated' : 'School created');
      setEditing(null);
      setForm({ name: '', state: '', onCampusLocations: '', offCampusPartners: [] });
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save school');
    } finally {
      setSaving(false);
    }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this school?')) return;
    try {
      await api.delete(`/admin/schools/${id}`);
      toast.success('School deleted');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const beginEdit = (s) => {
    setEditing(s);
    setForm({
      name: s.name || '',
      state: s.state || '',
      onCampusLocations: Array.isArray(s.onCampusLocations) ? s.onCampusLocations.join(', ') : '',
      offCampusPartners: Array.isArray(s.offCampusPartners) ? s.offCampusPartners.map((p) => (typeof p === 'string' ? p : p._id)) : [],
    });
  };

  const offCampusSelected = useMemo(() => new Set(form.offCampusPartners || []), [form.offCampusPartners]);

  return (
    <div className="app-layout">
      <AdminSidebar />
      <div className="main-content">
        <TopBar title="Schools" />
        <div className="page-body">
          <div className="card" style={{ marginBottom: 16, padding: 14 }}>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>{editing ? 'Edit School' : 'Add School'}</div>

            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <input className="form-input" value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value.toUpperCase() }))} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">On-campus dorm room names</label>
              <input
                className="form-input"
                value={form.onCampusLocations}
                onChange={(e) => setForm((f) => ({ ...f, onCampusLocations: e.target.value }))}
                placeholder="e.g. Moore Hall, Duren Hall, Kinsolving Hall"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Off-campus apartment partners</label>
              <div className="opts" style={{ maxHeight: 160, overflowY: 'auto' }}>
                {apartments.map((a) => {
                  const on = offCampusSelected.has(a._id);
                  return (
                    <div
                      key={a._id}
                      className={`opt ${on ? 'on' : ''}`}
                      onClick={() => {
                        setForm((f) => {
                          const set = new Set(f.offCampusPartners || []);
                          if (set.has(a._id)) set.delete(a._id);
                          else set.add(a._id);
                          return { ...f, offCampusPartners: Array.from(set) };
                        });
                      }}
                    >
                      {a.name}
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => {
                  setEditing(null);
                  setForm({ name: '', state: '', onCampusLocations: '', offCampusPartners: [] });
                }}
              >
                Reset
              </button>
              <button className="btn btn-primary" type="button" disabled={saving} style={{ flex: 1 }} onClick={submit}>
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add School'}
              </button>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>School</th>
                  <th>State</th>
                  <th>On-campus dorms</th>
                  <th>Off-campus partners</th>
                  <th>Users</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {schools.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: 22, color: 'var(--grey-2)' }}>
                      No schools found
                    </td>
                  </tr>
                ) : (
                  schools.map((s) => (
                    <tr key={s._id}>
                      <td style={{ fontWeight: 800 }}>{s.name}</td>
                      <td>{s.state}</td>
                      <td>{Array.isArray(s.onCampusLocations) ? s.onCampusLocations.length : 0}</td>
                      <td>{Array.isArray(s.offCampusPartners) ? s.offCampusPartners.length : 0}</td>
                      <td>{s.userCount ?? '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-secondary btn-xs" onClick={() => beginEdit(s)}>
                            Edit
                          </button>
                          <button className="btn btn-danger-ghost btn-xs" onClick={() => del(s._id)}>
                            Delete
                          </button>
                        </div>
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

