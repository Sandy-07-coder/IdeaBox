import React, { useState, useRef, useEffect } from 'react';
import ProfileDropdown from './ProfileDropdown';
import NotificationsDropdown from './NotificationsDropdown';
import MessagesDropdown from './MessagesDropdown';
import { useUserStore } from '../../store';

export default function TopHeader({ toggleSidebar }) {
  const { currentUserProfile } = useUserStore();
  const [activeDropdown, setActiveDropdown] = useState(null); // 'profile', 'notifications', 'messages', null
  const headerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (dropdownName) => {
    setActiveDropdown(prev => prev === dropdownName ? null : dropdownName);
  };

  return (
    <header ref={headerRef} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 2rem', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 40, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
      
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button 
          onClick={toggleSidebar} 
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#4b5563', display: 'flex', alignItems: 'center', padding: '0.5rem', borderRadius: '8px', marginLeft: '-0.5rem' }} 
          onMouseOver={e => e.currentTarget.style.background = '#f3f4f6'} 
          onMouseOut={e => e.currentTarget.style.background = 'transparent'}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>menu</span>
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => toggleDropdown('notifications')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: activeDropdown === 'notifications' ? '#4F46E5' : '#6b7280', display: 'flex', alignItems: 'center', position: 'relative', transition: 'color 0.2s' }}
            onMouseOver={e => e.currentTarget.style.color = '#4F46E5'}
            onMouseOut={e => e.currentTarget.style.color = activeDropdown === 'notifications' ? '#4F46E5' : '#6b7280'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>notifications</span>
            <span style={{ position: 'absolute', top: '2px', right: '2px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', border: '2px solid #fff' }}></span>
          </button>
          <NotificationsDropdown isOpen={activeDropdown === 'notifications'} onClose={() => setActiveDropdown(null)} />
        </div>

        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => toggleDropdown('messages')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: activeDropdown === 'messages' ? '#4F46E5' : '#6b7280', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
            onMouseOver={e => e.currentTarget.style.color = '#4F46E5'}
            onMouseOut={e => e.currentTarget.style.color = activeDropdown === 'messages' ? '#4F46E5' : '#6b7280'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>chat</span>
          </button>
          <MessagesDropdown isOpen={activeDropdown === 'messages'} onClose={() => setActiveDropdown(null)} />
        </div>

        <div style={{ position: 'relative' }}>
          <div 
            onClick={() => toggleDropdown('profile')}
            style={{ height: '36px', width: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #4F46E5 0%, #7c3aed 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', boxShadow: activeDropdown === 'profile' ? '0 0 0 3px rgba(79, 70, 229, 0.25)' : '0 2px 4px rgba(79, 70, 229, 0.3)', transition: 'all 0.2s', border: '2px solid #fff' }}
          >
            {currentUserProfile?.avatar_url ? <img src={currentUserProfile.avatar_url} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} /> : (currentUserProfile?.full_name ? currentUserProfile.full_name.charAt(0).toUpperCase() : "U")}
          </div>
          <ProfileDropdown isOpen={activeDropdown === 'profile'} onClose={() => setActiveDropdown(null)} />
        </div>
      </div>
      
    </header>
  );
}
