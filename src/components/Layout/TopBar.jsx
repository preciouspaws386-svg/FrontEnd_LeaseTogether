export default function TopBar({ title, children }) {
  return (
    <div className="topbar">
      <div className="topbar-title">{title}</div>
      <div className="topbar-right">{children}</div>
    </div>
  );
}

