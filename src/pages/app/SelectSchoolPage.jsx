import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Sidebar from '../../components/Layout/Sidebar';
import TopBar from '../../components/Layout/TopBar';
import { useAuth } from '../../context/AuthContext';

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

const CAMPUS_PREFERENCES = ['On Campus', 'Off Campus', 'No Preference'];

export default function SelectSchoolPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedState, setSelectedState] = useState('');
  const [schoolSearch, setSchoolSearch] = useState('');
  const [schools, setSchools] = useState([]);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [schoolId, setSchoolId] = useState('');
  const [campusPreference, setCampusPreference] = useState('');
  const [showSchoolRequest, setShowSchoolRequest] = useState(false);
  const [schoolRequestName, setSchoolRequestName] = useState('');
  const [schoolRequestSending, setSchoolRequestSending] = useState(false);

  useEffect(() => {
    if (user?.school) navigate('/browse', { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    const load = async () => {
      if (!selectedState) return setSchools([]);
      setLoadingSchools(true);
      try {
        const res = await api.get(`/auth/schools?state=${encodeURIComponent(selectedState)}`);
        setSchools(res.data?.schools || []);
      } catch {
        setSchools([]);
      } finally {
        setLoadingSchools(false);
      }
    };
    load();
  }, [selectedState]);

  const filteredSchools = useMemo(() => {
    const q = schoolSearch.trim().toLowerCase();
    if (!q) return schools;
    return schools.filter((s) => String(s.name || '').toLowerCase().includes(q)).slice(0, 12);
  }, [schools, schoolSearch]);

  const submitSchoolRequest = async (e) => {
    e?.preventDefault?.();
    const name = schoolRequestName.trim();
    if (!name) return toast.error('Please enter your school name');
    setSchoolRequestSending(true);
    try {
      await api.post('/schools/request', {
        schoolName: name,
        userEmail: user?.email ? String(user.email).trim() : '',
      });
      toast.success("Thanks! We'll add your school soon.");
      setSchoolRequestName('');
      setShowSchoolRequest(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSchoolRequestSending(false);
    }
  };

  const submit = async () => {
    if (!selectedState) return toast.error('Please select a state');
    if (!schoolId) return toast.error('Please select your university');
    if (!campusPreference) return toast.error('Please select campus preference');

    try {
      await api.patch('/users/school', { schoolId, campusPreference });
      toast.success('School updated');
      navigate('/browse', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update school');
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <TopBar title="Select Your School" />
        <div className="page-body">
          <div className="card" style={{ maxWidth: 720 }}>
            <div className="page-subtitle" style={{ marginBottom: 14 }}>
              Choose your school to enable matching within your campus.
            </div>

            <div className="form-group">
              <label className="form-label">State *</label>
              <select className="form-select" value={selectedState} onChange={(e) => { setSelectedState(e.target.value); setSchoolId(''); }}>
                <option value="">Select a state</option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">University/School *</label>
              <input className="form-input" value={schoolSearch} placeholder="Search your school..." onChange={(e) => setSchoolSearch(e.target.value)} />
              <div className="opts" style={{ maxHeight: 220, overflowY: 'auto', marginTop: 12 }}>
                {loadingSchools ? (
                  <div style={{ padding: 12, color: 'var(--grey-2)' }}>Loading schools...</div>
                ) : filteredSchools.length ? (
                  filteredSchools.map((s) => (
                    <div
                      key={s._id}
                      className={`opt ${schoolId === s._id ? 'on' : ''}`}
                      onClick={() => setSchoolId(s._id)}
                    >
                      🎓 {s.name}
                    </div>
                  ))
                ) : (
                  <div style={{ padding: 12, color: 'var(--grey-2)' }}>
                    {selectedState ? 'No schools found' : 'Select a state to see schools'}
                  </div>
                )}
              </div>
              <div style={{ marginTop: 12 }}>
                {!showSchoolRequest ? (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '6px 12px', fontSize: 12 }}
                    onClick={() => setShowSchoolRequest(true)}
                  >
                    Don&apos;t see your school? Let us know
                  </button>
                ) : (
                  <div className="card" style={{ padding: 12, marginTop: 8 }}>
                    <div className="form-label" style={{ marginBottom: 8 }}>
                      Request a school
                    </div>
                    <input
                      className="form-input"
                      placeholder="School name"
                      value={schoolRequestName}
                      onChange={(e) => setSchoolRequestName(e.target.value)}
                    />
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <button type="button" className="btn btn-primary btn-sm" disabled={schoolRequestSending} onClick={submitSchoolRequest}>
                        {schoolRequestSending ? 'Sending…' : 'Submit'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setShowSchoolRequest(false);
                          setSchoolRequestName('');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Campus Preference *</label>
              <div className="opts">
                {CAMPUS_PREFERENCES.map((p) => (
                  <div key={p} className={`opt ${campusPreference === p ? 'on' : ''}`} onClick={() => setCampusPreference(p)}>
                    {p === 'On Campus' ? '🏫' : p === 'Off Campus' ? '🏢' : '🤷'} {p}
                  </div>
                ))}
              </div>
            </div>

            <button className="btn btn-primary btn-full" onClick={submit}>
              Continue →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

