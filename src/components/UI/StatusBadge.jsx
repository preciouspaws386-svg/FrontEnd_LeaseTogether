export default function StatusBadge({ isOpen }) {
  return (
    <span className={`status-badge ${isOpen ? 'badge-open' : 'badge-closed'}`}>
      <span className="badge-dot" />
      {isOpen ? 'Open to Roommate' : 'Not Looking'}
    </span>
  );
}

