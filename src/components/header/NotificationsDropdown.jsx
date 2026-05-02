import React from 'react';

export default function NotificationsDropdown({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div style={{ position: 'absolute', top: '100%', right: '-4rem', marginTop: '0.5rem', width: '320px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', zIndex: 50 }}>
      <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, color: '#111827', fontSize: '1rem', fontWeight: 'bold' }}>Notifications</h3>
        <button style={{ background: 'none', border: 'none', color: '#4F46E5', fontSize: '0.875rem', cursor: 'pointer' }}>Mark all as read</button>
      </div>
      <div style={{ padding: '0.5rem 0', maxHeight: '300px', overflowY: 'auto' }}>
        <div style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.75rem', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', alignItems: 'center', background: '#fefefe' }} onMouseOver={e => e.currentTarget.style.background='#f9fafb'} onMouseOut={e => e.currentTarget.style.background='#fefefe'}>
          <div style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }}></div>
          <div>
            <p style={{ margin: '0 0 0.25rem 0', color: '#374151', fontSize: '0.9rem' }}>New team request for <strong>"AI Platform"</strong></p>
            <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.75rem' }}>2 hours ago</p>
          </div>
        </div>
        <div style={{ padding: '1rem', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
          No other notifications
        </div>
      </div>
    </div>
  );
}
