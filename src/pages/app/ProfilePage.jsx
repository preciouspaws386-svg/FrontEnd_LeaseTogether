import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Layout/Sidebar';
import TopBar from '../../components/Layout/TopBar';
import Modal from '../../components/UI/Modal';
import TagPill from '../../components/UI/TagPill';
import IntentBadge from '../../components/UI/IntentBadge';
import { compressImage } from '../../utils/compressImage';
import { FiLink } from 'react-icons/fi';
import { FaFacebookF, FaInstagram, FaSnapchatGhost, FaTiktok } from 'react-icons/fa';

const INTENT_OPTIONS = [
  { code: 'RM', label: 'Looking for a Roommate', emoji: '🤝' },
  { code: 'RS', label: 'Looking to Swap Rooms', emoji: '🔄' },
  { code: 'LT', label: 'Sublease / Lease Takeover', emoji: '🏠' },
  { code: 'GM', label: 'Group Match (3–4 Roommates)', emoji: '👥' },
  { code: 'SM', label: 'Social / Meet Up', emoji: '🎉' },
];

const MONTHLY_BUDGETS = ['$500–$800', '$800–$1200', '$1200+'];
const ROOMMATE_PREFERENCES = ['No preference', 'Male', 'Female'];
const RELIGION_OPTIONS = [
  'No preference',
  'Non-religious / Atheist',
  'Christian',
  'Muslim',
  'Jewish',
  'Hindu',
  'Buddhist',
  'Spiritual',
  'Other',
  'Prefer not to say',
];
const TRANSPORTATION_OPTIONS = ['Car', 'Bike', 'Uber/Rideshare', 'Walk', 'Public Transit'];

