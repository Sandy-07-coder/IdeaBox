import React from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store';

export default function ProfileDropdown({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { currentUserProfile, clearUser } = useUserStore();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearUser();
    navigate('/login');
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', width: '240px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', zIndex: 50 }}>
      <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid #e5e7eb' }}>
        <p style={{ margin: '0 0 0.25rem 0', fontWeight: 'bold', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUserProfile?.full_name || 'User'}</p>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUserProfile?.email || ''}</p>
      </div>
      <div style={{ padding: '0.5rem' }}>
        <button 
          onClick={() => { navigate('/profile'); onClose(); }} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', textAlign: 'left', padding: '0.625rem 1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#374151', borderRadius: '6px', fontSize: '0.9rem', fontWeight: '500' }}
          onMouseOver={(e) => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#111827'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#374151'; }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>account_circle</span>
          View Profile
        </button>
        <button 
          onClick={handleLogout} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', textAlign: 'left', padding: '0.625rem 1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', borderRadius: '6px', fontSize: '0.9rem', fontWeight: '500', marginTop: '0.25rem' }}
          onMouseOver={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#ef4444'; }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>logout</span>
          Log Out
        </button>
      </div>
    </div>
  );
}
