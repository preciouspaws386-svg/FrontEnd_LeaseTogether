export default function Button({
  variant = 'primary',
  size = 'md',
  onClick,
  children,
  fullWidth,
  loading,
  disabled,
  type = 'button',
}) {
  const cls = [
    'btn',
    `btn-${variant}`,
    size !== 'md' ? `btn-${size}` : '',
    fullWidth ? 'btn-full' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled || loading}>
      {loading ? 'Loading...' : children}
    </button>
  );
}