export default function ProfilePage() {
  const { user, updateStatus, updateProfile, updatePhotos } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [photoSaving, setPhotoSaving] = useState(false);

  if (!user) return null;

  const displayName = `${user.firstName} ${user.lastInitial}.`;
  const buildSocialUrl = (platform, handle) => {
    const raw = String(handle || '').trim();
    if (!raw) return '';
    if (/^https?:\/\//i.test(raw)) return raw;
    const h = raw.replace(/^@/, '');
    switch (platform) {
      case 'instagram':
        return `https://instagram.com/${h}`;
      case 'snapchat':
        return `https://www.snapchat.com/add/${h}`;
      case 'tiktok':
        return `https://www.tiktok.com/@${h}`;
      case 'facebook':
        return `https://www.facebook.com/${h}`;
      case 'other':
      default:
        return h.includes('.') ? `https://${h}` : h;
    }
  };

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
      intent: user.intent || 'RM',
      monthlyBudget: user.monthlyBudget || '$500–$800',
      roommatePreference: user.roommatePreference || 'No preference',
      lgbtqFriendly: !!user.lgbtqFriendly,
      religion: user.religion || 'No preference',
      transportation: Array.isArray(user.transportation) ? user.transportation : [],
      socialMedia: user.socialMedia || {
        instagram: '',
        snapchat: '',
        tiktok: '',
        facebook: '',
        other: '',
      },
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
            {user?.memberSince?.month && user?.memberSince?.year ? (
              <div style={{ fontSize: 12.5, color: 'var(--grey-2)', marginTop: 6 }}>
                Member since {user.memberSince.month} {user.memberSince.year}
              </div>
            ) : null}
            {user.intent && <div style={{ marginTop: 12 }}><IntentBadge intent={user.intent} /></div>}

            <div className="tag-row" style={{ marginTop: 14 }}>
              {[
                user?.personalityVibe?.socialVibe?.[0],
                user?.personalityVibe?.lifestylePace?.[0],
              ]
                .filter(Boolean)
                .map((t) => (
                  <TagPill key={t} label={t} />
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
              {[
                ['Age', user.age],
                ['Major', user.major],
                ['Move-in', user.moveInTimeframe],
                ['Social vibe', user?.personalityVibe?.socialVibe?.[0]],
                ['Routine', user?.personalityVibe?.dailyRoutine?.[0]],
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 11, color: 'var(--grey-2)', marginBottom: 2 }}>{k}</div>
                  <div style={{ fontSize: 13 }}>{v || '—'}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12.5, color: 'var(--grey-2)', marginBottom: 8 }}>
                {user.lgbtqFriendly ? '🌈 LGBTQ+ friendly' : ''}
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {user.socialMedia?.instagram ? (
                  <a href={buildSocialUrl('instagram', user.socialMedia.instagram)} target="_blank" rel="noopener noreferrer" className="btn btn-ghost-accent btn-xs" style={{ padding: '6px 10px' }}>
                    <FaInstagram />
                  </a>
                ) : null}
                {user.socialMedia?.snapchat ? (
                  <a href={buildSocialUrl('snapchat', user.socialMedia.snapchat)} target="_blank" rel="noopener noreferrer" className="btn btn-ghost-accent btn-xs" style={{ padding: '6px 10px' }}>
                    <FaSnapchatGhost />
                  </a>
                ) : null}
                {user.socialMedia?.tiktok ? (
                  <a href={buildSocialUrl('tiktok', user.socialMedia.tiktok)} target="_blank" rel="noopener noreferrer" className="btn btn-ghost-accent btn-xs" style={{ padding: '6px 10px' }}>
                    <FaTiktok />
                  </a>
                ) : null}
                {user.socialMedia?.facebook ? (
                  <a href={buildSocialUrl('facebook', user.socialMedia.facebook)} target="_blank" rel="noopener noreferrer" className="btn btn-ghost-accent btn-xs" style={{ padding: '6px 10px' }}>
                    <FaFacebookF />
                  </a>
                ) : null}
                {user.socialMedia?.other ? (
                  <a href={buildSocialUrl('other', user.socialMedia.other)} target="_blank" rel="noopener noreferrer" className="btn btn-ghost-accent btn-xs" style={{ padding: '6px 10px' }}>
                    <FiLink />
                  </a>
                ) : null}
              </div>
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
            {INTENT_OPTIONS.map((it) => (
              <div
                key={it.code}
                className={`opt ${form.intent === it.code ? 'on' : ''}`}
                onClick={() => set('intent', it.code)}
              >
                <span style={{ marginRight: 6 }}>{it.emoji}</span>
                {it.label}
              </div>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Move-in timeframe</label>
          <div className="opts">{['ASAP', 'Within 1 month', '1-3 months', 'Just browsing'].map((v) => opt('moveInTimeframe', v))}</div>
        </div>
        <div className="form-group">
          <label className="form-label">Monthly Budget *</label>
          <div className="opts">
            {MONTHLY_BUDGETS.map((b) => opt('monthlyBudget', b))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Roommate preference (optional)</label>
          <div className="opts">
            {ROOMMATE_PREFERENCES.map((p) => opt('roommatePreference', p))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">🌈 LGBTQ+ friendly</label>
          <label className="toggle" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
            <input type="checkbox" checked={!!form.lgbtqFriendly} onChange={(e) => set('lgbtqFriendly', e.target.checked)} />
            <span className="toggle-slider" />
          </label>
        </div>

        <div className="form-group">
          <label className="form-label">Religion (optional)</label>
          <select className="form-select" value={form.religion || 'No preference'} onChange={(e) => set('religion', e.target.value)}>
            {RELIGION_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Transportation (optional)</label>
          <div className="opts">
            {TRANSPORTATION_OPTIONS.map((t) => {
              const on = Array.isArray(form.transportation) && form.transportation.includes(t);
              return (
                <div
                  key={t}
                  className={`opt ${on ? 'on' : ''}`}
                  onClick={() => {
                    setForm((f) => {
                      const cur = Array.isArray(f.transportation) ? f.transportation : [];
                      const set = new Set(cur);
                      if (set.has(t)) set.delete(t);
                      else set.add(t);
                      return { ...f, transportation: Array.from(set) };
                    });
                  }}
                >
                  {t}
                </div>
              );
            })}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Social media (optional)</label>
          <div className="form-grid">
            {[
              ['instagram', 'Instagram'],
              ['snapchat', 'Snapchat'],
              ['tiktok', 'TikTok'],
              ['facebook', 'Facebook'],
              ['other', 'Other'],
            ].map(([key, label]) => (
              <div className="form-group" key={key}>
                <input
                  className="form-input"
                  value={form.socialMedia?.[key] || ''}
                  onChange={(e) => setForm((f) => ({ ...f, socialMedia: { ...(f.socialMedia || {}), [key]: e.target.value } }))}
                  placeholder={`${label} handle/link`}
                />
              </div>
            ))}
          </div>
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

