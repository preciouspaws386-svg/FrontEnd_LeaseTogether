import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FiSearch, FiFileText, FiUsers, FiLock, FiLink, FiShield } from 'react-icons/fi';

const LIME = '#CCFF00';
const WHITE = '#FFFFFF';
const GRAY = '#CCCCCC';
const GRAY_MUTED = '#999999';

const SUBSCRIBE_URL = 'https://square.link/u/VMsuUwq0?src=sheet';

const iconWrap = {
  color: LIME,
  fontSize: 28,
  strokeWidth: 1.5,
};

function IconSwapArrows() {
  return (
    <svg width={28} height={28} viewBox="0 0 24 24" fill="none" aria-hidden style={{ flexShrink: 0 }}>
      <path
        d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"
        stroke={LIME}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AppBrandIcon() {
  return (
    <div
      style={{
        width: 72,
        height: 72,
        borderRadius: 20,
        background: 'linear-gradient(135deg, #7FCC00 0%, #CCFF00 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
      aria-hidden
    >
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M9.5 9.5h5v5h-5z"
          stroke="#FFFFFF"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path d="M11 12h2" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

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

  const sectionGap = { marginTop: 28 };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#000000',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <div
        style={{
          maxWidth: 480,
          margin: '0 auto',
          padding: '32px 20px 40px',
          boxSizing: 'border-box',
        }}
      >
        {/* 1 — App icon + title */}
        <header style={{ textAlign: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              marginBottom: 20,
            }}
          >
            <span style={{ width: 60, height: 1, background: LIME, opacity: 0.9 }} />
            <AppBrandIcon />
            <span style={{ width: 60, height: 1, background: LIME, opacity: 0.9 }} />
          </div>
          <p style={{ margin: 0, color: WHITE, fontSize: 18, fontWeight: 400 }}>Welcome to</p>
          <h1
            style={{
              margin: '8px 0 6px',
              color: LIME,
              fontSize: 56,
              fontWeight: 900,
              letterSpacing: '-1px',
              lineHeight: 1,
            }}
          >
            ROOMIEZ
          </h1>
          <p
            style={{
              margin: 0,
              color: LIME,
              fontSize: 11,
              letterSpacing: 3,
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            Powered by Lease Together
          </p>
        </header>

        {/* 2 — Tagline */}
        <div style={{ ...sectionGap, textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, lineHeight: 1.3, color: WHITE }}>
            The <span style={{ color: LIME }}>easiest &amp; most secure</span> way
          </p>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, lineHeight: 1.3, color: WHITE }}>to connect within your</p>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, lineHeight: 1.3, color: LIME }}>college community.</p>
        </div>

        {/* 3 — Subtitle */}
        <p
          style={{
            ...sectionGap,
            marginBottom: 0,
            textAlign: 'center',
            fontSize: 14,
            color: GRAY,
            maxWidth: 320,
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.5,
          }}
        >
          Whether you&apos;re here to find a roommate, swap rooms, sublease, or group lease —{' '}
          <span style={{ color: LIME, fontWeight: 700 }}>ROOMIEZ</span>{' '}
          <span style={{ color: WHITE }}>makes it happen.</span>
        </p>

        {/* 4 — Feature icons row */}
        <div
          style={{
            ...sectionGap,
            display: 'flex',
            alignItems: 'stretch',
            justifyContent: 'space-between',
            gap: 0,
          }}
        >
          {[
            { Icon: FiSearch, label: 'Find Roommates', desc: 'Connect with students like you.', custom: null },
            { Icon: null, label: 'Swap Rooms', desc: 'Find or offer rooms easily.', custom: 'swap' },
            { Icon: FiFileText, label: 'Take Over Leases', desc: 'Find lease takeovers fast.', custom: null },
            { Icon: FiUsers, label: 'Group Leasing', desc: 'Meet your people. Build your community.', custom: null },
          ].map(({ Icon, label, desc, custom }, i) => (
            <div
              key={label}
              style={{
                flex: '1 1 0',
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: '0 4px',
                borderLeft: i === 0 ? 'none' : '1px solid #333333',
              }}
            >
              {custom === 'swap' ? <IconSwapArrows /> : <Icon style={iconWrap} strokeWidth={1.5} />}
              <strong style={{ display: 'block', marginTop: 8, fontSize: 13, color: WHITE }}>{label}</strong>
              <span style={{ fontSize: 11, color: GRAY_MUTED, marginTop: 4, lineHeight: 1.25 }}>{desc}</span>
            </div>
          ))}
        </div>

        {/* 5 — Two access cards */}
        <div
          style={{
            ...sectionGap,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            alignItems: 'stretch',
          }}
        >
          <div
            style={{
              border: '1px solid #444444',
              background: '#111111',
              borderRadius: 16,
              padding: '14px 12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <strong style={{ color: LIME, fontSize: 14, fontWeight: 700 }}>For Private Communities</strong>
            <p style={{ margin: '10px 0 14px', fontSize: 12, color: GRAY, lineHeight: 1.4 }}>
              Enter your access code from your school, apartment, or community.
            </p>
            <div
              style={{
                marginTop: 'auto',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                padding: '12px',
                background: '#1A1A1A',
                border: '1px solid #333333',
                borderRadius: 12,
              }}
            >
              <FiLock style={{ ...iconWrap, fontSize: 36 }} strokeWidth={1.5} aria-hidden />
            </div>
          </div>

          <div
            style={{
              border: `1px solid ${LIME}`,
              background: '#0D1200',
              borderRadius: 16,
              padding: '14px 12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <strong style={{ color: LIME, fontSize: 14, fontWeight: 700 }}>For Public Access</strong>
            <p style={{ margin: '10px 0 12px', fontSize: 12, color: GRAY, lineHeight: 1.4 }}>
              Get your access code by subscribing through our monthly subscription.
            </p>
            <a
              href={SUBSCRIBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: '100%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: LIME,
                color: '#000000',
                fontWeight: 700,
                fontSize: 13,
                textDecoration: 'none',
                borderRadius: 999,
                padding: '12px 10px',
                boxSizing: 'border-box',
              }}
            >
              <FiLink size={16} strokeWidth={2} aria-hidden />
              START YOUR SUBSCRIPTION
            </a>
            <p style={{ margin: '10px 0 0', fontSize: 11, color: GRAY_MUTED }}>Tap above to start your subscription.</p>
          </div>
        </div>

        {/* 6 — Access code section */}
        <form onSubmit={handleSubmit} style={sectionGap}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              marginBottom: 14,
            }}
          >
            <span style={{ flex: 1, height: 1, background: LIME, opacity: 0.35, maxWidth: 40 }} />
            <span
              style={{
                color: LIME,
                fontSize: 12,
                letterSpacing: 2,
                textTransform: 'uppercase',
                fontWeight: 700,
                whiteSpace: 'nowrap',
              }}
            >
              Enter your access code
            </span>
            <span style={{ flex: 1, height: 1, background: LIME, opacity: 0.35, maxWidth: 40 }} />
          </div>

          <input
            type="text"
            placeholder="E.G. SUNRISE24"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            autoFocus
            style={{
              width: '100%',
              boxSizing: 'border-box',
              height: 54,
              background: 'transparent',
              border: '1px solid #555555',
              borderRadius: 12,
              color: WHITE,
              fontSize: 16,
              textAlign: 'center',
              letterSpacing: 2,
              textTransform: 'uppercase',
              outline: 'none',
            }}
          />
          <p style={{ margin: '10px 0 16px', fontSize: 12, color: GRAY, textAlign: 'center' }}>
            Get your access code instantly after subscribing.
          </p>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: 58,
              background: LIME,
              color: '#000000',
              fontWeight: 800,
              fontSize: 17,
              borderRadius: 14,
              border: 'none',
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.85 : 1,
            }}
          >
            {loading ? 'Checking...' : 'UNLOCK MY COMMUNITY →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: GRAY }}>
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: LIME,
              fontWeight: 700,
              fontSize: 'inherit',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Sign In
          </button>
        </p>

        {/* 7 — Trust badges */}
        <div
          style={{
            ...sectionGap,
            marginTop: 32,
            display: 'flex',
            alignItems: 'stretch',
            background: '#111111',
            border: '1px solid #222222',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '14px 10px',
            }}
          >
            <FiShield style={{ color: LIME, fontSize: 18, flexShrink: 0 }} strokeWidth={1.5} aria-hidden />
            <span style={{ color: WHITE, fontWeight: 700, fontSize: 11, lineHeight: 1.2, textAlign: 'center' }}>
              REAL STUDENTS. REAL CONNECTIONS.
            </span>
          </div>
          <div style={{ width: 1, background: '#222222', flexShrink: 0 }} aria-hidden />
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '14px 10px',
            }}
          >
            <FiLock style={{ color: LIME, fontSize: 18, flexShrink: 0 }} strokeWidth={1.5} aria-hidden />
            <span style={{ color: WHITE, fontWeight: 700, fontSize: 11, lineHeight: 1.2, textAlign: 'center' }}>
              BUILT FOR STUDENTS. BY STUDENTS.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
