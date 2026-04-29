import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="landing">
      <div className="landing-hero animate">
        <div className="landing-badge">🏠 Apartment Community Roommate Finder</div>
        <div className="landing-headline">
          Find Your Perfect <span style={{ color: 'var(--accent)' }}>Roommate</span>, Not a Stranger
        </div>
        <div style={{ marginTop: 10, color: 'var(--grey-2)', fontSize: 13.5, textAlign: 'center', fontWeight: 600 }}>
          For Residents &amp; Students
        </div>
        <p className="landing-sub">
          Browse resident profiles in your apartment community, request an Apartment Meet-Up, and receive a confirmation
          code — all in seconds.
        </p>
        <div className="landing-cta">
          <button className="btn btn-primary" onClick={() => navigate('/signup')}>
            Get Started
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/login')}>
            Sign In
          </button>
        </div>

        {/* Subscription CTA (Residents & Students) */}
        <div className="landing-cta" style={{ marginTop: 18, justifyContent: 'center' }}>
          <a
            href="https://square.link/u/VMsuUwq0?src=sheet"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '10px 18px' }}
          >
            <span style={{ fontSize: 16 }}>🔑</span>
            Get Access — $9.95/month
          </a>
        </div>

        <div style={{ display: 'flex', gap: 22, justifyContent: 'center', flexWrap: 'wrap', marginTop: 36 }}>
          {[
            { icon: '🟢', title: 'Set your status', desc: 'Green means open, Red means not looking' },
            { icon: '🗓️', title: 'Book a Meet-Up', desc: 'Schedule at your leasing office in seconds' },
            { icon: '🔑', title: 'Get a Code', desc: 'Unique confirmation code for both parties' },
          ].map((f) => (
            <div key={f.title} style={{ maxWidth: 180 }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontSize: 12.5, color: 'var(--grey-2)', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

