import { FiMenu } from 'react-icons/fi';

export default function TopBar({ title, children, onMenuClick }) {
  return (
    <div className="topbar">
      <div className="topbar-left">
        {onMenuClick ? (
          <button
            type="button"
            className="topbar-menu-btn"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
          >
            <FiMenu size={22} />
          </button>
        ) : null}
        <div className="topbar-title">{title}</div>
      </div>
      <div className="topbar-right">{children}</div>
    </div>
  );
}
