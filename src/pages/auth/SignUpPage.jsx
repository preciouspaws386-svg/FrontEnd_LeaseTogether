import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { COMMUNITIES, formatCommunity } from '../../data/communities';
import { compressImage } from '../../utils/compressImage';
import axios from '../../api/axios';

const INITIAL = {
  firstName: '',
  lastInitial: '',
  email: '',
  password: '',
  apartmentId: '',
  apartmentName: '',
  photos: [],
  age: '',
  major: '',
  bio: '',
  moveInTimeframe: 'ASAP',
  intent: '',
  school: '',
  schoolName: '',
  campusPreference: '',
  socialVibe: '',
  weekendPlans: '',
  energyLevel: '',
  conflictStyle: '',
  personalSpace: '',
  lifestylePace: '',
  rechargeStyle: '',
  roommateValue: '',
  dailyRoutine: '',
  communicationStyle: '',
  hobbies: '',
};

// Group schools by state for the dropdown
const SCHOOLS_BY_STATE = {
  TX: ['University of Texas at Austin', 'Texas A&M University', 'University of Houston', 'Texas State University', 'Baylor University'],
  CO: ['University of Colorado Boulder', 'University of Denver', 'Colorado State University', 'University of Colorado Denver'],
  WA: ['University of Washington', 'Washington State University', 'Seattle University', 'Western Washington University'],
  CA: ['University of California Los Angeles', 'University of California Berkeley', 'Stanford University', 'USC', 'San Diego State University'],
  NY: ['New York University', 'Columbia University', 'Cornell University', 'SUNY Schools', 'Fordham University'],
  FL: ['University of Florida', 'Florida State University', 'University of Miami', 'Florida International University'],
  OH: ['Ohio State University', 'Ohio University', 'University of Cincinnati', 'Case Western Reserve'],
  MI: ['University of Michigan', 'Michigan State University', 'Wayne State University'],
  IL: ['University of Illinois', 'Northwestern University', 'DePaul University', 'Loyola University'],
  PA: ['University of Pennsylvania', 'Penn State', 'Carnegie Mellon', 'Temple University'],
  GA: ['Georgia Tech', 'University of Georgia', 'Georgia State University', 'Emory University'],
  NC: ['Duke University', 'UNC Chapel Hill', 'NC State', 'Wake Forest'],
  AZ: ['Arizona State University', 'University of Arizona'],
  MA: ['Harvard', 'MIT', 'Boston University', 'Northeastern University'],
  VA: ['University of Virginia', 'Virginia Tech', 'George Mason University'],
  NJ: ['Rutgers', 'Princeton', 'Stevens Institute'],
  OR: ['University of Oregon', 'Oregon State University'],
  MN: ['University of Minnesota', 'Minnesota State University'],
  WI: ['University of Wisconsin', 'Marquette University'],
  TN: ['Vanderbilt University', 'University of Tennessee', 'Middle Tennessee State'],
  MD: ['University of Maryland', 'Johns Hopkins', 'Towson University'],
  CT: ['Yale University', 'University of Connecticut', ' Fairfield University'],
  MO: ['Washington University in St. Louis', 'University of Missouri', 'Missouri State'],
  IN: ['Indiana University', 'Purdue University', 'Notre Dame'],
  SC: ['University of South Carolina', 'Clemson University'],
  KY: ['University of Kentucky', 'Louisville University'],
  LA: ['Tulane University', 'Louisiana State University', 'University of Louisiana'],
  OK: ['University of Oklahoma', 'Oklahoma State University'],
  KS: ['University of Kansas', 'Kansas State University'],
  IA: ['University of Iowa', 'Iowa State University'],
  AR: ['University of Arkansas', 'Arkansas State University'],
  NV: ['University of Nevada Las Vegas', 'University of Nevada Reno'],
  UT: ['University of Utah', 'Brigham Young University', 'Utah State University'],
  NM: ['University of New Mexico', 'New Mexico State University'],
  NE: ['University of Nebraska', 'Creighton University'],
  ID: ['University of Idaho', 'Boise State University'],
  HI: ['University of Hawaii', 'Hawaii Pacific University'],
  AL: ['University of Alabama', 'Auburn University', 'UAB'],
  MS: ['University of Mississippi', 'Mississippi State University'],
  WV: ['West Virginia University'],
  NH: ['Dartmouth College', 'University of New Hampshire'],
  ME: ['University of Maine', 'Bowdoin College'],
  VT: ['University of Vermont', 'Middlebury College'],
  RI: ['Brown University', 'Providence College'],
  DE: ['University of Delaware', 'Delaware State University'],
  DC: ['Georgetown University', 'George Washington University', 'American University'],
  AK: ['University of Alaska Anchorage', 'University of Alaska Fairbanks'],
  MT: ['University of Montana', 'Montana State University'],
  WY: ['University of Wyoming'],
  SD: ['University of South Dakota', 'South Dakota State'],
  ND: ['University of North Dakota', 'North Dakota State'],
};

