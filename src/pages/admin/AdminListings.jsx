import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import AdminSidebar from '../../components/Layout/AdminSidebar';
import TopBar from '../../components/Layout/TopBar';

export default function AdminListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/listings');
      setListings(res.data?.listings || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleAvailability = async (id, isAvailable) => {
    try {
      await api.patch(`/admin/listings/${id}/status`, { isAvailable });
      toast.success('Updated');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update listing');
    }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await api.delete(`/admin/listings/${id}`);
      toast.success('Deleted');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete listing');
    }
  };

  return (
    <div className="app-layout">
      <AdminSidebar />
      <div className="main-content">
        <TopBar title="Listings" />
        <div className="page-body">
          {loading ? <div style={{ padding: '30px 0', color: 'var(--grey-2)' }}>Loading…</div> : null}
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>School</th>
                  <th>Price</th>
                  <th>Distance</th>
                  <th>Pet</th>
                  <th>Furnished</th>
                  <th>Available</th>
                  <th>Contact</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ padding: 22, color: 'var(--grey-2)' }}>
                      No listings found
                    </td>
                  </tr>
                ) : (
                  listings.map((l) => (
                    <tr key={l._id}>
                      <td>{l.type}</td>
                      <td>{l.school?.name || '—'}</td>
                      <td>${l.pricePerMonth}/mo</td>
                      <td>{l.distanceFromSchool}</td>
                      <td>{l.petFriendly ? 'Yes' : 'No'}</td>
                      <td>{l.furnished ? 'Yes' : 'No'}</td>
                      <td>
                        <button
                          className={`btn btn-sm ${l.isAvailable ? 'btn-ghost-accent' : 'btn-secondary'}`}
                          onClick={() => toggleAvailability(l._id, !l.isAvailable)}
                        >
                          {l.isAvailable ? 'Available' : 'Hidden'}
                        </button>
                      </td>
                      <td style={{ fontFamily: 'monospace' }}>{l.contactPhone}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-danger-ghost btn-xs" onClick={() => del(l._id)}>
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

