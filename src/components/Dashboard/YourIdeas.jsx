import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import IdeaCard from './IdeaCard';
import TeamMemberCard from './TeamMemberCard';
import '../../design/team.css';

/* ─── helpers ────────────────────────────────────────────── */
const EDITABLE_FIELDS = [
  { key: 'project_title', label: 'Project Title', type: 'input' },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'problem_statement', label: 'Problem Statement', type: 'textarea' },
  { key: 'solution', label: 'Solution', type: 'textarea' },
  { key: 'target_audience', label: 'Target Audience', type: 'input' },
  { key: 'requirements', label: 'Requirements', type: 'textarea' },
  { key: 'prototype_url', label: 'Prototype URL', type: 'input' },
];

function pendingEditFor(project, editRequests) {
  return editRequests.find(r => r.idea_id === project.id && r.status === 'pending') || null;
}

/* ─────────────────────────────────────────────────────────── */
export default function YourIdeas({ projects, loading, currentUser, currentUserProfile, handleOpenDrawer, fetchIdeas }) {
  const navigate = useNavigate();
  const userProjects = projects.filter(p => p.author_id === currentUser?.id);

  /* ── State ─────────────────────────────────────────────── */
  // Selected project for detail panel
  const [selected, setSelected] = useState(null);
  // Team members for selected project
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  // Edit-requests for ALL user projects (to show pending banners on cards)
  const [editRequests, setEditRequests] = useState([]);

  // Modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);

  // Forms
  const [editForm, setEditForm] = useState({});
  const [editNote, setEditNote] = useState('');
  const [deleteNote, setDeleteNote] = useState('');
  const [addMemberEmail, setAddMemberEmail] = useState('');
  const [addMemberRole, setAddMemberRole] = useState('Member');

  /* ── Fetch pending edit requests for all user ideas ─────── */
  const fetchEditRequests = useCallback(async () => {
    if (!currentUser || userProjects.length === 0) return;
    const ids = userProjects.map(p => p.id);
    const { data } = await supabase
      .from('idea_edit_requests')
      .select('id, idea_id, status, request_type, created_at, admin_note')
      .in('idea_id', ids)
      .order('created_at', { ascending: false });
    setEditRequests(data || []);
  }, [currentUser, userProjects.length]);

  useEffect(() => { fetchEditRequests(); }, [fetchEditRequests]);

  /* ── Fetch members for selected project ─────────────────── */
  const fetchMembers = useCallback(async (ideaId) => {
    setMembersLoading(true);
    const { data } = await supabase
      .from('idea_members')
      .select(`*, profiles!idea_members_member_id_fkey(id, full_name, avatar_url, persona)`)
      .eq('idea_id', ideaId)
      .order('joined_at', { ascending: true });
    setMembers(data || []);
    setMembersLoading(false);
  }, []);

  const openDetail = (project) => {
    setSelected(project);
    fetchMembers(project.id);
  };

  const closeDetail = () => {
    setSelected(null);
    setMembers([]);
  };

  /* ── Edit idea ──────────────────────────────────────────── */
  const openEditModal = (project) => {
    const initial = {};
    EDITABLE_FIELDS.forEach(f => { initial[f.key] = project[f.key] || ''; });
    setEditForm(initial);
    setEditNote('');
    setEditModalOpen(true);
  };

  const submitEdit = async (project) => {
    // Build payload: only changed fields
    const payload = {};
    EDITABLE_FIELDS.forEach(f => {
      if (editForm[f.key] !== (project[f.key] || '')) {
        payload[f.key] = editForm[f.key];
      }
    });
    if (Object.keys(payload).length === 0) {
      alert('No changes detected.');
      return;
    }

    if (!project.is_approved) {
      // Pre-approval: apply directly
      const { error } = await supabase.from('ideas').update(payload).eq('id', project.id);
      if (error) { alert('Error: ' + error.message); return; }
      alert('Idea updated!');
      setEditModalOpen(false);
      fetchIdeas();
    } else {
      // Post-approval: submit edit request
      const { error } = await supabase.from('idea_edit_requests').insert([{
        idea_id: project.id,
        owner_id: currentUser.id,
        request_type: 'edit',
        payload,
        owner_note: editNote || null,
      }]);
      if (error) { alert('Error: ' + error.message); return; }
      alert('Edit request submitted. An admin will review it shortly.');
      setEditModalOpen(false);
      fetchEditRequests();
    }
  };

  /* ── Delete idea ─────────────────────────────────────────── */
  const submitDelete = async (project) => {
    if (!window.confirm(`Are you sure you want to ${project.is_approved ? 'request deletion of' : 'delete'} "${project.project_title}"?`)) return;

    if (!project.is_approved) {
      const { error } = await supabase.from('ideas').delete().eq('id', project.id);
      if (error) { alert('Error: ' + error.message); return; }
      alert('Idea deleted.');
      setDeleteModalOpen(false);
      closeDetail();
      fetchIdeas();
    } else {
      const { error } = await supabase.from('idea_edit_requests').insert([{
        idea_id: project.id,
        owner_id: currentUser.id,
        request_type: 'delete',
        owner_note: deleteNote || null,
      }]);
      if (error) { alert('Error: ' + error.message); return; }
      alert('Deletion request submitted. An admin will review it.');
      setDeleteModalOpen(false);
      fetchEditRequests();
    }
  };

  /* ── Team member ops (always direct, no admin approval) ─── */
  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Remove this team member?')) return;
    const { error } = await supabase
      .from('idea_members')
      .update({ left_at: new Date().toISOString() })
      .eq('id', memberId);
    if (error) { alert(error.message); return; }

    // Also mark the hiring_application as 'removed' if it exists
    const m = members.find(x => x.id === memberId);
    if (m?.hiring_application_id) {
      await supabase
        .from('hiring_applications')
        .update({ status: 'removed' })
        .eq('id', m.hiring_application_id);
    }
    fetchMembers(selected.id);
  };

  const handleRoleChange = async (memberId, newRole) => {
    await supabase.from('idea_members').update({ role: newRole }).eq('id', memberId);
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));
  };

  const handleAddMember = async () => {
    if (!addMemberEmail.trim()) return;
    // Look up profile by email
    const { data: profile, error: pErr } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('email', addMemberEmail.trim())
      .single();
    if (pErr || !profile) { alert('No user found with that email.'); return; }

    const { error } = await supabase.from('idea_members').insert([{
      idea_id: selected.id,
      member_id: profile.id,
      role: addMemberRole || 'Member',
      source: 'manual',
    }]);
    if (error) {
      if (error.code === '23505') {
        alert(`${profile.full_name} is already an active member.`);
      } else {
        alert(error.message);
      }
      return;
    }
    setAddMemberEmail('');
    setAddMemberRole('Member');
    setAddMemberOpen(false);
    fetchMembers(selected.id);
  };

  /* ── UI ──────────────────────────────────────────────────── */
  if (!currentUser) return <p>Loading...</p>;


  return (
    <section>
      {!selected ? (
        /* ── Cards grid view ──────────────────────────────── */
        <>
          <div className="fd-section-header">
            <h2 className="fd-section-title">Your Ideas</h2>
          </div>

          <div className="fd-grid">
            {loading ? (
              <p>Loading projects...</p>
            ) : userProjects.length === 0 ? (
              <p style={{ color: 'var(--fd-on-surface-variant)' }}>You haven't posted any ideas yet.</p>
            ) : (
              userProjects.map(project => {
                const pending = pendingEditFor(project, editRequests);
                const rejected = editRequests.find(r => r.idea_id === project.id && r.status === 'rejected');
                return (
                  <div key={project.id} style={{ position: 'relative' }}>
                    {pending && (
                      <div className="er-banner pending" style={{ marginBottom: '0.5rem' }}>
                        <span className="material-symbols-outlined">pending_actions</span>
                        <div className="er-banner-content">
                          <p className="er-banner-title">Edit / Delete Request Pending</p>
                          <p className="er-banner-desc">Awaiting admin review. Changes will apply once approved.</p>
                        </div>
                      </div>
                    )}
                    {rejected && !pending && (
                      <div className="er-banner rejected" style={{ marginBottom: '0.5rem' }}>
                        <span className="material-symbols-outlined">cancel</span>
                        <div className="er-banner-content">
                          <p className="er-banner-title">Request Rejected</p>
                          <p className="er-banner-desc">{rejected.admin_note || 'Your last request was rejected by an admin. You can submit a new one.'}</p>
                        </div>
                      </div>
                    )}
                    <IdeaCard
                      project={project}
                      onClick={() => openDetail(project)}
                      activeTab="your-ideas"
                      currentUser={currentUser}
                      currentUserProfile={currentUserProfile}
                    />
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : (
        /* ── Detail / edit panel ─────────────────────────── */
        <div>
          {/* Back */}
          <button className="hr-back-btn" onClick={closeDetail}>
            <span className="material-symbols-outlined">arrow_back</span> Your Ideas
          </button>

          {/* Header */}
          <div className="hr-section-header">
            <div>
              <h2 className="hr-section-title">{selected.project_title}</h2>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                <span style={{ padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: '700', background: selected.is_approved ? '#dcfce7' : '#fef9c3', color: selected.is_approved ? '#15803d' : '#854d0e' }}>
                  {selected.is_approved ? '✅ Approved' : '⏳ Pending Approval'}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button className="hr-btn hr-btn-secondary" style={{ flex: 'none', padding: '0.55rem 0.9rem' }}
                onClick={() => openEditModal(selected)}
                disabled={!!pendingEditFor(selected, editRequests)}
                title={pendingEditFor(selected, editRequests) ? 'A request is already pending' : 'Edit idea details'}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>edit</span>
                {selected.is_approved ? 'Request Edit' : 'Edit'}
              </button>
              <button className="hr-btn hr-btn-danger" style={{ flex: 'none', padding: '0.55rem 0.9rem' }}
                onClick={() => selected.is_approved ? setDeleteModalOpen(true) : submitDelete(selected)}
                disabled={!!pendingEditFor(selected, editRequests)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>delete</span>
                {selected.is_approved ? 'Request Delete' : 'Delete'}
              </button>
            </div>
          </div>

          {/* Pending banner for this idea */}
          {pendingEditFor(selected, editRequests) && (
            <div className="er-banner pending">
              <span className="material-symbols-outlined">pending_actions</span>
              <div className="er-banner-content">
                <p className="er-banner-title">Request Pending Admin Review</p>
                <p className="er-banner-desc">Your edit/delete request is waiting for admin approval. The idea continues to display its current approved details until the admin acts.</p>
              </div>
            </div>
          )}

          {/* Idea Details */}
          <div style={{
            background: '#f9fafb',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            {/* Description */}
            {selected.description && (
              <p style={{ color: '#374151', lineHeight: '1.7', fontSize: '0.95rem', margin: '0 0 1.5rem 0' }}>
                {selected.description}
              </p>
            )}

            {/* Problem Statement */}
            {selected.problem_statement && (
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.85rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Problem Statement</h4>
                <p style={{ margin: 0, color: '#374151', lineHeight: '1.6', fontSize: '0.9rem', background: '#fff5f5', padding: '0.75rem', borderRadius: '8px', border: '1px solid #fed7d7' }}>
                  {selected.problem_statement}
                </p>
              </div>
            )}

            {/* Solution */}
            {selected.solution && (
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.85rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Solution</h4>
                <p style={{ margin: 0, color: '#374151', lineHeight: '1.6', fontSize: '0.9rem', background: '#f0fff4', padding: '0.75rem', borderRadius: '8px', border: '1px solid #c6f6d5' }}>
                  {selected.solution}
                </p>
              </div>
            )}

            {/* Target Audience */}
            {selected.target_audience && (
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.85rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Target Audience</h4>
                <p style={{ margin: 0, color: '#2c5282', fontSize: '0.9rem', background: '#ebf8ff', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #bee3f8' }}>
                  {selected.target_audience}
                </p>
              </div>
            )}

            {/* Requirements */}
            {selected.requirements && (
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.85rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Requirements</h4>
                <p style={{ margin: 0, color: '#374151', lineHeight: '1.6', fontSize: '0.9rem', whiteSpace: 'pre-wrap', background: '#fffff0', padding: '0.75rem', borderRadius: '8px', border: '1px solid #fef08a' }}>
                  {selected.requirements}
                </p>
              </div>
            )}

            {/* Prototype Link */}
            {selected.prototype_url && (
              <div style={{ marginBottom: '0' }}>
                <a
                  href={selected.prototype_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: '#e0e7ff', color: '#3730a3', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>open_in_new</span>
                  View Prototype
                </a>
              </div>
            )}
          </div>


          {/* Team Members */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 className="hr-section-title" style={{ fontSize: '1.1rem' }}>Team Members</h3>
              <button className="hr-btn hr-btn-primary" style={{ flex: 'none', padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                onClick={() => setAddMemberOpen(v => !v)}>
                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>person_add</span>
                Add Member
              </button>
            </div>

            {/* Add member form */}
            {addMemberOpen && (
              <div className="tm-add-row" style={{ marginBottom: '0.75rem' }}>
                <input
                  className="hr-input"
                  type="email"
                  placeholder="Member's email address..."
                  value={addMemberEmail}
                  onChange={e => setAddMemberEmail(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddMember(); }}
                />
                <input
                  className="hr-input"
                  type="text"
                  placeholder="Role (e.g. Designer)"
                  value={addMemberRole}
                  onChange={e => setAddMemberRole(e.target.value)}
                  style={{ maxWidth: '160px' }}
                />
                <button className="hr-btn hr-btn-primary" style={{ flex: 'none', padding: '0.55rem 0.85rem' }}
                  onClick={handleAddMember}>Add</button>
                <button className="hr-btn hr-btn-ghost" style={{ flex: 'none', padding: '0.55rem 0.85rem' }}
                  onClick={() => setAddMemberOpen(false)}>Cancel</button>
              </div>
            )}

            {membersLoading ? (
              <p style={{ color: 'var(--fd-on-surface-variant)', fontSize: '0.875rem' }}>Loading members…</p>
            ) : members.filter(m => !m.left_at).length === 0 ? (
              <div className="hr-empty" style={{ padding: '2rem 1rem' }}>
                <span className="material-symbols-outlined">group_off</span>
                <h3>No team members yet</h3>
                <p>Accepted applicants from Hiring will appear here automatically. You can also add members manually above.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {members.filter(m => !m.left_at).map(m => (
                  <TeamMemberCard
                    key={m.id}
                    member={m}
                    currentUser={currentUser}
                    onRemove={handleRemoveMember}
                    onRoleChange={handleRoleChange}
                  />
                ))}
              </div>
            )}

            {/* Past members */}
            {members.filter(m => m.left_at).length > 0 && (
              <details style={{ marginTop: '1rem' }}>
                <summary style={{ cursor: 'pointer', fontSize: '0.8rem', color: 'var(--fd-outline)', fontWeight: 600 }}>
                  Past members ({members.filter(m => m.left_at).length})
                </summary>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {members.filter(m => m.left_at).map(m => (
                    <TeamMemberCard key={m.id} member={m} currentUser={currentUser} />
                  ))}
                </div>
              </details>
            )}
          </div>
        </div>
      )}

      {/* ── Edit Modal ─────────────────────────────────────── */}
      {editModalOpen && selected && (
        <div className="hr-modal-overlay" onClick={() => setEditModalOpen(false)}>
          <div className="hr-modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="hr-modal-header">
              <div>
                <h3 className="hr-modal-title">{selected.is_approved ? 'Submit Edit Request' : 'Edit Idea'}</h3>
                <p className="hr-modal-subtitle">
                  {selected.is_approved
                    ? 'Changes will be applied only after admin approval.'
                    : 'Changes apply immediately (idea not yet approved).'}
                </p>
              </div>
              <button className="hr-modal-close" onClick={() => setEditModalOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="hr-modal-body">
              {EDITABLE_FIELDS.map(f => (
                <div key={f.key} className="hr-field">
                  <label className="hr-label">{f.label}</label>
                  {f.type === 'textarea' ? (
                    <textarea className="hr-textarea"
                      value={editForm[f.key] || ''}
                      onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })} />
                  ) : (
                    <input className="hr-input" type="text"
                      value={editForm[f.key] || ''}
                      onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })} />
                  )}
                </div>
              ))}
              {selected.is_approved && (
                <div className="hr-field">
                  <label className="hr-label">Reason for change (optional)</label>
                  <textarea className="hr-textarea" placeholder="Explain why you need to update this..."
                    value={editNote} onChange={e => setEditNote(e.target.value)} />
                </div>
              )}
            </div>
            <div className="hr-modal-footer">
              <button className="hr-btn hr-btn-ghost" onClick={() => setEditModalOpen(false)}>Cancel</button>
              <button className="hr-btn hr-btn-primary" onClick={() => submitEdit(selected)}>
                {selected.is_approved ? 'Submit Request' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Request Modal (post-approval) ───────────── */}
      {deleteModalOpen && selected && (
        <div className="hr-modal-overlay" onClick={() => setDeleteModalOpen(false)}>
          <div className="hr-modal" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <div className="hr-modal-header">
              <div>
                <h3 className="hr-modal-title">Request Deletion</h3>
                <p className="hr-modal-subtitle">An admin must approve this before the idea is deleted.</p>
              </div>
              <button className="hr-modal-close" onClick={() => setDeleteModalOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="hr-modal-body">
              <div className="hr-field">
                <label className="hr-label">Reason for deletion (optional)</label>
                <textarea className="hr-textarea" placeholder="Why do you want to remove this idea?"
                  value={deleteNote} onChange={e => setDeleteNote(e.target.value)} />
              </div>
            </div>
            <div className="hr-modal-footer">
              <button className="hr-btn hr-btn-ghost" onClick={() => setDeleteModalOpen(false)}>Cancel</button>
              <button className="hr-btn hr-btn-danger" onClick={() => submitDelete(selected)}>Submit Deletion Request</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
