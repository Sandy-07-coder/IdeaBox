import React from 'react';

export default function MessagesDropdown({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div style={{ position: 'absolute', top: '100%', right: '-4rem', marginTop: '0.5rem', width: '340px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)', zIndex: 50, overflow: 'hidden' }}>
      <div style={{ padding: '1.25rem 1.25rem 1rem 1.25rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
        <h3 style={{ margin: 0, color: '#111827', fontSize: '1.05rem', fontWeight: 'bold' }}>Messages</h3>
        <button style={{ background: 'none', border: 'none', color: '#4F46E5', fontSize: '0.875rem', cursor: 'pointer', fontWeight: '600' }}>New Message</button>
      </div>
      <div style={{ padding: '0.5rem', maxHeight: '320px', overflowY: 'auto' }}>
        <div style={{ padding: '0.75rem', borderRadius: '8px', display: 'flex', gap: '1rem', cursor: 'pointer', alignItems: 'center', transition: 'background-color 0.15s ease' }} onMouseOver={e => e.currentTarget.style.background='#f3f4f6'} onMouseOut={e => e.currentTarget.style.background='transparent'}>
          <div style={{ width: '40px', height: '40px', background: '#e0e7ff', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#4F46E5', fontWeight: 'bold', fontSize: '1.1rem', flexShrink: 0 }}>
            J
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <p style={{ margin: 0, color: '#111827', fontSize: '0.95rem', fontWeight: '600' }}>Jane Doe</p>
              <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>1d</span>
            </div>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Looking forward to our chat about the MVP!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
