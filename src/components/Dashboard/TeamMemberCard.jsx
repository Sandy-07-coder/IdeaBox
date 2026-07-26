import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * TeamMemberCard — compact row component for a single team member.
 *
 * Props:
 *   member         – { id, member_id, role, joined_at, left_at,
 *                      source, profiles: { full_name, avatar_url, persona } }
 *   currentUser    – logged-in user object (used to gate "Message" button)
 *   onRemove       – (memberId) => void   (only passed when owner viewing)
 *   onRoleChange   – (memberId, newRole) => void   (owner only)
 */
export default function TeamMemberCard({ member, currentUser, onRemove, onRoleChange }) {
  const navigate = useNavigate();
  const profile = member.profiles || member.applicant || {};
  const name = profile.full_name || `User …${member.member_id?.slice(-6)}`;
  const initials = name.charAt(0).toUpperCase();
  const isActive = !member.left_at;

  const handleMessage = async (e) => {
    e.stopPropagation();
    if (!currentUser || currentUser.id === member.member_id) return;
    try {
      const { startConversation } = await import('../../store/chatStore')
        .then(m => m.useChatStore.getState());
      const convId = await startConversation(currentUser.id, member.member_id);
      if (convId) navigate(`/dashboard/messages/${convId}`);
    } catch (err) {
      console.error('Could not start conversation:', err);
    }
  };

  return (
    <div className={`tm-card ${isActive ? '' : 'tm-card--inactive'}`}>
      {/* Avatar */}
      <div className="tm-avatar">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt={name} />
        ) : (
          initials
        )}
        {member.source === 'hiring' && (
          <span className="tm-source-dot" title="Joined via Hiring" />
        )}
      </div>

      {/* Info */}
      <div className="tm-info">
        <span className="tm-name">{name}</span>
        {onRoleChange ? (
          /* Owner: editable role */
          <input
            className="tm-role-input"
            value={member.role}
            onClick={e => e.stopPropagation()}
            onChange={e => onRoleChange(member.id, e.target.value)}
            title="Click to edit role"
          />
        ) : (
          <span className="tm-role">{member.role}</span>
        )}
        {!isActive && <span className="tm-inactive-label">Left</span>}
      </div>

      {/* Actions */}
      <div className="tm-actions">
        <button
          className="tm-action-btn"
          title="View Profile"
          onClick={e => { e.stopPropagation(); navigate(`/profile/${member.member_id}`); }}
        >
          <span className="material-symbols-outlined">person</span>
        </button>
        {currentUser && currentUser.id !== member.member_id && (
          <button className="tm-action-btn" title="Message" onClick={handleMessage}>
            <span className="material-symbols-outlined">chat</span>
          </button>
        )}
        {onRemove && isActive && (
          <button
            className="tm-action-btn tm-action-btn--danger"
            title="Remove member"
            onClick={e => { e.stopPropagation(); onRemove(member.id); }}
          >
            <span className="material-symbols-outlined">person_remove</span>
          </button>
        )}
      </div>
    </div>
  );
}
