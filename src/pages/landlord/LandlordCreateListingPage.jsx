import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import TopBar from '../../components/Layout/TopBar';
import { compressImage } from '../../utils/compressImage';
import { US_STATES } from '../../data/usStates';

const EMPTY_FORM = {
  school: '',
  type: 'Room',
  listingCategory: 'For Rent',
  furnished: false,
  pricePerMonth: '',
  deposit: '',
  bedrooms: '1',
  petFriendly: false,
  petDeposit: '',
  utilitiesIncluded: false,
  distanceFromSchool: '1 mile',
  parking: false,
  photos: [],
  description: '',
  contactPhone: '',
};

const BEDROOMS = ['1', '2', '3+'];
const DISTANCES = ['1 mile', '3 miles', '5 miles', '10+ miles'];
const TYPES = ['Room', 'Whole House', 'Studio', 'Other'];
const CATEGORIES = ['For Rent', 'Sublease'];

export default function LandlordCreateListingPage() {
  const navigate = useNavigate();

  const [selectedState, setSelectedState] = useState('');
  const [schools, setSchools] = useState([]);
  const [loadingSchools, setLoadingSchools] = useState(false);

  const [accessCode, setAccessCode] = useState('');
  const [checking, setChecking] = useState(true);

  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const code = sessionStorage.getItem('accessCode') || '';
    const codeType = sessionStorage.getItem('accessCodeType') || '';
    if (!code || codeType !== 'landlord') {
      toast.error('Please enter a valid landlord access code');
      navigate('/access-code', { replace: true });
      return;
    }
    setAccessCode(code);
    setChecking(false);
  }, [navigate]);

  useEffect(() => {
    if (checking) return;
    if (!selectedState) {
      setSchools([]);
      setForm((f) => ({ ...f, school: '' }));
      return;
    }
    const loadSchools = async () => {
      setLoadingSchools(true);
      try {
        const res = await api.get(`/auth/schools?state=${encodeURIComponent(selectedState)}`);
        setSchools(res.data?.schools || []);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load schools');
        setSchools([]);
      } finally {
        setLoadingSchools(false);
      }
    };
    loadSchools();
  }, [checking, selectedState]);

  const photoPreviewUrls = useMemo(() => (form.photos || []).filter(Boolean), [form.photos]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onChoosePhotos = async (files) => {
    const arr = Array.from(files || []);
    if (arr.length === 0) return;
    const room = Math.max(0, 5 - (form.photos || []).length);
    const slice = arr.slice(0, room);
    if (slice.length === 0) return toast.error('Photo limit reached (max 5)');

    const nextPhotos = [];
    for (const file of slice) {
      try {
        const compressed = await compressImage(file, { maxSizeKB: 550, maxDim: 900, quality: 0.7 });
        if (compressed) nextPhotos.push(compressed);
      } catch (err) {
        toast.error(err.message || 'Failed to process a photo');
      }
    }

    setForm((f) => ({ ...f, photos: [...(f.photos || []), ...nextPhotos].slice(0, 5) }));
  };

  const removePhotoAt = (idx) => {
    setForm((f) => ({ ...f, photos: (f.photos || []).filter((_, i) => i !== idx) }));
  };

  const validate = () => {
    if (!selectedState) return 'Please select a state';
    if (!form.school) return 'Please select your school';
    if (!form.type) return 'Please select a listing type';
    if (!form.listingCategory) return 'Please select a listing category';
    if (!form.pricePerMonth || Number(form.pricePerMonth) <= 0) return 'Please enter price per month';
    if (!form.bedrooms) return 'Please select bedrooms';
    if (!form.distanceFromSchool) return 'Please select distance from school';
    if (!form.description?.trim()) return 'Please add a description';
    if (!form.contactPhone?.trim()) return 'Please add a contact phone number';
    if (!Array.isArray(form.photos) || form.photos.length < 1) return 'Please add at least one photo';
    if (!accessCode) return 'Missing landlord access code';
    return null;
  };

  const submit = async () => {
    const error = validate();
    if (error) return toast.error(error);
    setSaving(true);
    try {
      const payload = {
        ...form,
        listingState: selectedState,
        pricePerMonth: Number(form.pricePerMonth),
        deposit: form.deposit === '' || form.deposit == null ? undefined : Number(form.deposit),
        petDeposit: form.petDeposit === '' || form.petDeposit == null ? undefined : Number(form.petDeposit),
        photos: form.photos,
        accessCode,
      };

      await api.post('/listings', payload);
      toast.success('Listing posted successfully');

      sessionStorage.removeItem('accessCode');
      sessionStorage.removeItem('accessCodeType');
      navigate('/access-code', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post listing');
    } finally {
      setSaving(false);
    }
  };

  if (checking) {
    return (
      <div className="app-layout">
        <div className="main-content">
          <TopBar title="Create Listing" />
          <div className="page-body">Loading…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <div className="main-content">
        <TopBar title="Create Listing" />
        <div className="page-body">
          <div className="card" style={{ padding: 14, maxWidth: 980, margin: '0 auto' }}>
            <div className="page-subtitle" style={{ marginBottom: 14 }}>
              Post a listing using your landlord access code. Choose a state first, then the school for that state.
            </div>

            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">State *</label>
                <select
                  className="form-select"
                  value={selectedState}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSelectedState(v);
                    setForm((f) => ({ ...f, school: '' }));
                  }}
                >
                  <option value="">Select state</option>
                  {US_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">School *</label>
                <select
                  className="form-select"
                  value={form.school}
                  onChange={(e) => set('school', e.target.value)}
                  disabled={loadingSchools || !selectedState}
                >
                  <option value="">
                    {!selectedState ? 'Select a state first' : loadingSchools ? 'Loading…' : schools.length ? 'Select school' : 'No schools for this state'}
                  </option>
                  {schools.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
              <div className="form-group">
                <label className="form-label">Listing Type *</label>
                <select className="form-select" value={form.type} onChange={(e) => set('type', e.target.value)}>
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-select" value={form.listingCategory} onChange={(e) => set('listingCategory', e.target.value)}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
              <div className="form-group">
                <label className="form-label">Distance *</label>
                <select className="form-select" value={form.distanceFromSchool} onChange={(e) => set('distanceFromSchool', e.target.value)}>
                  {DISTANCES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Price / Month *</label>
                <input className="form-input" type="number" min={1} value={form.pricePerMonth} onChange={(e) => set('pricePerMonth', e.target.value)} />
              </div>
            </div>

            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
              <div className="form-group">
                <label className="form-label">Bedrooms *</label>
                <select className="form-select" value={form.bedrooms} onChange={(e) => set('bedrooms', e.target.value)}>
                  {BEDROOMS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Deposit</label>
                <input className="form-input" type="number" min={0} value={form.deposit} onChange={(e) => set('deposit', e.target.value)} />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: 12 }}>
              <label className="form-label">Contact Phone *</label>
              <input className="form-input" value={form.contactPhone} onChange={(e) => set('contactPhone', e.target.value)} />
            </div>

            <div className="form-group" style={{ marginTop: 12 }}>
              <label className="form-label">Photos (min 1, max 5) *</label>
              <input className="form-input" type="file" accept="image/*" multiple onChange={(e) => onChoosePhotos(e.target.files)} />

              {photoPreviewUrls.length ? (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                  {photoPreviewUrls.map((src, idx) => (
                    <div key={idx} style={{ position: 'relative', width: 110, height: 80 }}>
                      <img src={src} alt={`photo-${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} />
                      <button
                        type="button"
                        className="btn btn-danger-ghost btn-xs"
                        style={{ position: 'absolute', top: -8, right: -8 }}
                        onClick={() => removePhotoAt(idx)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 13, color: 'var(--grey-2)', marginTop: 10 }}>No photos selected yet</div>
              )}
            </div>

            <div className="form-group" style={{ marginTop: 12 }}>
              <label className="form-label">Description *</label>
              <textarea className="form-input" value={form.description} onChange={(e) => set('description', e.target.value)} rows={4} />
            </div>

            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
              <div className="form-group">
                <label className="form-label">Furnished</label>
                <div className="opts">
                  <div className={`opt ${form.furnished ? 'on' : ''}`} onClick={() => set('furnished', true)}>
                    Yes
                  </div>
                  <div className={`opt ${!form.furnished ? 'on' : ''}`} onClick={() => set('furnished', false)}>
                    No
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Utilities Included</label>
                <div className="opts">
                  <div className={`opt ${form.utilitiesIncluded ? 'on' : ''}`} onClick={() => set('utilitiesIncluded', true)}>
                    Yes
                  </div>
                  <div className={`opt ${!form.utilitiesIncluded ? 'on' : ''}`} onClick={() => set('utilitiesIncluded', false)}>
                    No
                  </div>
                </div>
              </div>
            </div>

            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
              <div className="form-group">
                <label className="form-label">Parking</label>
                <div className="opts">
                  <div className={`opt ${form.parking ? 'on' : ''}`} onClick={() => set('parking', true)}>
                    Yes
                  </div>
                  <div className={`opt ${!form.parking ? 'on' : ''}`} onClick={() => set('parking', false)}>
                    No
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Pet Friendly</label>
                <div className="opts">
                  <div className={`opt ${form.petFriendly ? 'on' : ''}`} onClick={() => set('petFriendly', true)}>
                    Yes
                  </div>
                  <div className={`opt ${!form.petFriendly ? 'on' : ''}`} onClick={() => set('petFriendly', false)}>
                    No
                  </div>
                </div>
              </div>
            </div>

            {form.petFriendly ? (
              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                <div className="form-group">
                  <label className="form-label">Pet Deposit (optional)</label>
                  <input className="form-input" type="number" min={0} value={form.petDeposit} onChange={(e) => set('petDeposit', e.target.value)} />
                </div>
                <div />
              </div>
            ) : null}

            <button className="btn btn-primary btn-full" disabled={saving} onClick={submit} style={{ marginTop: 18 }}>
              {saving ? 'Posting…' : 'Post Listing'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
