const INTENT_META = {
  'Looking for a Roommate': { emoji: '🤝', label: 'Looking for a Roommate', className: 'intent-green' },
  'Looking to Swap Rooms': { emoji: '🔄', label: 'Looking to Swap Rooms', className: 'intent-blue' },
  'Lease Available': { emoji: '🏠', label: 'Lease Available', className: 'intent-orange' },
};

export default function IntentBadge({ intent }) {
  const meta = INTENT_META[intent];
  if (!meta) return null;
  return (
    <span className={`intent-badge ${meta.className}`}>
      <span className="intent-emoji">{meta.emoji}</span>
      {meta.label}
    </span>
  );
}

