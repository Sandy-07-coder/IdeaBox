import React, { useState, useRef, useEffect } from 'react';
import ProfileDropdown from './ProfileDropdown';
import NotificationsDropdown from './NotificationsDropdown';
import MessagesDropdown from './MessagesDropdown';
import { useUserStore } from '../../store';
import { useChatStore } from '../../store/chatStore';
import { useNotificationStore } from '../../store/notificationStore';
import { supabase } from '../../supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom';

export default function TopHeader({ toggleSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, currentUserProfile } = useUserStore();
  const { unreadCount, fetchUnreadCount, subscribeToGlobalMessages, updatePresence } = useChatStore();
  const { 
    unreadCount: notifUnreadCount, 
    fetchNotifications, 
    subscribeToNotifications 
  } = useNotificationStore();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const headerRef = useRef(null);

  // Subscribe to global messages + notifications.
  // A fresh channel pair is created on every run; both are torn down in the
  // cleanup so React Strict Mode's double-invoke never sees a channel that is
  // already subscribed when it tries to add postgres_changes listeners.
  useEffect(() => {
    if (!currentUser?.id) return;

    fetchUnreadCount(currentUser.id);
    fetchNotifications(currentUser.id);
    updatePresence(currentUser.id, true);

    const globalMsgChannel = subscribeToGlobalMessages(currentUser.id);
    const notifChannel     = subscribeToNotifications(currentUser.id);

    // Set offline on page unload
    const handleUnload = () => updatePresence(currentUser.id, false);
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      // supabase.removeChannel() is the correct Supabase JS v2 teardown API
      if (globalMsgChannel) supabase.removeChannel(globalMsgChannel);
      if (notifChannel)     supabase.removeChannel(notifChannel);
    };
  }, [currentUser?.id, fetchUnreadCount, fetchNotifications, subscribeToNotifications, subscribeToGlobalMessages, updatePresence]);

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
    <header ref={headerRef} className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl flex justify-between items-center px-6 lg:px-8 h-16 lg:h-20 border-b border-outline-variant/10">
      
      <div className="flex items-center space-x-4">
        <button 
          onClick={toggleSidebar} 
          className="text-primary hover:bg-primary/5 p-2 rounded-lg transition-colors flex items-center -ml-2"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>menu</span>
        </button>
        {location.pathname.includes('/marketplace') && (
          <div className="hidden sm:flex items-center space-x-3">
            <span className="material-symbols-outlined text-primary text-xl">speed</span>
            <h2 className="font-body tracking-tight text-on-surface font-bold text-lg lg:text-xl">
              Welcome back, {currentUserProfile?.full_name ? currentUserProfile.full_name.split(' ')[0] : 'Founder'}
            </h2>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        <button 
          onClick={() => navigate('/post-idea')}
          className="hidden md:block bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-4 lg:px-6 rounded-xl transition-all text-xs lg:text-sm shadow-lg shadow-primary/20 whitespace-nowrap uppercase tracking-wider"
        >
          POST YOUR IDEA
        </button>
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => toggleDropdown('notifications')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: activeDropdown === 'notifications' ? '#4F46E5' : '#6b7280', display: 'flex', alignItems: 'center', position: 'relative', transition: 'color 0.2s' }}
            onMouseOver={e => e.currentTarget.style.color = '#4F46E5'}
            onMouseOut={e => e.currentTarget.style.color = activeDropdown === 'notifications' ? '#4F46E5' : '#6b7280'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>notifications</span>
            {notifUnreadCount > 0 && (
              <span style={{ position: 'absolute', top: '-2px', right: '-4px', minWidth: '16px', height: '16px', background: '#ef4444', color: '#fff', borderRadius: '999px', fontSize: '0.6rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', border: '2px solid #fff' }}>
                {notifUnreadCount > 9 ? '9+' : notifUnreadCount}
              </span>
            )}
          </button>
          <NotificationsDropdown isOpen={activeDropdown === 'notifications'} onClose={() => setActiveDropdown(null)} />
        </div>

        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => toggleDropdown('messages')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: activeDropdown === 'messages' ? '#4F46E5' : '#6b7280', display: 'flex', alignItems: 'center', transition: 'color 0.2s', position: 'relative' }}
            onMouseOver={e => e.currentTarget.style.color = '#4F46E5'}
            onMouseOut={e => e.currentTarget.style.color = activeDropdown === 'messages' ? '#4F46E5' : '#6b7280'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>chat</span>
            {unreadCount > 0 && (
              <span style={{ position: 'absolute', top: '-2px', right: '-4px', minWidth: '16px', height: '16px', background: '#ef4444', color: '#fff', borderRadius: '999px', fontSize: '0.6rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', border: '2px solid #fff' }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
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