const STATES = Object.keys(SCHOOLS_BY_STATE).sort();

export default function SignUpPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL);
  const [verifiedApartment, setVerifiedApartment] = useState(null);
  const [manualApartment, setManualApartment] = useState(false);
  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);
  const [touched, setTouched] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();
  
  // School selection state
  const [selectedState, setSelectedState] = useState('');
  const [schoolSearch, setSchoolSearch] = useState('');
  const [filteredSchools, setFilteredSchools] = useState([]);

  // Filter schools based on search
  useEffect(() => {
    if (schoolSearch.trim()) {
      const search = schoolSearch.toLowerCase();
      const allSchools = Object.values(SCHOOLS_BY_STATE).flat();
      const matches = allSchools.filter(s => s.toLowerCase().includes(search)).slice(0, 10);
      setFilteredSchools(matches);
    } else if (selectedState && SCHOOLS_BY_STATE[selectedState]) {
      setFilteredSchools(SCHOOLS_BY_STATE[selectedState]);
    } else {
      setFilteredSchools([]);
    }
  }, [schoolSearch, selectedState]);

  useEffect(() => {
    const apt = sessionStorage.getItem('verifiedApartment');
    if (!apt) {
      toast.error('Please enter a valid community access code first');
      navigate('/access-code', { replace: true });
      return;
    }
    const parsed = JSON.parse(apt);
    setVerifiedApartment(parsed);
    setForm((f) => ({ ...f, apartmentId: parsed._id, apartmentName: parsed.name }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const touch = (k) => setTouched((t) => ({ ...t, [k]: true }));
  const touchMany = (keys) => setTouched((t) => keys.reduce((acc, k) => ({ ...acc, [k]: true }), { ...t }));

  const onPhotosSelected = async (files) => {
    const list = Array.from(files || []);
    if (list.length === 0) return;
    const current = Array.isArray(form.photos) ? form.photos : [];
    const remaining = Math.max(0, 5 - current.length);
    if (remaining === 0) return toast.error('You can upload up to 5 photos');

    const toAdd = list.slice(0, remaining);
    try {
      const base64s = await Promise.all(toAdd.map((f) => compressImage(f, { maxSizeKB: 500, maxDim: 800, quality: 0.7 })));
      set('photos', [...current, ...base64s].slice(0, 5));
    } catch (err) {
      toast.error(err?.message || 'Something went wrong');
    }
  };

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const errors = (() => {
    const e = {};
    const first = String(form.firstName || '').trim();
    const lastInit = String(form.lastInitial || '').trim();
    const email = String(form.email || '').trim();
    const pass = String(form.password || '');

    if (!first) e.firstName = 'First name is required';
    else if (!/^[A-Za-z\s'-]+$/.test(first)) e.firstName = 'First name must contain letters only';

    if (!lastInit || !/^[A-Za-z]$/.test(lastInit)) e.lastInitial = 'Please enter just 1 letter';

    if (!EMAIL_RE.test(email)) e.email = 'Please enter a valid email address';

    if (pass.length < 6) e.password = 'Password must be at least 6 characters';

    if (!verifiedApartment) {
      const community = String(form.apartmentName || '').trim();
      if (!community) e.apartmentName = 'Please select your apartment community';
    }

    const ageRaw = String(form.age || '').trim();
    if (step >= 2 || touched.age) {
      const ageNum = Number(ageRaw);
      if (!ageRaw || !Number.isFinite(ageNum)) e.age = 'You must be at least 18 to join';
      else if (ageNum < 18) e.age = 'You must be at least 18 to join';
    }

    if (step >= 2 || touched.intent) {
      if (!form.intent) e.intent = 'Please select one';
    }

    return e;
  })();

  const isValid = (k) => touched[k] && !errors[k] && String(form[k] || '').trim();
  const isInvalid = (k) => touched[k] && !!errors[k];

  const toastFriendlyError = (err) => {
    const rawMessage = err?.response?.data?.message;
    if (rawMessage) return toast.error(`❌ ${rawMessage}`);
    const msg = String(rawMessage || '').toLowerCase();
    if (msg.includes('email already')) return toast.error('❌ That email is already registered. Try signing in');
    if (msg.includes('password') && (msg.includes('minlength') || msg.includes('shorter') || msg.includes('at least 6'))) {
      return toast.error('❌ Password must be at least 6 characters');
    }
    if (msg.includes('email') && msg.includes('valid')) return toast.error('❌ Please enter a valid email address');
    if (msg.includes('password') && msg.includes('required')) return toast.error('❌ Please fill in all required fields');
    if (msg.includes('required')) return toast.error('❌ Please fill in all required fields');
    return toast.error('❌ Something went wrong. Please try again');
  };

  const opt = (field, value, emoji = '') => (
    <div key={value} className={`opt ${form[field] === value ? 'on' : ''}`} onClick={() => set(field, value)}>
      {emoji && <span style={{ marginRight: 6 }}>{emoji}</span>}
      {value}
    </div>
  );

  const handleSubmit = async () => {
    if (submittingRef.current) return;
    touchMany(['firstName', 'lastInitial', 'email', 'password', 'apartmentName', 'age', 'intent']);
    if (errors.firstName || errors.lastInitial || errors.email || errors.password || errors.apartmentName || errors.age || errors.intent) {
      if (errors.firstName || errors.lastInitial || errors.email || errors.password || errors.apartmentName) setStep(1);
      else setStep(2);
      return;
    }
    submittingRef.current = true;
    setLoading(true);
    try {
      const payload = { ...form, age: form.age ? parseInt(form.age, 10) : undefined };
      if (Array.isArray(payload.photos)) payload.photos = payload.photos.filter(Boolean).slice(0, 5);
      await register(payload);
      toast.success('✅ Profile created! Welcome to the community');
      navigate('/browse');
    } catch (err) {
      toastFriendlyError(err);
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  const TOTAL_STEPS = 5;

  return (
    <div className="auth-page" style={{ alignItems: 'flex-start', paddingTop: 40, paddingBottom: 40 }}>
      <div className="auth-card animate" style={{ maxWidth: 520 }}>
        <div className="auth-logo">
          <div style={{ fontSize: 28 }}>🏠</div>
        </div>
        <h1 className="auth-title">Create Your Profile</h1>

        <div className="step-track">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} className={`step-seg ${step > i + 1 ? 'done' : step === i + 1 ? 'active' : ''}`} />
          ))}
        </div>

        {step === 1 && (
          <div>
            <p style={{ fontSize: 13, color: 'var(--grey-2)', marginBottom: 20, textAlign: 'center' }}>
              Step 1 of 5 — Account Info
            </p>
            {verifiedApartment ? (
              <div
                style={{
                  background: 'var(--accent-dim)',
                  border: '1px solid var(--accent-line)',
                  borderRadius: 'var(--r-sm)',
                  padding: '10px 14px',
                  marginBottom: 18,
                  fontSize: 13,
                }}
              >
                🏢 Joining: <strong>{verifiedApartment.name}</strong> — {verifiedApartment.city}, {verifiedApartment.state}
              </div>
            ) : (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 12.5, color: 'var(--grey-2)', marginBottom: 8, textAlign: 'center' }}>
                  (Access code skipped for now) Select your community below.
                </div>
                {!manualApartment ? (
                  <>
                    <div className="form-group">
                      <label className="form-label">Apartment Community</label>
                      <select
                        className={`form-select ${isInvalid('apartmentName') ? 'input-invalid' : touched.apartmentName && !errors.apartmentName ? 'input-valid' : ''}`}
                        value={form.apartmentName}
                        onChange={(e) => {
                          setForm((f) => ({ ...f, apartmentId: '', apartmentName: e.target.value }));
                        }}
                        onBlur={() => touch('apartmentName')}
                      >
                        <option value="">Select your apartment community</option>
                        {COMMUNITIES.map((c) => (
                          <option key={formatCommunity(c)} value={formatCommunity(c)}>
                            {formatCommunity(c)}
                          </option>
                        ))}
                      </select>
                      {isInvalid('apartmentName') && <div className="field-error">{errors.apartmentName}</div>}
                    </div>
                    <button className="btn btn-secondary btn-full" type="button" onClick={() => setManualApartment(true)}>
                      Enter manually
                    </button>
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label className="form-label">Apartment Community (manual)</label>
                      <div className="input-wrap">
                        <input
                          className={`form-input ${isInvalid('apartmentName') ? 'input-invalid' : touched.apartmentName && !errors.apartmentName ? 'input-valid' : ''}`}
                          value={form.apartmentName}
                          onChange={(e) => set('apartmentName', e.target.value)}
                          onBlur={() => touch('apartmentName')}
                          placeholder="e.g. Sunrise Residences"
                        />
                        {touched.apartmentName && !errors.apartmentName && form.apartmentName.trim() && <span className="field-check">✓</span>}
                      </div>
                      {isInvalid('apartmentName') && <div className="field-error">{errors.apartmentName}</div>}
                    </div>
                    <button className="btn btn-secondary btn-full" type="button" onClick={() => setManualApartment(false)}>
                      Use dropdown
                    </button>
                  </>
                )}
              </div>
            )}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <div className="input-wrap">
                  <input
                    className={`form-input ${isInvalid('firstName') ? 'input-invalid' : isValid('firstName') ? 'input-valid' : ''}`}
                    type="text"
                    placeholder="Taylor"
                    value={form.firstName}
                    onChange={(e) => set('firstName', e.target.value)}
                    onBlur={() => touch('firstName')}
                  />
                  {isValid('firstName') && <span className="field-check">✓</span>}
                </div>
                {isInvalid('firstName') && <div className="field-error">{errors.firstName}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Last Initial *</label>
                <div className="input-wrap">
                  <input
                    className={`form-input ${isInvalid('lastInitial') ? 'input-invalid' : isValid('lastInitial') ? 'input-valid' : ''}`}
                    type="text"
                    placeholder="R"
                    maxLength={1}
                    value={form.lastInitial}
                    onChange={(e) => set('lastInitial', e.target.value.toUpperCase())}
                    onBlur={() => touch('lastInitial')}
                  />
                  {isValid('lastInitial') && <span className="field-check">✓</span>}
                </div>
                {isInvalid('lastInitial') && <div className="field-error">{errors.lastInitial}</div>}
              </div>
              <div className="form-group full">
                <label className="form-label">Email Address *</label>
                <div className="input-wrap">
                  <input
                    className={`form-input ${isInvalid('email') ? 'input-invalid' : isValid('email') ? 'input-valid' : ''}`}
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    onBlur={() => touch('email')}
                  />
                  {isValid('email') && <span className="field-check">✓</span>}
                </div>
                {isInvalid('email') && <div className="field-error">{errors.email}</div>}
              </div>
              <div className="form-group full">
                <label className="form-label">Password *</label>
                <div className="input-wrap">
                  <input
                    className={`form-input ${isInvalid('password') ? 'input-invalid' : isValid('password') ? 'input-valid' : ''}`}
                    type="password"
                    placeholder="At least 6 characters"
                    value={form.password}
                    onChange={(e) => set('password', e.target.value)}
                    onBlur={() => touch('password')}
                  />
                  {isValid('password') && <span className="field-check">✓</span>}
                </div>
                {isInvalid('password') && <div className="field-error">{errors.password}</div>}
              </div>
            </div>
            <button
              className="btn btn-primary btn-full"
              onClick={() => {
                touchMany(['firstName', 'lastInitial', 'email', 'password', 'apartmentName']);
                if (errors.firstName || errors.lastInitial || errors.email || errors.password || errors.apartmentName) return;
                setStep(2);
              }}
            >
              Continue →
            </button>
            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--grey-2)' }}>
              Already have an account? <Link to="/login" style={{ color: 'var(--accent)' }}>Sign In</Link>
            </p>
          </div>
        )}

        {step === 2 && (
          <div>
            <p style={{ fontSize: 13, color: 'var(--grey-2)', marginBottom: 20, textAlign: 'center' }}>
              Step 2 of 5 — Select Your School
            </p>
            <div className="form-group">
              <label className="form-label">🎓 Which university do you attend?</label>
              <div style={{ fontSize: 12, color: 'var(--grey-2)', marginBottom: 12 }}>
                Search for your school or select your state to browse
              </div>
              
              {/* State selector */}
              <div style={{ marginBottom: 12 }}>
                <select
                  className="form-select"
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setSchoolSearch('');
                    setForm(f => ({ ...f, school: '', schoolName: '' }));
                  }}
                  style={{ marginBottom: 8 }}
                >
                  <option value="">Select your state</option>
                  {STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              
              {/* School search */}
              <input
                className="form-input"
                type="text"
                placeholder="Search for your university..."
                value={schoolSearch}
                onChange={(e) => setSchoolSearch(e.target.value)}
                style={{ marginBottom: 8 }}
              />
              
              {/* School list */}
              <div className="opts" style={{ maxHeight: 200, overflowY: 'auto' }}>
                {filteredSchools.length > 0 ? (
                  filteredSchools.map(school => (
                    <div
                      key={school}
                      className={`opt ${form.schoolName === school ? 'on' : ''}`}
                      onClick={() => {
                        setForm(f => ({ ...f, school: school, schoolName: school }));
                        touch('schoolName');
                      }}
                    >
                      🎓 {school}
                    </div>
                  ))
                ) : (
                  <div style={{ padding: 12, textAlign: 'center', color: 'var(--grey-2)', fontSize: 13 }}>
                    {selectedState || schoolSearch ? 'No schools found. Try a different search.' : 'Select a state or start typing to search'}
                  </div>
                )}
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">🏢 What's your housing preference?</label>
              <div className="opts">
                {['On Campus', 'Off Campus', 'No Preference'].map(v => (
                  <div
                    key={v}
                    className={`opt ${form.campusPreference === v ? 'on' : ''}`}
                    onClick={() => set('campusPreference', v)}
                  >
                    {v === 'On Campus' ? '🏫' : v === 'Off Campus' ? '🏢' : '🤷'} {v}
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" onClick={() => setStep(1)}>
                ← Back
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => {
                  if (!form.schoolName) {
                    toast.error('Please select your school');
                    return;
                  }
                  setStep(3);
                }}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <p style={{ fontSize: 13, color: 'var(--grey-2)', marginBottom: 20, textAlign: 'center' }}>
              Step 3 of 5 — About You
            </p>
            <div className="form-group">
              <label className="form-label">Profile photos (optional)</label>
              <input
                className="form-input"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => onPhotosSelected(e.target.files)}
              />
              <div style={{ fontSize: 12, color: 'var(--grey-2)', marginTop: 8 }}>
                Upload 1–5 images. Previews will show below.
              </div>
              {Array.isArray(form.photos) && form.photos.length > 0 && (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                  {form.photos.map((src, idx) => (
                    <div key={idx} style={{ position: 'relative' }}>
                      <img
                        src={src}
                        alt={`Upload ${idx + 1}`}
                        style={{ width: 78, height: 78, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--line)' }}
                      />
                      <button
                        type="button"
                        onClick={() => set('photos', form.photos.filter((_, i) => i !== idx))}
                        className="btn btn-danger-ghost btn-xs"
                        style={{ position: 'absolute', top: 6, right: 6, padding: '3px 7px' }}
                        aria-label="Remove photo"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Age (18+) *</label>
                <div className="input-wrap">
                  <input
                    className={`form-input ${isInvalid('age') ? 'input-invalid' : touched.age && !errors.age && String(form.age || '').trim() ? 'input-valid' : ''}`}
                    type="number"
                    min="18"
                    placeholder="21"
                    value={form.age}
                    onChange={(e) => set('age', e.target.value)}
                    onBlur={() => touch('age')}
                  />
                  {touched.age && !errors.age && String(form.age || '').trim() && <span className="field-check">✓</span>}
                </div>
                {isInvalid('age') && <div className="field-error">{errors.age}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">What are you studying? (optional)</label>
                <input className="form-input" type="text" placeholder="e.g. Nursing, Business" value={form.major} onChange={(e) => set('major', e.target.value)} />
              </div>
              <div className="form-group full">
                <label className="form-label">Short bio (optional)</label>
                <input className="form-input" type="text" placeholder="Tell people a little about yourself" value={form.bio} onChange={(e) => set('bio', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">What are you here for? *</label>
              <div className="opts">
                {[
                  ['Looking for a Roommate', '🤝'],
                  ['Looking to Swap Rooms', '🔄'],
                  ['Lease Available', '🏠'],
                ].map(([v, e]) => (
                  <div
                    key={v}
                    className={`opt ${form.intent === v ? 'on' : ''}`}
                    onClick={() => {
                      set('intent', v);
                      touch('intent');
                    }}
                  >
                    <span style={{ marginRight: 6 }}>{e}</span>
                    {v}
                  </div>
                ))}
              </div>
              {touched.intent && errors.intent && <div className="field-error">{errors.intent}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Move-in timeframe</label>
              <div className="opts">
                {['ASAP', 'Within 1 month', '1-3 months', 'Just browsing'].map((v) => opt('moveInTimeframe', v))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" onClick={() => setStep(2)}>
                ← Back
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => {
                  touchMany(['age', 'intent']);
                  if (errors.age || errors.intent) return;
                  setStep(4);
                }}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <p style={{ fontSize: 13, color: 'var(--grey-2)', marginBottom: 20, textAlign: 'center' }}>
              Step 4 of 5 — Your Vibe
            </p>
            <div className="form-group">
              <label className="form-label">😎 Your social vibe?</label>
              <div className="opts">
                {[
                  ['Always outside / social', '🥳'],
                  ['Chill but down for plans', '😎'],
                  ['Lowkey & selective', '🧘'],
                  ['Homebody 100%', '🛌'],
                ].map(([v, e]) => opt('socialVibe', v, e))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">🗓 Weekend plans usually look like…</label>
              <div className="opts">
                {[
                  ['Going out / parties', '🎉'],
                  ['Small hangouts / kickbacks', '🍻'],
                  ['Gaming / Netflix', '🎮'],
                  ['Resetting / catching up', '📚'],
                ].map(([v, e]) => opt('weekendPlans', v, e))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">⚡ Your energy around people?</label>
              <div className="opts">
                {[
                  ['High energy', '⚡'],
                  ['Balanced', '🙂'],
                  ['Calm', '😌'],
                  ['Keep to myself', '🤐'],
                ].map(([v, e]) => opt('energyLevel', v, e))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">🗣 How do you handle conflict?</label>
              <div className="opts">
                {[
                  ['Say it right away', '🗣'],
                  ['Talk it out calmly', '🤝'],
                  ['Avoid it if possible', '😬'],
                  ['Need time first', '⏳'],
                ].map(([v, e]) => opt('conflictStyle', v, e))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">🚫 Personal space level?</label>
              <div className="opts">
                {[
                  ['I need my space', '🚫'],
                  ['Balanced', '👍'],
                  ["Doesn't matter", '🤷'],
                  ['I like being around people', '👥'],
                ].map(([v, e]) => opt('personalSpace', v, e))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" onClick={() => setStep(3)}>
                ← Back
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setStep(5)}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <p style={{ fontSize: 13, color: 'var(--grey-2)', marginBottom: 20, textAlign: 'center' }}>
              Step 5 of 5 — Almost Done
            </p>
            <div className="form-group">
              <label className="form-label">🏃 Your lifestyle pace?</label>
              <div className="opts">
                {[
                  ['Always moving', '🏃'],
                  ['Balanced', '⚖️'],
                  ['Chill / slow-paced', '🐢'],
                  ['Depends on the week', '🔄'],
                ].map(([v, e]) => opt('lifestylePace', v, e))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">🔋 What recharges you?</label>
              <div className="opts">
                {[
                  ['Being social', '👥'],
                  ['Alone time', '🛌'],
                  ['Music / hobbies', '🎧'],
                  ['Sleep', '😴'],
                ].map(([v, e]) => opt('rechargeStyle', v, e))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">🤝 What matters most in a roommate?</label>
              <div className="opts">
                {[
                  ['Respect', '🤝'],
                  ['Cleanliness', '🧼'],
                  ['Similar lifestyle', '🎯'],
                  ['Peace & quiet', '😴'],
                ].map(([v, e]) => opt('roommateValue', v, e))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">📅 Your typical daily routine?</label>
              <div className="opts">
                {[
                  ['Structured', '📅'],
                  ['Balanced', '⚖️'],
                  ['Flexible', '🔄'],
                  ['No real routine', '🤷'],
                ].map(([v, e]) => opt('dailyRoutine', v, e))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">📱 How do you usually communicate?</label>
              <div className="opts">
                {[
                  ['Text', '📱'],
                  ['Call', '📞'],
                  ['In person', '🗣'],
                  ['Depends on situation', '😎'],
                ].map(([v, e]) => opt('communicationStyle', v, e))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">🔥 What are you into? (optional)</label>
              <input className="form-input" type="text" placeholder="Gym, Gaming, Sports, Music..." value={form.hobbies} onChange={(e) => set('hobbies', e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" onClick={() => setStep(4)}>
                ← Back
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit} disabled={loading}>
                {loading ? 'Creating...' : 'Create My Profile →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

