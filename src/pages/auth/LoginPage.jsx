import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import '../../styles/authForestTheme.css';

function ForestWatermark() {
  return (
    <svg className="auth-forest-watermark" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        fill="currentColor"
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"
      />
      <path fill="currentColor" d="M10 9h4v4h-4V9zm1 1v2h2v-2h-2z" opacity="0.9" />
    </svg>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success('Signed in');
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (!user.subscriptionActive) {
        navigate('/subscription');
      } else {
        navigate('/browse');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-forest-page auth-forest-page--centered">
      <ForestWatermark />
      <div className="auth-forest-login-card">
        <div className="auth-forest-login-title">Welcome back</div>
        <div className="auth-forest-login-sub">Sign in to continue</div>

        <form onSubmit={submit}>
          <div className="form-group auth-forest-section">
            <label className="auth-forest-label" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              className="auth-forest-input"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
          <div className="form-group auth-forest-section">
            <label className="auth-forest-label" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              className="auth-forest-input"
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
            />
          </div>
          <button type="submit" className="auth-forest-btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 22, fontSize: 14, color: '#cccccc' }}>
          No account?{' '}
          <Link to="/access-code" className="auth-forest-link">
            Enter your access code first
          </Link>
        </div>
      </div>
    </div>
  );
}
