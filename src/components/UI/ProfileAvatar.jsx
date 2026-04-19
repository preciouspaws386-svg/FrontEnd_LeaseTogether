const COLORS = ['#2FBF82', '#5B8DEF', '#E67E5A', '#A468D5', '#E8B84B', '#4BC9C9'];

function hashColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}

export default function ProfileAvatar({ name, size = 44 }) {
  const safe = name || '?';
  const initials = safe
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const c = hashColor(safe);
  return (
    <div
      className="profile-av"
      style={{ width: size, height: size, background: `${c}22`, color: c, border: `1px solid ${c}44` }}
    >
      {initials || '?'}
    </div>
  );
}

