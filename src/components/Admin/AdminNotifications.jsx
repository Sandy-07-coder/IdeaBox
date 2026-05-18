import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useNotificationStore } from '../../store/notificationStore';

export default function AdminNotifications() {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  
  const [targetUser, setTargetUser] = useState('ALL');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from('profiles').select('id, full_name, email').order('full_name');
      if (!error && data) {
        setUsers(data);
      }
      setLoadingUsers(false);
    };
    fetchUsers();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);

    const store = useNotificationStore.getState();

    try {
      if (targetUser === 'ALL') {
        const userIds = users.map(u => u.id);
        await store.sendBroadcast({
          userIds,
          title,
          message,
          type: 'admin',
          link: link || null
        });
        alert(`Broadcast sent to ${userIds.length} users!`);
      } else {
        await store.sendNotification({
          userId: targetUser,
          title,
          message,
          type: 'admin',
          link: link || null
        });
        alert('Notification sent successfully!');
      }
      
      setTitle('');
      setMessage('');
      setLink('');
      setTargetUser('ALL');
    } catch (err) {
      alert('Error sending notification: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <section>
      <div className="fd-section-header">
        <h2 className="fd-section-title">Send Notifications</h2>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '2rem', maxWidth: '600px', margin: '0 auto', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e0e7ff', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>campaign</span>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold', color: '#111827' }}>Admin Announcements</h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#6b7280' }}>Send alerts or announcements directly to user accounts.</p>
          </div>
        </div>

        <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '0.4rem' }}>Target Audience</label>
            <select 
              value={targetUser} 
              onChange={e => setTargetUser(e.target.value)}
              disabled={loadingUsers}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', background: '#f9fafb' }}
            >
              <option value="ALL">All Users (Broadcast)</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '0.4rem' }}>Notification Title *</label>
            <input 
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Platform Maintenance / Special Announcement"
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '0.4rem' }}>Message Body *</label>
            <textarea 
              required
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Type your message here..."
              rows={4}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '0.4rem' }}>Action Link (Optional)</label>
            <input 
              value={link}
              onChange={e => setLink(e.target.value)}
              placeholder="e.g. /dashboard/events"
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}
            />
            <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.75rem', color: '#9ca3af' }}>Users will be redirected here when they click the notification.</p>
          </div>

          <button 
            type="submit"
            disabled={sending || !title || !message}
            style={{ 
              marginTop: '0.5rem', padding: '0.85rem', background: '#4F46E5', color: '#fff', border: 'none', 
              borderRadius: '8px', fontWeight: 'bold', fontSize: '0.95rem', cursor: sending ? 'not-allowed' : 'pointer',
              opacity: sending ? 0.7 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>send</span>
            {sending ? 'Sending...' : 'Send Notification'}
          </button>
        </form>
      </div>
    </section>
  );
}
