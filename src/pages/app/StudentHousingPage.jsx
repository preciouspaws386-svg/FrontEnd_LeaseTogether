import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Layout/Sidebar';
import TopBar from '../../components/Layout/TopBar';

function Badge({ children, variant = 'accent' }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        border: '1px solid var(--line-2)',
        color: variant === 'accent' ? 'var(--accent)' : 'var(--ink-3)',
        background: variant === 'accent' ? 'rgba(59,130,246,0.12)' : 'transparent',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}

export default function StudentHousingPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);

  const schoolId = user?.school?._id || user?.school;

  const load = async () => {
    if (!schoolId) return;
    setLoading(true);
    try {
      const res = await api.get('/listings', {
        params: { availability: 'available', school: schoolId },
      });
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
  }, [schoolId]);

  const cards = useMemo(
    () =>
      listings.map((l) => {
        const photo = Array.isArray(l.photos) && l.photos.length ? l.photos[0] : null;
        return { ...l, photo };
      }),
    [listings]
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <TopBar title="Student Housing" />
        <div className="page-body">
          <div className="page-header">
            <div className="page-title">Student Housing Marketplace</div>
            <div className="page-subtitle">Browse listings for your school</div>
          </div>

          {loading ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--grey-2)' }}>Loading…</div>
          ) : cards.length === 0 ? (
            <div style={{ padding: '50px 0', textAlign: 'center', color: 'var(--grey-2)' }}>
              No listings found
            </div>
          ) : (
            <div className="card-grid">
              {cards.map((l) => (
                <div key={l._id} className="card" style={{ overflow: 'hidden' }}>
                  <div style={{ height: 150, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--line)' }}>
                    {l.photo ? (
                      <img src={l.photo} alt="Listing" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : null}
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>
                          {l.type} · {l.distanceFromSchool}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--grey-2)', marginBottom: 8 }}>
                          ${l.pricePerMonth}/month · {l.listingCategory}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                      {l.petFriendly ? <Badge variant="accent">🐾 Pet-friendly</Badge> : null}
                      {l.furnished ? <Badge variant="accent">🛋️ Furnished</Badge> : null}
                      {l.utilitiesIncluded ? <Badge variant="accent">⚡ Utilities</Badge> : null}
                    </div>

                    <div style={{ fontSize: 12.5, color: 'var(--grey-2)', marginBottom: 12 }}>
                      {l.bedrooms} bedroom · Parking {l.parking ? 'available' : 'not listed'}
                    </div>

                    <a className="btn btn-primary btn-full" href={`tel:${l.contactPhone}`} style={{ display: 'block', textDecoration: 'none' }}>
                      Contact: {l.contactPhone}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

