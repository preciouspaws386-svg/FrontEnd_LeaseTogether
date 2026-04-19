export default function ConfirmationCode({ code }) {
  return (
    <div className="code-hero">
      <div className="code-eyebrow">Confirmation Code</div>
      <div className="code-value">{code}</div>
      <div className="code-hint">Show this code at the leasing office upon arrival</div>
    </div>
  );
}

