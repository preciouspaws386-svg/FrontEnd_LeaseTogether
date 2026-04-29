const INTENT_META = {
  RM: { emoji: '🤝', label: 'Looking for a Roommate', className: 'intent-green' },
  RS: { emoji: '🔄', label: 'Looking to Swap Rooms', className: 'intent-blue' },
  LT: { emoji: '🏠', label: 'Sublease / Lease Takeover', className: 'intent-orange' },
  GM: { emoji: '👥', label: 'Group Match (3–4 Roommates)', className: 'intent-green' },
  SM: { emoji: '🎉', label: 'Social / Meet Up', className: 'intent-blue' },
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

