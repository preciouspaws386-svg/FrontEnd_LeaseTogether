import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { compressImage } from '../../utils/compressImage';

const US_STATES = [
  'AL',
  'AK',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'FL',
  'GA',
  'HI',
  'IA',
  'ID',
  'IL',
  'IN',
  'KS',
  'KY',
  'LA',
  'MA',
  'MD',
  'ME',
  'MI',
  'MN',
  'MO',
  'MS',
  'MT',
  'NC',
  'ND',
  'NE',
  'NH',
  'NJ',
  'NM',
  'NV',
  'NY',
  'OH',
  'OK',
  'OR',
  'PA',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VA',
  'VT',
  'WA',
  'WI',
  'WV',
  'WY',
];

const INTENTS = [
  { code: 'RM', label: 'Looking for a Roommate', emoji: '🤝' },
  { code: 'RS', label: 'Looking to Swap Rooms', emoji: '🔄' },
  { code: 'LT', label: 'Sublease / Lease Takeover', emoji: '🏠' },
  { code: 'GM', label: 'Group Match (3–4 Roommates)', emoji: '👥' },
  { code: 'SM', label: 'Social / Meet Up', emoji: '🎉' },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

const LIFESTYLE_VIBE_FIELDS = [
  {
    title: 'How often do you party?',
    field: 'partyingFrequency',
    options: ['Every weekend', 'A few times a month', 'Occasionally', 'Not my thing'],
  },
  { title: 'Do you drink?', field: 'drinking', options: ['No', 'Occasionally', 'Socially', 'Pretty often'] },
  {
    title: 'Do you smoke or vape (tobacco/nicotine products)?',
    field: 'smoking',
    options: ['No', 'Occasionally', 'Regularly (outside)', 'Regularly (indoors)'],
  },
  {
    title: 'Do you use marijuana or other substances?',
    field: 'marijuana',
    options: ['No', 'Occasionally', 'Regularly'],
  },
  {
    title: 'How do you feel about roommates who party?',
    field: 'roommatePartying',
    options: ['Totally fine', 'Occasionally fine', 'Prefer not', 'Not okay'],
  },
  {
    title: 'How do you feel about roommates who drink?',
    field: 'roommateDrinking',
    options: ['Totally fine', 'Occasionally fine', 'Prefer not', 'Not okay'],
  },
  {
    title: 'How do you feel about roommates who smoke?',
    field: 'roommateSmoking',
    options: ['Totally fine', 'Only outside', 'Prefer not', 'Not okay'],
  },
  {
    title: "What's your typical sleep schedule?",
    field: 'sleepSchedule',
    options: ['In bed before 11pm', 'Midnight–1am', 'After 1am', 'No consistent schedule'],
  },
  {
    title: "What's your noise level at home?",
    field: 'homeNoise',
    options: ['Quiet', 'Moderate', 'Music/TV often', 'Loud/active'],
  },
  {
    title: 'Do you have pets or plan to?',
    field: 'pets',
    options: ['Have one (dog)', 'Have one (cat)', 'Planning to get one', 'Fine with pets', 'Prefer no pets'],
  },
  {
    title: 'Overnight guests okay?',
    field: 'overnightGuestsOkay',
    options: ['Totally fine', 'Occasionally', 'Rarely', 'Not comfortable'],
  },
  {
    title: 'Significant other stays over often?',
    field: 'significantOther',
    options: ['Yes often', 'Sometimes', 'Rarely', 'No'],
  },
];

const LIVING_TOGETHER_FIELDS = [
  { title: 'How clean are you?', field: 'cleanliness', options: ['Super clean', 'Pretty clean', 'I try', 'It is what it is'] },
  { title: 'How do you handle shared chores?', field: 'chores', options: ['Prefer a schedule', 'Split as needed', "I'll do my part", 'Not a big priority'] },
  {
    title: 'How do you keep shared spaces?',
    field: 'sharedSpaces',
    options: ['Always clean', 'Usually clean', 'Sometimes messy', "Doesn't matter"],
  },
  {
    title: 'Are you okay sharing food?',
    field: 'foodSharing',
    options: ['Share everything', 'Some shared items', 'Prefer separate', "Don't touch my stuff"],
  },
  { title: 'Do you cook often?', field: 'cooking', options: ['Every day', 'A few times a week', 'Rarely', 'Never'] },
  { title: 'How often are you home?', field: 'homeTime', options: ['Mostly home', 'Balanced', 'In and out', 'Barely there'] },
  {
    title: 'Study/work style at home?',
    field: 'studyWork',
    options: ['Quiet and focused', 'Music/background noise', 'Flexible', 'Rarely study at home'],
  },
  {
    title: 'How do you feel about sharing common items?',
    field: 'sharedItems',
    options: ['Totally fine', 'Some sharing', 'Prefer separate', "Doesn't matter"],
  },
  {
    title: 'How do you handle bills and responsibilities?',
    field: 'bills',
    options: ['Very responsible / on time', 'Usually on top of it', 'Sometimes late', 'Go with the flow'],
  },
];

const PERSONALITY_FIELDS = [
  { title: 'Your social vibe?', field: 'socialVibe', options: ['Always outside / social', 'Chill but down for plans', 'Lowkey & selective', 'Homebody 100%'] },
  { title: 'Weekend plans usually look like...?', field: 'weekendPlans', options: ['Going out / parties', 'Small hangouts / kickbacks', 'Gaming / Netflix', 'Resetting / catching up'] },
  { title: 'Energy around people?', field: 'energyLevel', options: ['High energy', 'Balanced', 'Calm', 'Keep to myself'] },
  { title: 'How do you handle conflict?', field: 'conflictStyle', options: ['Say it right away', 'Talk it out calmly', 'Avoid if possible', 'Need time first'] },
  { title: 'Personal space level?', field: 'personalSpace', options: ['I need my space', 'Balanced', "Doesn't matter", 'I like being around people'] },
  { title: 'Lifestyle pace?', field: 'lifestylePace', options: ['Always moving', 'Balanced', 'Chill / slow-paced', 'Depends on the week'] },
  { title: 'What recharges you?', field: 'rechargeStyle', options: ['Being social', 'Alone time', 'Music / hobbies', 'Sleep'] },
  { title: 'What matters most in a roommate?', field: 'roommateValue', options: ['Respect', 'Cleanliness', 'Similar lifestyle', 'Peace & quiet'] },
  { title: 'Daily routine?', field: 'dailyRoutine', options: ['Structured', 'Balanced', 'Flexible', 'No real routine'] },
  { title: 'How do you communicate?', field: 'communicationStyle', options: ['Text', 'Call', 'In person', 'Depends'] },
];

const GUESTS_FIELDS = [
  { title: 'How often do you have guests over?', field: 'guestFrequency', options: ['Rarely', 'Occasionally', 'Often'] },
  { title: 'Overnight guests?', field: 'overnightGuests', options: ['Never', 'Sometimes', 'Frequently'] },
];

const INITIAL = {
  firstName: '',
  lastInitial: '',
  email: '',
  password: '',

  // School selection
  selectedState: '',
  schoolId: '',
  campusPreference: '',

  // Profile setup
  photos: [],
  age: '',
  major: '',
  bio: '',
  moveInTimeframe: 'ASAP',
  intent: '',
  monthlyBudget: '',
  roommatePreference: 'No preference',
  lgbtqFriendly: false,
  religion: 'No preference',
  transportation: [],
  socialMedia: {
    instagram: '',
    snapchat: '',
    tiktok: '',
    facebook: '',
    other: '',
  },

  lifestyleVibes: {
    partyingFrequency: [],
    drinking: [],
    smoking: [],
    marijuana: [],
    roommatePartying: [],
    roommateDrinking: [],
    roommateSmoking: [],
    sleepSchedule: [],
    homeNoise: [],
    pets: [],
    overnightGuestsOkay: [],
    significantOther: [],
  },
  livingTogether: {
    cleanliness: [],
    chores: [],
    sharedSpaces: [],
    foodSharing: [],
    cooking: [],
    homeTime: [],
    studyWork: [],
    sharedItems: [],
    bills: [],
  },
  personalityVibe: {
    socialVibe: [],
    weekendPlans: [],
    energyLevel: [],
    conflictStyle: [],
    personalSpace: [],
    lifestylePace: [],
    rechargeStyle: [],
    roommateValue: [],
    dailyRoutine: [],
    communicationStyle: [],
  },
  guestsAndVisitors: {
    guestFrequency: [],
    overnightGuests: [],
  },
  hobbies: '',
};

function MultiSelectSection({ title, sectionKey, fieldKey, options, form, toggle }) {
  const values = form?.[sectionKey]?.[fieldKey] || [];
  return (
    <div className="form-group">
      <div className="form-label" style={{ marginBottom: 10 }}>
        {title}
      </div>
      <div className="opts">
        {options.map((opt) => {
          const on = values.includes(opt);
          return (
            <div key={opt} className={`opt ${on ? 'on' : ''}`} onClick={() => toggle(sectionKey, fieldKey, opt)}>
              {opt}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SignUpPageNew() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const submittingRef = useRef(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  const accessCode = useMemo(() => sessionStorage.getItem('accessCode') || '', []);

  const [statesLoading, setStatesLoading] = useState(false);
  const [schools, setSchools] = useState([]);
  const [schoolSearch, setSchoolSearch] = useState('');

  useEffect(() => {
    if (!accessCode) {
      toast.error('Please enter a valid access code first');
      navigate('/access-code', { replace: true });
    }
  }, [accessCode, navigate]);

  useEffect(() => {
    const loadSchools = async () => {
      if (!form.selectedState) return setSchools([]);
      setStatesLoading(true);
      try {
        const res = await api.get(`/auth/schools?state=${encodeURIComponent(form.selectedState)}`);
        setSchools(res.data?.schools || []);
      } catch (err) {
        setSchools([]);
      } finally {
        setStatesLoading(false);
      }
    };
    loadSchools();
  }, [form.selectedState]);

  const toggleArrayValue = (arr, v) => {
    const set = new Set(arr || []);
    if (set.has(v)) set.delete(v);
    else set.add(v);
    return Array.from(set);
  };

  const toggleNestedArray = (sectionKey, fieldKey, value) => {
    setForm((f) => ({
      ...f,
      [sectionKey]: {
        ...f[sectionKey],
        [fieldKey]: toggleArrayValue(f?.[sectionKey]?.[fieldKey], value),
      },
    }));
  };

  const toggleTransportation = (opt) => {
    setForm((f) => ({ ...f, transportation: toggleArrayValue(f.transportation, opt) }));
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const touch = (k) => setTouched((t) => ({ ...t, [k]: true }));
  const touchMany = (keys) => setTouched((t) => keys.reduce((acc, k) => ({ ...acc, [k]: true }), { ...t }));

  const errors = useMemo(() => {
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

    if (step >= 2) {
      if (!form.selectedState) e.selectedState = 'Please select a state';
      if (!form.schoolId) e.schoolId = 'Please select your university';
      if (!form.campusPreference) e.campusPreference = 'Please choose on-campus or off-campus preference';
    }

    if (step >= 3) {
      const ageNum = Number(String(form.age || '').trim());
      if (!form.age || !Number.isFinite(ageNum) || ageNum < 18) e.age = 'You must be at least 18 to join';
      if (!form.intent) e.intent = 'Please select an intent';
      if (!form.monthlyBudget) e.monthlyBudget = 'Please choose a monthly budget';
    }

    return e;
  }, [form, step]);

  const isInvalid = (k) => touched[k] && !!errors[k];

  const filteredSchools = useMemo(() => {
    const q = schoolSearch.trim().toLowerCase();
    if (!q) return schools;
    return schools.filter((s) => String(s.name || '').toLowerCase().includes(q)).slice(0, 12);
  }, [schools, schoolSearch]);

  const handleSubmit = async () => {
    if (submittingRef.current) return;
    touchMany(['firstName', 'lastInitial', 'email', 'password', 'selectedState', 'schoolId', 'campusPreference', 'age', 'intent', 'monthlyBudget']);
    if (errors.firstName || errors.lastInitial || errors.email || errors.password || errors.selectedState || errors.schoolId || errors.campusPreference || errors.age || errors.intent || errors.monthlyBudget) {
      return;
    }

    submittingRef.current = true;
    setLoading(true);
    try {
      const payload = {
        firstName: form.firstName,
        lastInitial: String(form.lastInitial || '').trim().toUpperCase().slice(0, 1),
        email: form.email,
        password: form.password,

        accessCode,
        schoolId: form.schoolId,
        campusPreference: form.campusPreference,

        age: form.age ? Number(form.age) : undefined,
        major: form.major || '',
        bio: form.bio || '',
        photos: Array.isArray(form.photos) ? form.photos.filter(Boolean).slice(0, 5) : [],
        moveInTimeframe: form.moveInTimeframe,

        intent: form.intent,
        monthlyBudget: form.monthlyBudget,
        roommatePreference: form.roommatePreference,
        lgbtqFriendly: Boolean(form.lgbtqFriendly),
        religion: form.religion,
        transportation: Array.isArray(form.transportation) ? form.transportation : [],
        socialMedia: form.socialMedia || {},

        lifestyleVibes: form.lifestyleVibes,
        livingTogether: form.livingTogether,
        personalityVibe: form.personalityVibe,
        guestsAndVisitors: form.guestsAndVisitors,
        hobbies: form.hobbies || '',
      };

      await register(payload);
      toast.success('✅ Profile created!');
      navigate('/browse');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create profile');
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  const onPhotosSelected = async (files) => {
    const list = Array.from(files || []);
    if (list.length === 0) return;
    if (list.length > 5) return toast.error('You can upload up to 5 photos');
    try {
      const base64s = await Promise.all(list.map((f) => compressImage(f, { maxSizeKB: 500, maxDim: 800, quality: 0.7 })));
      set('photos', base64s.filter(Boolean).slice(0, 5));
    } catch (err) {
      toast.error(err?.message || 'Something went wrong');
    }
  };

  const TOTAL_STEPS = 5;

  const RADIO_OPT = ({ value, emoji }) => (
    <div
      className={`opt ${form.campusPreference === value ? 'on' : ''}`}
      onClick={() => {
        set('campusPreference', value);
        touch('campusPreference');
      }}
    >
      {emoji ? <span style={{ marginRight: 6 }}>{emoji}</span> : null}
      {value}
    </div>
  );

  return (
    <div className="auth-page" style={{ alignItems: 'flex-start', paddingTop: 40, paddingBottom: 40 }}>
      <div className="auth-card animate" style={{ maxWidth: 720 }}>
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
            <p style={{ fontSize: 13, color: 'var(--grey-2)', marginBottom: 20, textAlign: 'center' }}>Step 1 of 5 — Account Info</p>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input
                  className={`form-input ${isInvalid('firstName') ? 'input-invalid' : touched.firstName && !errors.firstName ? 'input-valid' : ''}`}
                  type="text"
                  placeholder="Taylor"
                  value={form.firstName}
                  onChange={(e) => set('firstName', e.target.value)}
                  onBlur={() => touch('firstName')}
                />
                {isInvalid('firstName') && <div className="field-error">{errors.firstName}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Last Initial *</label>
                <input
                  className={`form-input ${isInvalid('lastInitial') ? 'input-invalid' : touched.lastInitial && !errors.lastInitial ? 'input-valid' : ''}`}
                  type="text"
                  placeholder="R"
                  maxLength={1}
                  value={form.lastInitial}
                  onChange={(e) => set('lastInitial', e.target.value.toUpperCase())}
                  onBlur={() => touch('lastInitial')}
                />
                {isInvalid('lastInitial') && <div className="field-error">{errors.lastInitial}</div>}
              </div>

              <div className="form-group full">
                <label className="form-label">Email Address *</label>
                <input
                  className={`form-input ${isInvalid('email') ? 'input-invalid' : touched.email && !errors.email ? 'input-valid' : ''}`}
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  onBlur={() => touch('email')}
                />
                {isInvalid('email') && <div className="field-error">{errors.email}</div>}
              </div>

              <div className="form-group full">
                <label className="form-label">Password *</label>
                <input
                  className={`form-input ${isInvalid('password') ? 'input-invalid' : touched.password && !errors.password ? 'input-valid' : ''}`}
                  type="password"
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  onBlur={() => touch('password')}
                />
                {isInvalid('password') && <div className="field-error">{errors.password}</div>}
              </div>
            </div>

            <button
              className="btn btn-primary btn-full"
              onClick={() => {
                touchMany(['firstName', 'lastInitial', 'email', 'password']);
                if (!errors.firstName && !errors.lastInitial && !errors.email && !errors.password) setStep(2);
              }}
            >
              Continue →
            </button>

            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--grey-2)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--accent)' }}>
                Sign In
              </Link>
            </p>
          </div>
        )}

        {step === 2 && (
          <div>
            <p style={{ fontSize: 13, color: 'var(--grey-2)', marginBottom: 20, textAlign: 'center' }}>
              Step 2 of 5 — Select State / University
            </p>

            <div className="form-group">
              <label className="form-label">Step 1 — Select State *</label>
              <select
                className={`form-select ${isInvalid('selectedState') ? 'input-invalid' : ''}`}
                value={form.selectedState}
                onChange={(e) => {
                  setForm((f) => ({
                    ...f,
                    selectedState: e.target.value,
                    schoolId: '',
                  }));
                  setTouched((t) => ({ ...t, selectedState: true }));
                }}
              >
                <option value="">Select a state</option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {isInvalid('selectedState') && <div className="field-error">{errors.selectedState}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Step 2 — Select University/School *</label>
              <input className="form-input" placeholder="Search your school..." value={schoolSearch} onChange={(e) => setSchoolSearch(e.target.value)} />

              <div className="opts" style={{ maxHeight: 220, overflowY: 'auto', marginTop: 12 }}>
                {statesLoading ? (
                  <div style={{ padding: 12, color: 'var(--grey-2)' }}>Loading schools...</div>
                ) : filteredSchools.length ? (
                  filteredSchools.map((s) => (
                    <div
                      key={s._id}
                      className={`opt ${form.schoolId === s._id ? 'on' : ''}`}
                      onClick={() => {
                        setForm((f) => ({ ...f, schoolId: s._id }));
                        touch('schoolId');
                      }}
                    >
                      🎓 {s.name}
                    </div>
                  ))
                ) : (
                  <div style={{ padding: 12, color: 'var(--grey-2)' }}>
                    {form.selectedState ? 'No schools found for this state.' : 'Select a state to see schools.'}
                  </div>
                )}
              </div>
              {isInvalid('schoolId') && <div className="field-error">{errors.schoolId}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Step 3 — Campus Preference *</label>
              <div className="opts">
                <RADIO_OPT value="On Campus" emoji="🏫" />
                <RADIO_OPT value="Off Campus" emoji="🏢" />
                <RADIO_OPT value="No Preference" emoji="🤷" />
              </div>
              {isInvalid('campusPreference') && <div className="field-error">{errors.campusPreference}</div>}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" type="button" onClick={() => setStep(1)}>
                ← Back
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                type="button"
                onClick={() => {
                  touchMany(['selectedState', 'schoolId', 'campusPreference']);
                  if (!errors.selectedState && !errors.schoolId && !errors.campusPreference) setStep(3);
                }}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <p style={{ fontSize: 13, color: 'var(--grey-2)', marginBottom: 20, textAlign: 'center' }}>Step 3 of 5 — Profile Setup</p>

            <div className="form-group">
              <label className="form-label">Profile photos (optional)</label>
              <input className="form-input" type="file" accept="image/*" multiple onChange={(e) => onPhotosSelected(e.target.files)} />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Age (18+) *</label>
                <input className={`form-input ${isInvalid('age') ? 'input-invalid' : ''}`} type="number" min="18" value={form.age} onChange={(e) => set('age', e.target.value)} onBlur={() => touch('age')} />
                {isInvalid('age') && <div className="field-error">{errors.age}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">What are you studying? (optional)</label>
                <input className="form-input" value={form.major} onChange={(e) => set('major', e.target.value)} placeholder="e.g. Nursing, Business" />
              </div>
              <div className="form-group full">
                <label className="form-label">Short bio (optional)</label>
                <input className="form-input" value={form.bio} onChange={(e) => set('bio', e.target.value)} placeholder="Tell people a little about yourself" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Move-in timeframe</label>
              <div className="opts">
                {['ASAP', 'Within 1 month', '1-3 months', 'Just browsing'].map((v) => (
                  <div key={v} className={`opt ${form.moveInTimeframe === v ? 'on' : ''}`} onClick={() => set('moveInTimeframe', v)}>
                    {v}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">What are you here for? *</label>
              <div className="opts">
                {INTENTS.map((it) => (
                  <div
                    key={it.code}
                    className={`opt ${form.intent === it.code ? 'on' : ''}`}
                    onClick={() => {
                      set('intent', it.code);
                      touch('intent');
                    }}
                  >
                    <span style={{ marginRight: 6 }}>{it.emoji}</span>
                    {it.label}
                  </div>
                ))}
              </div>
              {isInvalid('intent') && <div className="field-error">{errors.intent}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Monthly Budget *</label>
              <div className="opts">
                {MONTHLY_BUDGETS.map((b) => (
                  <div
                    key={b}
                    className={`opt ${form.monthlyBudget === b ? 'on' : ''}`}
                    onClick={() => {
                      set('monthlyBudget', b);
                      touch('monthlyBudget');
                    }}
                  >
                    {b}
                  </div>
                ))}
              </div>
              {isInvalid('monthlyBudget') && <div className="field-error">{errors.monthlyBudget}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Roommate preference (optional)</label>
              <div className="opts">
                {ROOMMATE_PREFERENCES.map((v) => (
                  <div key={v} className={`opt ${form.roommatePreference === v ? 'on' : ''}`} onClick={() => set('roommatePreference', v)}>
                    {v}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">🌈 LGBTQ+ friendly (optional)</label>
              <label className="toggle" style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                <input type="checkbox" checked={!!form.lgbtqFriendly} onChange={(e) => set('lgbtqFriendly', e.target.checked)} />
                <span className="toggle-slider" />
              </label>
            </div>

            <div className="form-group">
              <label className="form-label">Religion (optional)</label>
              <select className="form-select" value={form.religion} onChange={(e) => set('religion', e.target.value)}>
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
                {TRANSPORTATION_OPTIONS.map((opt) => (
                  <div
                    key={opt}
                    className={`opt ${form.transportation.includes(opt) ? 'on' : ''}`}
                    onClick={() => toggleTransportation(opt)}
                  >
                    {opt}
                  </div>
                ))}
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
                  <div key={key} className="form-group">
                    <input
                      className="form-input"
                      value={form.socialMedia[key] || ''}
                      onChange={(e) => setForm((f) => ({ ...f, socialMedia: { ...f.socialMedia, [key]: e.target.value } }))}
                      placeholder={`${label} handle/link`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" type="button" onClick={() => setStep(2)}>
                ← Back
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} type="button" onClick={() => setStep(4)}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <p style={{ fontSize: 13, color: 'var(--grey-2)', marginBottom: 20, textAlign: 'center' }}>Step 4 of 5 — Lifestyle Vibes & Living Together</p>

            {LIFESTYLE_VIBE_FIELDS.map((q) => (
              <MultiSelectSection
                key={q.field}
                title={q.title}
                sectionKey="lifestyleVibes"
                fieldKey={q.field}
                options={q.options}
                form={form}
                toggle={toggleNestedArray}
              />
            ))}

            {LIVING_TOGETHER_FIELDS.map((q) => (
              <MultiSelectSection
                key={q.field}
                title={q.title}
                sectionKey="livingTogether"
                fieldKey={q.field}
                options={q.options}
                form={form}
                toggle={toggleNestedArray}
              />
            ))}

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" type="button" onClick={() => setStep(3)}>
                ← Back
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} type="button" onClick={() => setStep(5)}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <p style={{ fontSize: 13, color: 'var(--grey-2)', marginBottom: 20, textAlign: 'center' }}>Step 5 of 5 — Personality & Guests</p>

            {PERSONALITY_FIELDS.map((q) => (
              <MultiSelectSection
                key={q.field}
                title={q.title}
                sectionKey="personalityVibe"
                fieldKey={q.field}
                options={q.options}
                form={form}
                toggle={toggleNestedArray}
              />
            ))}

            {GUESTS_FIELDS.map((q) => (
              <MultiSelectSection
                key={q.field}
                title={q.title}
                sectionKey="guestsAndVisitors"
                fieldKey={q.field}
                options={q.options}
                form={form}
                toggle={toggleNestedArray}
              />
            ))}

            <div className="form-group">
              <label className="form-label">What are you into? (optional)</label>
              <input className="form-input" placeholder="Gym, Gaming, Sports, Music..." value={form.hobbies} onChange={(e) => set('hobbies', e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" type="button" onClick={() => setStep(4)}>
                ← Back
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} type="button" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Creating...' : 'Create My Profile →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

