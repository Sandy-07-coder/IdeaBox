import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, persona, user_role, institution_name, created_at, avatar_url')
        .order('created_at', { ascending: false });
      if (!error && data) setUsers(data);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const handleToggleRole = async (user) => {
    const newRole = user.user_role === 'admin' ? 'regular' : 'admin';
    if (!window.confirm(`Make ${user.full_name || user.email} ${newRole === 'admin' ? 'an Admin' : 'a Regular user'}?`)) return;
    const { error } = await supabase.from('profiles').update({ user_role: newRole }).eq('id', user.id);
    if (error) alert(error.message);
    else setUsers(prev => prev.map(u => u.id === user.id ? { ...u, user_role: newRole } : u));
  };

  const filtered = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (u.full_name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
  });

  return (
    <section>
      <div className="fd-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 className="fd-section-title">Platform Users</h2>
        <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '500' }}>{users.length} total</span>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', maxWidth: '360px', padding: '0.6rem 1rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>Loading users...</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', background: '#fff', borderRadius: '8px', border: '1px dashed #e5e7eb' }}>
          {search ? 'No users match your search.' : 'No users found.'}
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflowX: 'auto' }}>
          <div style={{ minWidth: '800px' }}>
            {/* Table Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr', padding: '1rem 1.25rem', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <span>User</span>
              <span>Email</span>
              <span>Persona</span>
              <span>Role</span>
              <span style={{ textAlign: 'right' }}>Actions</span>
            </div>

            {filtered.map((user, idx) => (
              <div
                key={user.id}
                style={{
                  display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr',
                  padding: '1rem 1.25rem', alignItems: 'center',
                  borderBottom: idx < filtered.length - 1 ? '1px solid #f3f4f6' : 'none',
                  transition: 'background 0.15s'
                }}
              onMouseOver={e => e.currentTarget.style.background = '#f9fafb'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* Name + Avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #4F46E5, #7c3aed)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem', flexShrink: 0, overflow: 'hidden' }}>
                  {user.avatar_url
                    ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : (user.full_name || 'U').charAt(0).toUpperCase()}
                </div>
                <span style={{ fontWeight: '600', fontSize: '0.9rem', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.full_name || 'No name'}
                </span>
              </div>

              {/* Email */}
              <span style={{ fontSize: '0.83rem', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</span>

              {/* Persona */}
              <span style={{ fontSize: '0.8rem', color: '#374151', textTransform: 'capitalize' }}>{(user.persona || '—').replace('-', ' ')}</span>

              {/* Role Badge */}
              <span style={{
                display: 'inline-flex', padding: '0.2rem 0.65rem', borderRadius: '999px',
                fontSize: '0.72rem', fontWeight: '700',
                background: user.user_role === 'admin' ? '#fef3c7' : '#e0e7ff',
                color: user.user_role === 'admin' ? '#92400e' : '#3730a3',
              }}>
                {user.user_role === 'admin' ? '⭐ Admin' : 'Regular'}
              </span>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => navigate(`/profile/${user.id}`)}
                  title="View profile"
                  style={{ padding: '0.5rem 0.6rem', background: '#f3f4f6', color: '#6b7280', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>person</span>
                </button>
                <button
                  onClick={async () => {
                    const { currentUser } = await import('../../store').then(m => m.useUserStore.getState());
                    if (!currentUser?.id) return alert('Please log in first');
                    const { startConversation } = await import('../../store/chatStore').then(m => m.useChatStore.getState());
                    const convId = await startConversation(currentUser.id, user.id);
                    if (convId) {
                      navigate(`/admin/messages/${convId}`);
                    }
                  }}
                  title={`Message ${user.full_name || 'user'}`}
                  style={{ padding: '0.5rem 0.6rem', background: '#e0e7ff', color: '#4F46E5', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>chat</span>
                </button>
              </div>
            </div>
          ))}
          </div>
        </div>
      )}
    </section>
  );
}
