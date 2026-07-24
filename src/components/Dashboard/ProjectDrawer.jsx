import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import '../../design/messages.css';

export default function ProjectDrawer({
  selectedProject,
  handleCloseDrawer,
  activeTab,
  currentUser,
  currentUserProfile,
  fetchIdeas,
  isApplying,
  setIsApplying,
  applyForm,
  setApplyForm,
  submitApplication,
  viewerRole = 'public',   // 'owner' | 'admin' | 'public'
}) {
  const navigate = useNavigate();
  const isAdmin = currentUserProfile?.user_role === 'admin';

  // Single source of truth for visibility gating
  const isPrivileged = viewerRole === 'owner' || viewerRole === 'admin';

  const getBadgeType = (status) => {
    if (status === 'MVP Built') return 'primary';
    if (status === 'Prototype Ready') return 'secondary';
    return 'tertiary';
  };

  if (!selectedProject) return null;

  return (
    <>
      {/* Modal Overlay */}
      <div
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 900,
          animation: 'fadeIn 0.2s ease'
        }}
        onClick={handleCloseDrawer}
      >
        {/* Modal Content */}
        <div
          style={{
            background: '#fff',
            color: '#1f2937',
            borderRadius: '16px',
            width: '92%',
            maxWidth: '700px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            position: 'relative',
            animation: 'slideUp 0.3s ease'
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, background: '#fff', borderRadius: '16px 16px 0 0', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: '#4F46E5' }}>info</span>
              <span style={{ fontWeight: '600', color: '#111827', fontSize: '1rem' }}>Project Details</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button 
                onClick={() => {
                  const url = `${window.location.origin}/dashboard/marketplace/${selectedProject.id}`;
                  navigator.clipboard.writeText(url);
                  alert('Shareable link copied to clipboard!');
                }} 
                style={{ background: '#e0e7ff', border: 'none', cursor: 'pointer', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem 0.75rem', borderRadius: '8px', transition: 'background 0.2s', gap: '0.25rem', fontSize: '0.8rem', fontWeight: '600' }} 
                title="Copy shareable link"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>link</span>
                Copy Link
              </button>
              <button onClick={handleCloseDrawer} style={{ background: '#f3f4f6', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', borderRadius: '8px', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#e5e7eb'} onMouseOut={e => e.currentTarget.style.background = '#f3f4f6'}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>close</span>
              </button>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '1.5rem' }}>
            {/* Status Badges Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <span className={`fd-badge ${getBadgeType(selectedProject.project_status)}`}>{selectedProject.project_status}</span>
              {selectedProject.is_approved ? (
                <span style={{ padding: '0.25rem 0.75rem', background: '#d1fae5', color: '#065f46', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600' }}>✅ Approved</span>
              ) : (
                <span style={{ padding: '0.25rem 0.75rem', background: '#fef3c7', color: '#78350f', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600' }}>⏳ Pending</span>
              )}
            </div>

            {/* Title */}
            <h2 style={{ margin: '0 0 0.75rem 0', fontSize: '1.75rem', fontWeight: '700', color: '#111827', lineHeight: '1.3' }}>{selectedProject.project_title}</h2>

            {/* Description */}
            <p style={{ color: '#4b5563', lineHeight: '1.7', fontSize: '0.95rem', margin: '0 0 1.25rem 0' }}>{selectedProject.description || selectedProject.elevator_pitch}</p>

            {/* ── Full Details — owner / admin only ───────────────────────── */}
            {/* These fields are also absent from the API response for public   */}
            {/* viewers (the store sends a restricted select), so hiding in the */}
            {/* DOM is a defence-in-depth measure, not the sole enforcement.    */}
            {isPrivileged && (
              <>
                {selectedProject.problem_statement && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.85rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Problem Statement</h4>
                    <p style={{ margin: 0, color: '#374151', lineHeight: '1.6', fontSize: '0.9rem', background: '#f9fafb', padding: '0.75rem', borderRadius: '8px', border: '1px solid #f3f4f6' }}>{selectedProject.problem_statement}</p>
                  </div>
                )}
                {selectedProject.solution && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.85rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Solution</h4>
                    <p style={{ margin: 0, color: '#374151', lineHeight: '1.6', fontSize: '0.9rem', background: '#f9fafb', padding: '0.75rem', borderRadius: '8px', border: '1px solid #f3f4f6' }}>{selectedProject.solution}</p>
                  </div>
                )}
                {selectedProject.target_audience && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.85rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Target Audience</h4>
                    <p style={{ margin: 0, color: '#374151', fontSize: '0.9rem', background: '#f0fdf4', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #d1fae5' }}>{selectedProject.target_audience}</p>
                  </div>
                )}
                {selectedProject.requirements && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.85rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Requirements</h4>
                    <p style={{ margin: 0, color: '#374151', lineHeight: '1.6', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{selectedProject.requirements}</p>
                  </div>
                )}
                {selectedProject.prototype_url && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <a href={selectedProject.prototype_url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: '#e0e7ff', color: '#3730a3', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>open_in_new</span>
                      View Prototype
                    </a>
                  </div>
                )}
                {selectedProject.team_members && selectedProject.team_members.length > 0 && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Team Members</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {selectedProject.team_members.map((m, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem', background: '#f3f4f6', borderRadius: '8px' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#4F46E5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>{(m.name || 'U').charAt(0).toUpperCase()}</div>
                          <span style={{ fontSize: '0.8rem', color: '#374151', fontWeight: '500' }}>{m.name}</span>
                          <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>({m.role})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── Public-only: Apply CTA inline in body ────────────────────── */}
            {/* Rendered only for public viewers so it is never duplicated in   */}
            {/* the owner/admin view. The footer Apply button is suppressed for */}
            {/* public viewers below, keeping a single CTA path per role.       */}
            {!isPrivileged && selectedProject.is_hiring && selectedProject.author_id !== currentUser?.id && (
              <div style={{ margin: '0.5rem 0 1.5rem 0' }}>
                <button
                  onClick={() => setIsApplying(true)}
                  style={{ width: '100%', padding: '0.85rem', background: '#4F46E5', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(79,70,229,0.35)' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>work</span>
                  Apply for Position
                </button>
              </div>
            )}

            {/* Meta Info */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {selectedProject.is_approved && selectedProject.admin_profile?.full_name && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem', background: '#d1fae5', borderRadius: '8px', fontSize: '0.8rem', color: '#065f46' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>verified</span>
                  Approved by <strong>{selectedProject.admin_profile.full_name}</strong>
                </div>
              )}
              {selectedProject.is_hiring && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem', background: '#dbeafe', borderRadius: '8px', fontSize: '0.8rem', color: '#1e40af' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>work</span>
                  Hiring {selectedProject.hiring_openings} position(s)
                </div>
              )}
            </div>

            {/* Hiring Skills */}
            {selectedProject.is_hiring && selectedProject.hiring_skills?.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Skills Wanted</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {selectedProject.hiring_skills.map((s, i) => (
                    <span key={i} style={{ padding: '0.3rem 0.7rem', background: '#e0e7ff', color: '#3730a3', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '500' }}>{s}</span>
                  ))}
                </div>
                {selectedProject.hiring_commitment && (
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: '#6b7280' }}>⏱ Commitment: {selectedProject.hiring_commitment}</p>
                )}
              </div>
            )}

            {/* Divider */}
            <div style={{ height: '1px', background: '#e5e7eb', margin: '0.5rem 0 1.5rem 0' }}></div>

            {/* Founder Profile Section */}
            {(activeTab === 'marketplace' || activeTab === 'manage-ideas') && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Founder</h4>
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    cursor: 'pointer', padding: '0.75rem', borderRadius: '12px',
                    border: '1px solid #e5e7eb', transition: 'all 0.2s',
                    background: '#fafafa'
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = '#f0f0ff'; e.currentTarget.style.borderColor = '#c7d2fe'; }}
                  onMouseOut={e => { e.currentTarget.style.background = '#fafafa'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
                  onClick={() => { handleCloseDrawer(); navigate(`/profile/${selectedProject.author_id}`); }}
                >
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: selectedProject?.profiles?.avatar_url ? `url('${selectedProject.profiles.avatar_url}') center/cover` : 'linear-gradient(135deg, #4F46E5, #7c3aed)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 'bold', fontSize: '1.25rem', flexShrink: 0
                  }}>
                    {!selectedProject?.profiles?.avatar_url && (
                      (selectedProject?.profiles?.full_name || 'U').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h5 style={{ margin: 0, color: '#111827', fontSize: '0.95rem', fontWeight: '600' }}>
                      {selectedProject?.profiles?.full_name || `User ${selectedProject?.author_id?.slice(0, 8) || 'Unknown'}`}
                    </h5>
                    <p style={{ margin: '0.15rem 0 0 0', color: '#6b7280', fontSize: '0.8rem' }}>
                      {selectedProject?.profiles?.persona || 'Member'} at Idea Lab
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {currentUser?.id && selectedProject.author_id !== currentUser?.id && (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          const { startConversation } = await import('../../store/chatStore').then(m => m.useChatStore.getState());
                          const convId = await startConversation(currentUser.id, selectedProject.author_id);
                          if (convId) {
                            handleCloseDrawer();
                            navigate(`/dashboard/messages/${convId}`);
                          }
                        }}
                        className="chat-icon-btn"
                        title="Message this person"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>chat</span>
                      </button>
                    )}
                    <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: '#9ca3af' }}>chevron_right</span>
                  </div>
                </div>

                {/* Contact Links */}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                  {selectedProject?.profiles?.mobile_number && (
                    <a href={`tel:${selectedProject.profiles.mobile_number}`} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.75rem', background: '#f3f4f6', borderRadius: '6px', color: '#374151', textDecoration: 'none', fontSize: '0.8rem', fontWeight: '500' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>call</span>
                      {selectedProject.profiles.mobile_number}
                    </a>
                  )}
                  <a href="https://linkedin.com" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.75rem', background: '#f3f4f6', borderRadius: '6px', color: '#374151', textDecoration: 'none', fontSize: '0.8rem', fontWeight: '500' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>link</span>
                    LinkedIn
                  </a>
                </div>
              </div>
            )}

            {/* Applicant Review & Admin Approval */}
            {activeTab !== 'marketplace' && (
              <>
                {selectedProject.author_id === currentUser?.id && (() => {
                  const pendingRequests = selectedProject.team_requests?.filter(r => r.status === 'pending') || [];
                  const processedRequests = selectedProject.team_requests?.filter(r => r.status !== 'pending') || [];

                  const handleRequestAction = async (req, status) => {
                    const { error } = await supabase
                      .from('team_requests')
                      .update({ status })
                      .eq('id', req.id);
                    if (error) {
                      alert(error.message);
                    } else {
                      alert(`Request ${status} successfully!`);
                      fetchIdeas();
                      
                      const { sendNotification } = await import('../../store/notificationStore').then(m => m.useNotificationStore.getState());
                      await sendNotification({
                        userId: req.user_id,
                        title: `Application ${status === 'accepted' ? 'Accepted' : 'Rejected'}`,
                        message: `Your application to join "${selectedProject.project_title}" was ${status}.`,
                        type: 'application',
                        link: `/dashboard/marketplace/${selectedProject.id}`
                      });
                    }
                  };

                  return (
                    <div style={{ marginBottom: '1.25rem' }}>
                      {/* Section Title */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', color: '#4F46E5' }}>group</span>
                        <h4 style={{ margin: 0, color: '#111827', fontWeight: '600', fontSize: '1rem' }}>
                          Applicants ({pendingRequests.length} pending)
                        </h4>
                      </div>

                      {/* Pending Applicants */}
                      {pendingRequests.length === 0 ? (
                        <div style={{ background: '#f9fafb', border: '1px dashed #e5e7eb', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', color: '#6b7280', fontSize: '0.9rem' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: '#d1d5db', display: 'block', marginBottom: '0.5rem' }}>person_search</span>
                          No pending applicants right now.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {pendingRequests.map(req => (
                            <div key={req.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
                              {/* Applicant Header */}
                              <div style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem', flexShrink: 0 }}>
                                    {(req.profiles?.full_name || 'U').charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <h5 style={{ margin: 0, color: '#111827', fontSize: '0.95rem', fontWeight: '600' }}>{req.profiles?.full_name || 'Unknown'}</h5>
                                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                                      {req.profiles?.email && (
                                        <span style={{ color: '#6b7280', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                          <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>mail</span>
                                          {req.profiles.email}
                                        </span>
                                      )}
                                      {req.profiles?.mobile_number && (
                                        <span style={{ color: '#6b7280', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                          <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>call</span>
                                          {req.profiles.mobile_number}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {req.linkedin_link && (
                                  <a href={req.linkedin_link} target="_blank" rel="noreferrer" style={{ color: '#4F46E5', textDecoration: 'none', fontWeight: '500', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.6rem', background: '#e0e7ff', borderRadius: '6px', flexShrink: 0 }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>link</span>
                                    LinkedIn
                                  </a>
                                )}
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    const { startConversation } = await import('../../store/chatStore').then(m => m.useChatStore.getState());
                                    const convId = await startConversation(currentUser.id, req.user_id);
                                    if (convId) {
                                      handleCloseDrawer();
                                      navigate(`/dashboard/messages/${convId}`);
                                    }
                                  }}
                                  className="chat-icon-btn"
                                  title={`Message ${req.profiles?.full_name || 'applicant'}`}
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>chat</span>
                                </button>
                              </div>

                              {/* Bio & Reason */}
                              <div style={{ padding: '0 1.25rem 1rem 1.25rem' }}>
                                <div style={{ background: '#f9fafb', padding: '0.75rem', borderRadius: '8px', marginBottom: '0.75rem' }}>
                                  <h6 style={{ margin: '0 0 0.25rem 0', fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Bio & Skills</h6>
                                  <p style={{ margin: 0, color: '#374151', fontSize: '0.85rem', lineHeight: '1.5' }}>{req.bio || 'Not provided'}</p>
                                </div>
                                <div style={{ background: '#f9fafb', padding: '0.75rem', borderRadius: '8px' }}>
                                  <h6 style={{ margin: '0 0 0.25rem 0', fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Why they want to join</h6>
                                  <p style={{ margin: 0, color: '#374151', fontSize: '0.85rem', lineHeight: '1.5' }}>{req.reason || 'Not provided'}</p>
                                </div>
                              </div>

                              {/* Actions */}
                              <div style={{ display: 'flex', borderTop: '1px solid #e5e7eb' }}>
                                <button
                                  onClick={() => handleRequestAction(req, 'accepted')}
                                  style={{ flex: 1, padding: '0.7rem', background: '#fff', color: '#10b981', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', transition: 'background 0.2s', borderRight: '1px solid #e5e7eb' }}
                                  onMouseOver={e => e.currentTarget.style.background = '#ecfdf5'}
                                  onMouseOut={e => e.currentTarget.style.background = '#fff'}
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>check_circle</span>
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleRequestAction(req, 'rejected')}
                                  style={{ flex: 1, padding: '0.7rem', background: '#fff', color: '#ef4444', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', transition: 'background 0.2s' }}
                                  onMouseOver={e => e.currentTarget.style.background = '#fef2f2'}
                                  onMouseOut={e => e.currentTarget.style.background = '#fff'}
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>cancel</span>
                                  Reject
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Processed Requests */}
                      {processedRequests.length > 0 && (
                        <div style={{ marginTop: '1rem' }}>
                          <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Processed</h5>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {processedRequests.map(req => (
                              <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#e5e7eb', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.75rem' }}>
                                    {(req.profiles?.full_name || 'U').charAt(0).toUpperCase()}
                                  </div>
                                  <span style={{ color: '#374151', fontSize: '0.85rem', fontWeight: '500' }}>{req.profiles?.full_name || 'Unknown'}</span>
                                </div>
                                <span style={{
                                  padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: '600',
                                  background: req.status === 'accepted' ? '#d1fae5' : '#fee2e2',
                                  color: req.status === 'accepted' ? '#065f46' : '#991b1b'
                                }}>
                                  {req.status === 'accepted' ? '✓ Accepted' : '✗ Rejected'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Admin Approval Section */}
                {currentUserProfile?.user_role === 'admin' && !selectedProject.is_approved && (
                  <div style={{ background: '#fffbeb', border: '2px solid #fbbf24', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', color: '#f59e0b' }}>pending_actions</span>
                      <h4 style={{ margin: 0, color: '#92400e', fontWeight: '600' }}>Pending Approval</h4>
                    </div>
                    <p style={{ margin: '0 0 1rem 0', color: '#92400e', fontSize: '0.9rem' }}>
                      This idea is pending admin approval. Once approved, it will be visible to all regular users.
                    </p>
                    <button
                      onClick={async () => {
                        const { data, error } = await supabase
                          .from('ideas')
                          .update({ is_approved: true, approved_by: currentUser?.id })
                          .eq('id', selectedProject.id)
                          .select();

                        if (error) {
                          alert('Error approving idea: ' + error.message);
                        } else if (!data || data.length === 0) {
                          alert('Failed to approve idea. Please ensure you have added the correct RLS policies for admins to update the ideas table.');
                        } else {
                          alert('Idea approved successfully!');
                          fetchIdeas();
                          handleCloseDrawer();
                          
                          // Send notification
                          const { sendNotification } = await import('../../store/notificationStore').then(m => m.useNotificationStore.getState());
                          await sendNotification({
                            userId: selectedProject.author_id,
                            title: 'Idea Approved! 🎉',
                            message: `Your idea "${selectedProject.project_title}" has been approved by the admin and is now live on the marketplace.`,
                            type: 'idea',
                            link: `/dashboard/marketplace/${selectedProject.id}`
                          });
                        }
                      }}
                      style={{ padding: '0.75rem 1.5rem', width: '100%', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>check_circle</span>
                      Approve Idea
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '0.75rem', position: 'sticky', bottom: 0, background: '#fff', borderRadius: '0 0 16px 16px' }}>
            {/* Apply button only renders in the footer for privileged views      */}
            {/* (owner / admin). Public viewers get the inline CTA in the body   */}
            {/* above so the button is never duplicated.                          */}
            {isPrivileged && activeTab === 'marketplace' && selectedProject.is_hiring && selectedProject.author_id !== currentUser?.id ? (
              <>
                <button onClick={() => setIsApplying(true)} style={{ flex: 1, padding: '0.75rem', background: '#4F46E5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>work</span>
                  Apply for Position
                </button>
                <button style={{ padding: '0.75rem', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Share">
                  <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>share</span>
                </button>
              </>
            ) : activeTab === 'marketplace' && isPrivileged ? (
              <button style={{ flex: 1, padding: '0.75rem', background: '#f3f4f6', color: '#6b7280', border: 'none', borderRadius: '8px', fontWeight: '500', fontSize: '0.9rem' }} disabled>
                Not hiring right now
              </button>
            ) : (
              <button style={{ flex: 1, padding: '0.75rem', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }} onClick={handleCloseDrawer}>
                Close
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {isApplying && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', color: '#1f2937', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 0.25rem 0', color: '#111827', fontSize: '1.25rem', fontWeight: 'bold' }}>Apply to "{selectedProject?.project_title}"</h3>
            <p style={{ margin: '0 0 1.5rem 0', color: '#6b7280', fontSize: '0.85rem' }}>Fill in your details to apply for this position</p>

            <form onSubmit={submitApplication}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Auto-filled user info */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <input type="text" value={currentUserProfile?.full_name || ''} disabled style={{ flex: 1, padding: '0.75rem', background: '#f3f4f6', border: '1px solid #e5e7eb', color: '#6b7280', borderRadius: '8px', fontSize: '0.9rem' }} />
                  <input type="email" value={currentUserProfile?.email || ''} disabled style={{ flex: 1, padding: '0.75rem', background: '#f3f4f6', border: '1px solid #e5e7eb', color: '#6b7280', borderRadius: '8px', fontSize: '0.9rem' }} />
                </div>

                {/* Bio */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#374151', marginBottom: '0.35rem' }}>Your Bio *</label>
                  <textarea required placeholder="Tell us about your skills, experience, and expertise..." rows="3" value={applyForm.bio} onChange={e => setApplyForm({ ...applyForm, bio: e.target.value })} style={{ width: '100%', padding: '0.75rem', background: '#fff', border: '1px solid #d1d5db', color: '#111827', borderRadius: '8px', resize: 'none', outline: 'none', fontFamily: 'inherit', fontSize: '0.9rem', boxSizing: 'border-box' }}></textarea>
                </div>

                {/* Resume URL */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#374151', marginBottom: '0.35rem' }}>Resume Link <span style={{ color: '#9ca3af', fontWeight: '400' }}>(optional)</span></label>
                  <input type="url" placeholder="https://drive.google.com/your-resume" value={applyForm.linkedin || ''} onChange={e => setApplyForm({ ...applyForm, linkedin: e.target.value })} style={{ width: '100%', padding: '0.75rem', background: '#fff', border: '1px solid #d1d5db', color: '#111827', borderRadius: '8px', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                </div>

                {/* Why & Interest */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#374151', marginBottom: '0.35rem' }}>Why do you want to work on this & your interest? *</label>
                  <textarea required placeholder="What excites you about this project and why are you the right fit?" rows="3" value={applyForm.reason} onChange={e => setApplyForm({ ...applyForm, reason: e.target.value })} style={{ width: '100%', padding: '0.75rem', background: '#fff', border: '1px solid #d1d5db', color: '#111827', borderRadius: '8px', resize: 'none', outline: 'none', fontFamily: 'inherit', fontSize: '0.9rem', boxSizing: 'border-box' }}></textarea>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsApplying(false)} style={{ flex: 1, padding: '0.75rem', background: '#fff', border: '1px solid #d1d5db', color: '#374151', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '0.75rem', background: '#4F46E5', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
