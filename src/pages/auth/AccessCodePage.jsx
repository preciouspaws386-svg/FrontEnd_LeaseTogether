import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AccessCodePage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return toast.error('Please enter your access code');
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-code', { code });
      sessionStorage.setItem('accessCode', code.trim().toUpperCase());
      sessionStorage.setItem('accessCodeType', res.data?.type || '');
      // toast is shown after we route based on type
      const type = res.data?.type;
      if (type === 'landlord') {
        toast.success('Code verified. Create your listing →');
        navigate('/landlord/create-listing');
      } else {
        toast.success('Code verified. Create your profile →');
        navigate('/signup');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate">
        <div className="auth-logo">
          <div style={{ fontSize: 36 }}>🏠</div>
        </div>
        <h1 className="auth-title">Enter Access Code</h1>
        <p className="auth-subtitle">
          Enter the access code provided after subscription or by your leasing office.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Property Access Code</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. SUNRISE24"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 16, textAlign: 'center' }}
              autoFocus
            />
            <div style={{ fontSize: 12, color: 'var(--grey-2)', marginTop: 6, textAlign: 'center' }}>
              Get this code from your leasing office or property flyer
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Checking...' : 'Enter Community →'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--grey-2)' }}>
          Already have an account?{' '}
          <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => navigate('/login')}>
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
}

