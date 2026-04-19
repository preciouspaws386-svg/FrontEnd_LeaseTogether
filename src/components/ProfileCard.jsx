import ProfileAvatar from './UI/ProfileAvatar';
import StatusBadge from './UI/StatusBadge';
import TagPill from './UI/TagPill';
import IntentBadge from './UI/IntentBadge';

export default function ProfileCard({ user, onRequestMeetUp, onClick }) {
  const displayName = `${user.firstName} ${user.lastInitial}.`;
  const tags = [user.socialVibe, user.lifestylePace, user.hobbies ? user.hobbies.split(',')[0].trim() : null]
    .filter(Boolean)
    .slice(0, 3);
  const firstPhoto = Array.isArray(user.photos) && user.photos.length > 0 ? user.photos[0] : null;

  return (
    <div className="card profile-card" onClick={onClick} style={{ opacity: user.isOpenToRoommate ? 1 : 0.6 }}>
      {firstPhoto ? (
        <div style={{ margin: '-20px -20px 14px', height: 120, borderRadius: 14, overflow: 'hidden', border: '1px solid var(--line)' }}>
          <img src={firstPhoto} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      ) : null}
      {user.intent && (
        <div style={{ marginBottom: 10 }}>
          <IntentBadge intent={user.intent} />
        </div>
      )}
      <div className="profile-meta-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {firstPhoto ? (
            <img
              src={firstPhoto}
              alt={displayName}
              style={{ width: 44, height: 44, borderRadius: 11, objectFit: 'cover', border: '1px solid var(--line)' }}
            />
          ) : (
            <ProfileAvatar name={user.firstName} />
          )}
          <div>
            <div className="profile-name">{displayName}</div>
            <div className="profile-apt">
              {user.apartmentName || user.apartment?.name || 'Community'} · Age {user.age || '—'}
            </div>
            {user.major && <div style={{ fontSize: 11, color: 'var(--grey-2)' }}>{user.major}</div>}
          </div>
        </div>
        <StatusBadge isOpen={user.isOpenToRoommate} />
      </div>

      <div className="profile-divider" />
      {user.bio && (
        <div style={{ fontSize: 12.5, color: 'var(--grey-1)', marginBottom: 10, fontStyle: 'italic' }}>
          "{user.bio}"
        </div>
      )}
      <div className="tag-row" style={{ marginBottom: 12 }}>
        {tags.map((t) => <TagPill key={t} label={t} />)}
      </div>

      {user.isOpenToRoommate ? (
        <button
          className="btn btn-primary btn-sm btn-full"
          onClick={(e) => {
            e.stopPropagation();
            onRequestMeetUp?.(user);
          }}
        >
          Request Meet-Up
        </button>
      ) : (
        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--grey-2)' }}>Not Currently Looking</div>
      )}
    </div>
  );
}

