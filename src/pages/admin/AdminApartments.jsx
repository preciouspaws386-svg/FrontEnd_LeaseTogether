import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import AdminSidebar from '../../components/Layout/AdminSidebar';
import TopBar from '../../components/Layout/TopBar';
import Modal from '../../components/UI/Modal';

const EMPTY = { name: '', address: '', city: '', state: '', zipCode: '', accessCode: '' };

export default function AdminApartments() {
  const [apartments, setApartments] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/admin/apartments');
      setApartments(res.data.apartments || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load apartments');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const saveAdd = async () => {
    setSaving(true);
    try {
      await api.post('/admin/apartments', form);
      toast.success('Apartment added');
      setAddOpen(false);
      setForm(EMPTY);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add');
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await api.put(`/admin/apartments/${edit._id}`, form);
      toast.success('Apartment updated');
      setEdit(null);
      setForm(EMPTY);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this apartment?')) return;
    try {
      await api.delete(`/admin/apartments/${id}`);
      toast.success('Deleted');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="app-layout">
      <AdminSidebar />
      <div className="main-content">
        <TopBar title="Apartments">
          <button className="btn btn-primary btn-sm" onClick={() => { setForm(EMPTY); setAddOpen(true); }}>
            + Add Apartment
          </button>
        </TopBar>
        <div className="page-body">
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Address</th>
                  <th>City</th>
                  <th>State</th>
                  <th>ZIP</th>
                  <th>Access Code</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {apartments.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: 22, color: 'var(--grey-2)' }}>
                      No apartments yet
                    </td>
                  </tr>
                ) : (
                  apartments.map((a) => (
                    <tr key={a._id}>
                      <td style={{ fontWeight: 700 }}>{a.name}</td>
                      <td>{a.address}</td>
                      <td>{a.city}</td>
                      <td>{a.state}</td>
                      <td>{a.zipCode}</td>
                      <td style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>{a.accessCode}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            className="btn btn-secondary btn-xs"
                            onClick={() => {
                              setEdit(a);
                              setForm({ name: a.name, address: a.address, city: a.city, state: a.state, zipCode: a.zipCode, accessCode: a.accessCode || '' });
                            }}
                          >
                            Edit
                          </button>
                          <button className="btn btn-danger-ghost btn-xs" onClick={() => del(a._id)}>
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

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add Apartment">
        {[
          ['name', 'Name'],
          ['address', 'Street Address'],
          ['city', 'City'],
          ['state', 'State'],
          ['zipCode', 'ZIP Code'],
          ['accessCode', 'Access Code (e.g. SUNRISE24)'],
        ].map(([k, label]) => (
          <div className="form-group" key={k}>
            <label className="form-label">{label}</label>
            <input
              className="form-input"
              value={form[k]}
              onChange={(e) => set(k, k === 'accessCode' ? e.target.value.toUpperCase() : e.target.value)}
            />
          </div>
        ))}
        <button className="btn btn-primary btn-full" disabled={saving} onClick={saveAdd}>
          {saving ? 'Saving...' : 'Add Apartment'}
        </button>
      </Modal>

      <Modal isOpen={!!edit} onClose={() => setEdit(null)} title="Edit Apartment">
        {[
          ['name', 'Name'],
          ['address', 'Street Address'],
          ['city', 'City'],
          ['state', 'State'],
          ['zipCode', 'ZIP Code'],
          ['accessCode', 'Access Code (e.g. SUNRISE24)'],
        ].map(([k, label]) => (
          <div className="form-group" key={k}>
            <label className="form-label">{label}</label>
            <input
              className="form-input"
              value={form[k]}
              onChange={(e) => set(k, k === 'accessCode' ? e.target.value.toUpperCase() : e.target.value)}
            />
          </div>
        ))}
        <button className="btn btn-primary btn-full" disabled={saving} onClick={saveEdit}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </Modal>
    </div>
  );
}

