import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Layout/Sidebar';
import TopBar from '../../components/Layout/TopBar';
import Modal from '../../components/UI/Modal';
import TagPill from '../../components/UI/TagPill';
import IntentBadge from '../../components/UI/IntentBadge';
import { compressImage } from '../../utils/compressImage';

export default function ProfilePage() {
  const { user, updateStatus, updateProfile, updatePhotos } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [photoSaving, setPhotoSaving] = useState(false);

  if (!user) return null;

  const displayName = `${user.firstName} ${user.lastInitial}.`;

  const onPhotosSelected = async (files) => {
    const list = Array.from(files || []);
    if (list.length === 0) return;
    if (list.length > 5) return toast.error('You can upload up to 5 photos');
    setPhotoSaving(true);
    try {
      const base64s = await Promise.all(list.map((f) => compressImage(f, { maxSizeKB: 500, maxDim: 800, quality: 0.7 })));
      await updatePhotos(base64s.filter(Boolean).slice(0, 5));
      toast.success('Photos updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setPhotoSaving(false);
    }
  };

  const openEdit = () => {
    setForm({
      firstName: user.firstName,
      lastInitial: user.lastInitial,
      age: user.age || '',
      major: user.major || '',
      bio: user.bio || '',
      moveInTimeframe: user.moveInTimeframe || 'ASAP',
      intent: user.intent || 'Looking for a Roommate',
      socialVibe: user.socialVibe || '',
      weekendPlans: user.weekendPlans || '',
      energyLevel: user.energyLevel || '',
      conflictStyle: user.conflictStyle || '',
      personalSpace: user.personalSpace || '',
      lifestylePace: user.lifestylePace || '',
      rechargeStyle: user.rechargeStyle || '',
      roommateValue: user.roommateValue || '',
      dailyRoutine: user.dailyRoutine || '',
      communicationStyle: user.communicationStyle || '',
      hobbies: user.hobbies || '',
    });
    setEditOpen(true);
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const opt = (field, value) => (
    <div className={`opt ${form[field] === value ? 'on' : ''}`} onClick={() => set(field, value)}>
      {value}
    </div>
  );

  const save = async () => {
    setSaving(true);
    try {
      await updateProfile({ ...form, age: form.age ? Number(form.age) : undefined });
      toast.success('Profile updated');
      setEditOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (e) => {
    try {
      await updateStatus(e.target.checked);
      toast.success('Status updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <TopBar title="My Profile">
          <button className="btn btn-secondary btn-sm" onClick={openEdit}>
            Edit Profile
          </button>
        </TopBar>
        <div className="page-body">
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="toggle-wrap">
              <label className="toggle">
                <input type="checkbox" checked={!!user.isOpenToRoommate} onChange={toggle} />
                <span className="toggle-slider" />
              </label>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>
                  {user.isOpenToRoommate ? 'Open to Roommate' : 'Not Looking Right Now'}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--grey-2)' }}>Toggles your community availability</div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, marginBottom: 10 }}>
              Photos
            </div>
            {Array.isArray(user.photos) && user.photos.length > 0 ? (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                {user.photos.slice(0, 5).map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt={`Profile ${idx + 1}`}
                    style={{ width: 92, height: 92, objectFit: 'cover', borderRadius: 12, border: '1px solid var(--line)' }}
                  />
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 12.5, color: 'var(--grey-2)', marginBottom: 12 }}>
                No photos yet. Upload 1–5 images to show on your profile card.
              </div>
            )}

            <input
              className="form-input"
              type="file"
              accept="image/*"
              multiple
              disabled={photoSaving}
              onChange={(e) => onPhotosSelected(e.target.files)}
            />
            <div style={{ fontSize: 12, color: 'var(--grey-2)', marginTop: 8 }}>
              Uploading will replace your current photos (max 5).
            </div>
          </div>

          <div className="card">
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700 }}>{displayName}</div>
            <div style={{ fontSize: 13.5, color: 'var(--grey-2)', marginTop: 4 }}>{user.email}</div>
            <div style={{ fontSize: 12.5, color: 'var(--grey-2)', marginTop: 6 }}>
              {user.apartmentName || user.apartment?.name || 'Community'}
            </div>
            {user.intent && <div style={{ marginTop: 12 }}><IntentBadge intent={user.intent} /></div>}

            <div className="tag-row" style={{ marginTop: 14 }}>
              {[user.socialVibe, user.lifestylePace].filter(Boolean).map((t) => (
                <TagPill key={t} label={t} />
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
              {[
                ['Age', user.age],
                ['Major', user.major],
                ['Move-in', user.moveInTimeframe],
                ['Social vibe', user.socialVibe],
                ['Routine', user.dailyRoutine],
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 11, color: 'var(--grey-2)', marginBottom: 2 }}>{k}</div>
                  <div style={{ fontSize: 13 }}>{v || '—'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile">
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">First Name</label>
            <input className="form-input" value={form.firstName || ''} onChange={(e) => set('firstName', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Last Initial</label>
            <input className="form-input" maxLength={1} value={form.lastInitial || ''} onChange={(e) => set('lastInitial', e.target.value.toUpperCase())} />
          </div>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Age</label>
            <input className="form-input" type="number" min="18" value={form.age || ''} onChange={(e) => set('age', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Major (optional)</label>
            <input className="form-input" value={form.major || ''} onChange={(e) => set('major', e.target.value)} />
          </div>
          <div className="form-group full">
            <label className="form-label">Bio (optional)</label>
            <input className="form-input" value={form.bio || ''} onChange={(e) => set('bio', e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">What are you here for?</label>
          <div className="opts">
            {['Looking for a Roommate', 'Looking to Swap Rooms', 'Lease Available'].map((v) => opt('intent', v))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Move-in timeframe</label>
          <div className="opts">{['ASAP', 'Within 1 month', '1-3 months', 'Just browsing'].map((v) => opt('moveInTimeframe', v))}</div>
        </div>
        <div className="form-group">
          <label className="form-label">Social vibe</label>
          <div className="opts">
            {['Always outside / social', 'Chill but down for plans', 'Lowkey & selective', 'Homebody 100%'].map((v) => opt('socialVibe', v))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Weekend plans</label>
          <div className="opts">
            {['Going out / parties', 'Small hangouts / kickbacks', 'Gaming / Netflix', 'Resetting / catching up'].map((v) => opt('weekendPlans', v))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Energy level</label>
          <div className="opts">{['High energy', 'Balanced', 'Calm', 'Keep to myself'].map((v) => opt('energyLevel', v))}</div>
        </div>
        <div className="form-group">
          <label className="form-label">Conflict style</label>
          <div className="opts">{['Say it right away', 'Talk it out calmly', 'Avoid it if possible', 'Need time first'].map((v) => opt('conflictStyle', v))}</div>
        </div>
        <div className="form-group">
          <label className="form-label">Personal space</label>
          <div className="opts">{['I need my space', 'Balanced', "Doesn't matter", 'I like being around people'].map((v) => opt('personalSpace', v))}</div>
        </div>
        <div className="form-group">
          <label className="form-label">Lifestyle pace</label>
          <div className="opts">{['Always moving', 'Balanced', 'Chill / slow-paced', 'Depends on the week'].map((v) => opt('lifestylePace', v))}</div>
        </div>
        <div className="form-group">
          <label className="form-label">Recharge style</label>
          <div className="opts">{['Being social', 'Alone time', 'Music / hobbies', 'Sleep'].map((v) => opt('rechargeStyle', v))}</div>
        </div>
        <div className="form-group">
          <label className="form-label">Roommate value</label>
          <div className="opts">{['Respect', 'Cleanliness', 'Similar lifestyle', 'Peace & quiet'].map((v) => opt('roommateValue', v))}</div>
        </div>
        <div className="form-group">
          <label className="form-label">Daily routine</label>
          <div className="opts">{['Structured', 'Balanced', 'Flexible', 'No real routine'].map((v) => opt('dailyRoutine', v))}</div>
        </div>
        <div className="form-group">
          <label className="form-label">Communication style</label>
          <div className="opts">{['Text', 'Call', 'In person', 'Depends on situation'].map((v) => opt('communicationStyle', v))}</div>
        </div>
        <div className="form-group">
          <label className="form-label">Hobbies (optional)</label>
          <input className="form-input" value={form.hobbies || ''} onChange={(e) => set('hobbies', e.target.value)} />
        </div>

        <button className="btn btn-primary btn-full" disabled={saving} onClick={save}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </Modal>
    </div>
  );
}

