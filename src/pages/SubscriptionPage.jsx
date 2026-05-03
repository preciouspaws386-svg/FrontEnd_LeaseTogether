import { Link } from 'react-router-dom';

const SUBSCRIBE_URL = 'https://square.link/u/VMsuUwq0?src=sheet';

export default function SubscriptionPage() {
  return (
    <div className="auth-page">
      <div className="auth-card animate">
        <div className="auth-logo">
          <div style={{ fontSize: 36 }}>🏠</div>
        </div>
        <h1 className="auth-title">Subscription required</h1>
        <p className="auth-subtitle" style={{ marginBottom: 16 }}>
          An active subscription is required to use LeaseTogether. Subscribe below to request access.
        </p>
        <a
          href={SUBSCRIBE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary btn-full"
          style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: 14 }}
        >
          Subscribe to continue
        </a>
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--grey-2)', marginBottom: 12 }}>
          After subscribing, your account access will be activated by our team, or use an active subscriber account.
        </p>
        <p style={{ textAlign: 'center', fontSize: 13 }}>
          <Link to="/login" style={{ color: 'var(--accent)' }}>
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
