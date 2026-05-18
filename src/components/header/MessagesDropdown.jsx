import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../../store/chatStore';
import { useUserStore } from '../../store';

export default function MessagesDropdown({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { currentUser } = useUserStore();
  const { conversations, loadingConversations, fetchConversations, unreadCount, fetchUnreadCount } = useChatStore();

  useEffect(() => {
    if (isOpen && currentUser?.id) {
      fetchConversations(currentUser.id);
      fetchUnreadCount(currentUser.id);
    }
  }, [isOpen, currentUser?.id]);

  if (!isOpen) return null;

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    const now = new Date();
    const d = new Date(dateStr);
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'now';
    if (diffMin < 60) return `${diffMin}m`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs}h`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays}d`;
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const handleConversationClick = (conv) => {
    onClose();
    navigate(`/dashboard/messages/${conv.id}`);
  };

  const handleViewAll = () => {
    onClose();
    navigate('/dashboard/messages');
  };

  // Show latest 5 conversations
  const recentConvos = conversations.slice(0, 5);

  return (
    <div style={{ position: 'absolute', top: '100%', right: '-4rem', marginTop: '0.5rem', width: '360px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)', zIndex: 50, overflow: 'hidden' }}>
      <div style={{ padding: '1.25rem 1.25rem 1rem 1.25rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h3 style={{ margin: 0, color: '#111827', fontSize: '1.05rem', fontWeight: 'bold' }}>Messages</h3>
          {unreadCount > 0 && (
            <span style={{ minWidth: '18px', height: '18px', background: '#4F46E5', color: '#fff', borderRadius: '999px', fontSize: '0.65rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
        {loadingConversations ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem' }}>Loading...</div>
        ) : recentConvos.length === 0 ? (
          <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', color: '#9ca3af' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: '#d1d5db', display: 'block', marginBottom: '0.5rem' }}>chat_bubble_outline</span>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>No messages yet</p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#d1d5db' }}>Start a conversation from a profile or project</p>
          </div>
        ) : (
          recentConvos.map(conv => {
            const unread = conv.lastMessage && !conv.lastMessage.is_read && conv.lastMessage.sender_id !== currentUser?.id;
            return (
              <div
                key={conv.id}
                onClick={() => handleConversationClick(conv)}
                style={{
                  padding: '0.75rem 1.25rem',
                  display: 'flex',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  alignItems: 'center',
                  transition: 'background-color 0.15s ease',
                  background: unread ? '#f0f4ff' : 'transparent',
                  borderBottom: '1px solid #f9fafb',
                }}
                onMouseOver={e => e.currentTarget.style.background = unread ? '#e8eeff' : '#f3f4f6'}
                onMouseOut={e => e.currentTarget.style.background = unread ? '#f0f4ff' : 'transparent'}
              >
                <div style={{
                  width: '42px', height: '42px', background: 'linear-gradient(135deg, #4F46E5, #7c3aed)',
                  borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center',
                  color: '#fff', fontWeight: 'bold', fontSize: '1.1rem', flexShrink: 0, overflow: 'hidden'
                }}>
                  {conv.otherProfile?.avatar_url
                    ? <img src={conv.otherProfile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : (conv.otherProfile?.full_name || 'U').charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <p style={{ margin: 0, color: '#111827', fontSize: '0.9rem', fontWeight: unread ? '700' : '600' }}>
                      {conv.otherProfile?.full_name || 'Unknown'}
                    </p>
                    <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: '500', flexShrink: 0, marginLeft: '0.5rem' }}>
                      {conv.lastMessage ? formatRelativeTime(conv.lastMessage.created_at) : ''}
                    </span>
                  </div>
                  <p style={{
                    margin: 0, fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    color: unread ? '#111827' : '#6b7280', fontWeight: unread ? '500' : '400'
                  }}>
                    {conv.lastMessage
                      ? (conv.lastMessage.sender_id === currentUser?.id ? 'You: ' : '') + conv.lastMessage.content
                      : 'No messages yet'}
                  </p>
                </div>
                {unread && (
                  <div style={{ width: '8px', height: '8px', background: '#4F46E5', borderRadius: '50%', flexShrink: 0 }} />
                )}
              </div>
            );
          })
        )}
      </div>

      {recentConvos.length > 0 && (
        <div
          onClick={handleViewAll}
          style={{
            padding: '0.75rem', textAlign: 'center', borderTop: '1px solid #e5e7eb',
            color: '#4F46E5', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', transition: 'background 0.15s'
          }}
          onMouseOver={e => e.currentTarget.style.background = '#f9fafb'}
          onMouseOut={e => e.currentTarget.style.background = 'transparent'}
        >
          View all messages
        </div>
      )}
    </div>
  );
}
