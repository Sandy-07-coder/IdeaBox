import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store';
import { useNotificationStore } from '../../store/notificationStore';

export default function NotificationsDropdown({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { currentUser } = useUserStore();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();

  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'application': return { icon: 'handshake', color: '#10b981', bg: '#d1fae5' };
      case 'idea': return { icon: 'lightbulb', color: '#f59e0b', bg: '#fef3c7' };
      case 'event': return { icon: 'event', color: '#8b5cf6', bg: '#ede9fe' };
      case 'admin': return { icon: 'campaign', color: '#3b82f6', bg: '#dbeafe' };
      default: return { icon: 'notifications', color: '#6b7280', bg: '#f3f4f6' };
    }
  };

  const handleNotificationClick = (notif) => {
    if (!notif.is_read) {
      markAsRead(notif.id);
    }
    onClose();
    if (notif.link) {
      navigate(notif.link);
    }
  };

  return (
    <div style={{ position: 'absolute', top: '100%', right: '-4rem', marginTop: '0.5rem', width: '340px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', zIndex: 50, overflow: 'hidden' }}>
      <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
        <h3 style={{ margin: 0, color: '#111827', fontSize: '1rem', fontWeight: 'bold' }}>Notifications</h3>
        {unreadCount > 0 && (
          <button 
            onClick={() => markAllAsRead(currentUser?.id)}
            style={{ background: 'none', border: 'none', color: '#4F46E5', fontSize: '0.8rem', fontWeight: '500', cursor: 'pointer', padding: 0 }}
          >
            Mark all as read
          </button>
        )}
      </div>
      
      <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280', fontSize: '0.9rem' }}>
            No notifications yet.
          </div>
        ) : (
          notifications.map((notif, idx) => {
            const { icon, color, bg } = getIcon(notif.type);
            return (
              <div 
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                style={{ 
                  padding: '1rem', borderBottom: idx < notifications.length - 1 ? '1px solid #f3f4f6' : 'none',
                  background: notif.is_read ? '#fff' : '#f0fdf4',
                  cursor: notif.link ? 'pointer' : 'default',
                  display: 'flex', gap: '0.75rem', transition: 'background 0.2s',
                  alignItems: 'flex-start'
                }}
                onMouseOver={e => { if (notif.link && notif.is_read) e.currentTarget.style.background = '#f9fafb' }}
                onMouseOut={e => { if (notif.link && notif.is_read) e.currentTarget.style.background = '#fff' }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>{icon}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.85rem', fontWeight: notif.is_read ? '500' : '600', color: '#111827' }}>
                    {notif.title}
                  </p>
                  <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.8rem', color: '#4b5563', lineHeight: '1.4' }}>
                    {notif.message}
                  </p>
                  <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                    {new Date(notif.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {!notif.is_read && (
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', flexShrink: 0, marginTop: '0.3rem' }}></div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
