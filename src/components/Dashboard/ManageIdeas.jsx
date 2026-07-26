import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import IdeaCard from './IdeaCard';

export default function ManageIdeas({ projects, loading, currentUser, currentUserProfile, handleOpenDrawer }) {
  const [editRequests, setEditRequests]   = useState([]);
  const [reqLoading, setReqLoading]       = useState(false);
  const [activeView, setActiveView]       = useState('ideas'); // 'ideas' | 'requests'

  useEffect(() => {
    fetchEditRequests();
  }, []);

  const fetchEditRequests = async () => {
    setReqLoading(true);
    const { data } = await supabase
      .from('idea_edit_requests')
      .select(`
        *,
        idea:ideas(project_title),
        owner:profiles!idea_edit_requests_owner_id_fkey(full_name, email)
      `)
      .order('created_at', { ascending: false });
    setEditRequests(data || []);
    setReqLoading(false);
  };

  const pendingCount = editRequests.filter(r => r.status === 'pending').length;

  const handleAct = async (reqId, decision, adminNote = '') => {
    const { data, error } = await supabase.rpc('admin_act_on_edit_request', {
      p_request_id: reqId,
      p_admin_id:   currentUser.id,
      p_decision:   decision,
      p_admin_note: adminNote || null,
    });
    if (error || !data?.ok) {
      alert('Error: ' + (error?.message || data?.message));
      return;
    }
    alert(`Request ${decision}!`);
    fetchEditRequests();

    // Notify owner
    const req = editRequests.find(r => r.id === reqId);
    if (req) {
      const { sendNotification } = await import('../../store/notificationStore')
        .then(m => m.useNotificationStore.getState());
      await sendNotification({
        userId:  req.owner_id,
        title:   `${req.request_type === 'delete' ? 'Deletion' : 'Edit'} Request ${decision === 'approved' ? 'Approved ✅' : 'Rejected ❌'}`,
        message: `Your ${req.request_type} request for "${req.idea?.project_title}" was ${decision}.${adminNote ? ` Admin note: ${adminNote}` : ''}`,
        type:    'idea',
        link:    `/dashboard/your-ideas`,
      });
    }
  };

  const promptAndAct = async (reqId, decision) => {
    let note = '';
    if (decision === 'rejected') {
      note = window.prompt('Optional rejection note to send to owner:') || '';
    }
    await handleAct(reqId, decision, note);
  };

  return (
    <section>
      {/* Header with toggle */}
      <div className="fd-section-header">
        <h2 className="fd-section-title">Manage All Ideas</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`fd-filter-btn ${activeView === 'ideas' ? 'active' : ''}`}
            onClick={() => setActiveView('ideas')}
          >
            All Ideas
          </button>
          <button
            className={`fd-filter-btn ${activeView === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveView('requests')}
            style={{ position: 'relative' }}
          >
            Edit Requests
            {pendingCount > 0 && (
              <span style={{
                position: 'absolute', top: '-6px', right: '-6px',
                background: '#ef4444', color: '#fff',
                borderRadius: '9999px', fontSize: '0.65rem', fontWeight: '700',
                padding: '0.1rem 0.35rem', minWidth: '16px', textAlign: 'center'
              }}>
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeView === 'ideas' ? (
        <div className="fd-grid">
          {loading ? (
            <p>Loading projects...</p>
          ) : projects.length === 0 ? (
            <p>No ideas found in the database.</p>
          ) : (
            projects.map(project => (
              <IdeaCard
                key={project.id}
                project={project}
                onClick={handleOpenDrawer}
                activeTab="manage-ideas"
                currentUser={currentUser}
                currentUserProfile={currentUserProfile}
              />
            ))
          )}
        </div>
      ) : (
        /* ── Edit / Delete Request Queue ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reqLoading ? (
            <p>Loading requests…</p>
          ) : editRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '3rem', display: 'block', marginBottom: '0.75rem' }}>task_alt</span>
              <p style={{ margin: 0 }}>No edit or deletion requests yet.</p>
            </div>
          ) : (
            editRequests.map(req => (
              <div key={req.id} style={{
                background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px',
                overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}>
                {/* Request header */}
                <div style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f3f4f6' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{
                        padding: '0.15rem 0.55rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase',
                        background: req.request_type === 'delete' ? '#fee2e2' : '#e0e7ff',
                        color:      req.request_type === 'delete' ? '#dc2626'  : '#3730a3',
                      }}>
                        {req.request_type}
                      </span>
                      <span style={{
                        padding: '0.15rem 0.55rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase',
                        background: req.status === 'pending' ? '#fef9c3' : req.status === 'approved' ? '#dcfce7' : '#fee2e2',
                        color:      req.status === 'pending' ? '#854d0e' : req.status === 'approved' ? '#15803d' : '#991b1b',
                      }}>
                        {req.status}
                      </span>
                    </div>
                    <h4 style={{ margin: '0 0 0.2rem', fontSize: '0.95rem', fontWeight: '700', color: '#111827' }}>
                      {req.idea?.project_title || 'Unknown Idea'}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#6b7280' }}>
                      by {req.owner?.full_name || req.owner?.email} · {new Date(req.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Payload preview for edit requests */}
                {req.request_type === 'edit' && req.payload && (
                  <div style={{ padding: '0.75rem 1.25rem', background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                    <p style={{ margin: '0 0 0.4rem', fontSize: '0.72rem', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Requested Changes</p>
                    {Object.entries(req.payload).map(([k, v]) => (
                      <div key={k} style={{ marginBottom: '0.3rem' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: '600', color: '#374151', textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}: </span>
                        <span style={{ fontSize: '0.78rem', color: '#6b7280' }}>{String(v).slice(0, 120)}{String(v).length > 120 ? '…' : ''}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Owner note */}
                {req.owner_note && (
                  <div style={{ padding: '0.6rem 1.25rem', background: '#fffbeb', borderBottom: '1px solid #fef3c7' }}>
                    <span style={{ fontSize: '0.75rem', color: '#92400e' }}>Owner note: {req.owner_note}</span>
                  </div>
                )}

                {/* Admin note (post-decision) */}
                {req.admin_note && (
                  <div style={{ padding: '0.6rem 1.25rem', background: '#f0fdf4', borderBottom: '1px solid #dcfce7' }}>
                    <span style={{ fontSize: '0.75rem', color: '#15803d' }}>Admin note: {req.admin_note}</span>
                  </div>
                )}

                {/* Actions */}
                {req.status === 'pending' && (
                  <div style={{ display: 'flex', borderTop: '1px solid #e5e7eb' }}>
                    <button
                      onClick={() => promptAndAct(req.id, 'approved')}
                      style={{ flex: 1, padding: '0.7rem', background: '#fff', color: '#10b981', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', borderRight: '1px solid #e5e7eb' }}
                      onMouseOver={e => e.currentTarget.style.background = '#ecfdf5'}
                      onMouseOut={e => e.currentTarget.style.background = '#fff'}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>check_circle</span>
                      Approve
                    </button>
                    <button
                      onClick={() => promptAndAct(req.id, 'rejected')}
                      style={{ flex: 1, padding: '0.7rem', background: '#fff', color: '#ef4444', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem' }}
                      onMouseOver={e => e.currentTarget.style.background = '#fef2f2'}
                      onMouseOut={e => e.currentTarget.style.background = '#fff'}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>cancel</span>
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}
