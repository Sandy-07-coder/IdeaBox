import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import '../../design/hiring.css';

export default function Hiring({ currentUser, currentUserProfile, projects }) {
  const navigate = useNavigate();
  // Tabs: 'browse', 'manage', 'applications'
  const [activeTab, setActiveTab] = useState('browse');

  // Data states
  const [hiringPosts, setHiringPosts] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [managePosts, setManagePosts] = useState([]); // Posts owned by current user
  const [selectedPost, setSelectedPost] = useState(null); // For viewing applicants
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [postToApply, setPostToApply] = useState(null);
  const [postToEdit, setPostToEdit] = useState(null);

  // Forms
  const [createForm, setCreateForm] = useState({ idea_id: '', title: '', description: '', skills: [], newSkill: '', openings: 1, commitment: '' });
  const [applyForm, setApplyForm] = useState({ cover_note: '', experience: '', resume_url: '' });
  const [editForm, setEditForm] = useState({ openings: 1 });

  // Only projects owned by current user for the dropdown
  const userProjects = projects.filter(p => p.author_id === currentUser?.id && p.is_approved);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'browse') {
        const { data, error } = await supabase
          .from('hiring_posts')
          .select(`*, idea:ideas(project_title, author_id)`)
          .eq('status', 'open')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setHiringPosts(data);
      } else if (activeTab === 'manage') {
        const { data, error } = await supabase
          .from('hiring_posts')
          .select(`*, idea:ideas(project_title)`)
          .eq('owner_id', currentUser.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setManagePosts(data);
      } else if (activeTab === 'applications') {
        const { data, error } = await supabase
          .from('hiring_applications')
          .select(`*, post:hiring_posts(title, idea:ideas(project_title))`)
          .eq('applicant_id', currentUser.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setMyApplications(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Create Post Flow ---
  const handleAddSkill = () => {
    if (createForm.newSkill.trim()) {
      setCreateForm({ ...createForm, skills: [...createForm.skills, createForm.newSkill.trim()], newSkill: '' });
    }
  };

  const handleRemoveSkill = (idx) => {
    setCreateForm({ ...createForm, skills: createForm.skills.filter((_, i) => i !== idx) });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.idea_id) return alert("Please select a project.");

    try {
      const { error } = await supabase.from('hiring_posts').insert([{
        idea_id: createForm.idea_id,
        owner_id: currentUser.id,
        title: createForm.title,
        description: createForm.description,
        skills_needed: createForm.skills,
        total_openings: createForm.openings,
        commitment: createForm.commitment
      }]);
      if (error) throw error;

      setIsCreateModalOpen(false);
      setCreateForm({ idea_id: '', title: '', description: '', skills: [], newSkill: '', openings: 1, commitment: '' });
      fetchData();
    } catch (err) {
      alert("Error creating post: " + err.message);
    }
  };

  // --- Apply Flow ---
  const handleApplySubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('hiring_applications').insert([{
        hiring_post_id: postToApply.id,
        applicant_id: currentUser.id,
        cover_note: applyForm.cover_note,
        experience: applyForm.experience,
        resume_url: applyForm.resume_url || null
      }]);
      if (error) throw error;

      alert("Application submitted successfully!");
      setIsApplyModalOpen(false);
      setPostToApply(null);
      setApplyForm({ cover_note: '', experience: '', resume_url: '' });
    } catch (err) {
      if (err.code === '23505') { // Unique constraint violation
        alert("You have already applied to this position.");
      } else {
        alert("Error applying: " + err.message);
      }
    }
  };

  // --- Review Applications Flow (Owner) ---
  const viewApplicants = async (post) => {
    setSelectedPost(post);
    try {
      const { data, error } = await supabase
        .from('hiring_applications')
        .select(`*, applicant:profiles!applicant_id(id, full_name, avatar_url, persona)`)
        .eq('hiring_post_id', post.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setApplicants(data);
    } catch (err) {
      alert("Error fetching applicants: " + err.message);
    }
  };

  const handleAccept = async (appId) => {
    try {
      const { data, error } = await supabase.rpc('accept_hiring_application', {
        p_application_id: appId,
        p_owner_id: currentUser.id
      });
      if (error) throw error;
      if (!data.ok) throw new Error(data.message);

      // Refresh applicants and posts
      viewApplicants(selectedPost);
      fetchData();
    } catch (err) {
      alert("Error accepting: " + err.message);
    }
  };

  const handleReject = async (appId) => {
    try {
      const { error } = await supabase
        .from('hiring_applications')
        .update({ status: 'rejected' })
        .eq('id', appId);
      if (error) throw error;

      viewApplicants(selectedPost);
    } catch (err) {
      alert("Error rejecting: " + err.message);
    }
  };

  const handleClosePost = async (postId) => {
    try {
      const { data, error } = await supabase.rpc('close_hiring_post', {
        p_post_id: postId,
        p_owner_id: currentUser.id
      });
      if (error) throw error;
      if (!data.ok) throw new Error(data.message);

      fetchData();
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost({ ...selectedPost, status: 'closed' });
      }
    } catch (err) {
      alert("Error closing post: " + err.message);
    }
  };

  const handleEditOpeningsSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.rpc('edit_hiring_post_openings', {
        p_post_id: postToEdit.id,
        p_owner_id: currentUser.id,
        p_new_total: editForm.openings
      });
      if (error) throw error;
      if (!data.ok) throw new Error(data.message);

      alert("Openings updated!");
      setIsEditModalOpen(false);
      setPostToEdit(null);
      fetchData();
    } catch (err) {
      alert("Error updating openings: " + err.message);
    }
  };

  const handleMessage = async (applicantId) => {
    const { data, error } = await supabase.rpc('get_or_create_conversation', {
      user_a: currentUser.id,
      user_b: applicantId,
    });
    if (error) {
      alert('Error starting conversation: ' + error.message);
    } else {
      navigate(`/dashboard/messages/${data}`);
    }
  };

  // --- Renders ---
  return (
    <div className="hr-page">
      {userProjects.length > 0 && (
        <div className="hr-section-header" style={{ justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button className="hr-create-btn" onClick={() => setIsCreateModalOpen(true)}>
            <span className="material-symbols-outlined">add</span> Create Post
          </button>
        </div>
      )}

      {!selectedPost ? (
        <>
          <div className="hr-tabs">
            <button className={`hr-tab-btn ${activeTab === 'browse' ? 'active' : ''}`} onClick={() => setActiveTab('browse')}>
              <span className="material-symbols-outlined">search</span> Jobs
            </button>
            <button className={`hr-tab-btn ${activeTab === 'applications' ? 'active' : ''}`} onClick={() => setActiveTab('applications')}>
              <span className="material-symbols-outlined">work_history</span> Applications
            </button>
            {userProjects.length > 0 && (
              <button className={`hr-tab-btn ${activeTab === 'manage' ? 'active' : ''}`} onClick={() => setActiveTab('manage')}>
                <span className="material-symbols-outlined">manage_accounts</span> Manage
              </button>
            )}
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="hr-error">{error}</p>
          ) : (
            <div className="hr-grid">
              {activeTab === 'browse' && (
                hiringPosts.length === 0 ? (
                  <div className="hr-empty">
                    <span className="material-symbols-outlined">work_off</span>
                    <h3>No open positions</h3>
                    <p>Check back later for new opportunities.</p>
                  </div>
                ) : (
                  hiringPosts.map(post => (
                    <div key={post.id} className="hr-card">
                      <div className="hr-card-top">
                        <div>
                          <h3 className="hr-card-title">{post.title}</h3>
                          <p className="hr-card-project">for {post.idea?.project_title}</p>
                        </div>
                      </div>
                      <div className="hr-card-meta">
                        <span className="hr-meta-item"><span className="material-symbols-outlined">schedule</span> {post.commitment}</span>
                        <span className="hr-meta-item"><span className="material-symbols-outlined">group</span> {post.total_openings - post.accepted_count} open</span>
                      </div>
                      <p className="hr-card-desc">{post.description}</p>
                      <div className="hr-skills">
                        {post.skills_needed.map((s, i) => <span key={i} className="hr-skill-tag">{s}</span>)}
                      </div>
                      <div className="hr-card-actions">
                        <button
                          className="hr-btn hr-btn-primary"
                          onClick={() => {
                            if (post.idea.author_id === currentUser.id) {
                              alert("You cannot apply to your own project's hiring post.");
                              return;
                            }
                            setPostToApply(post);
                            setIsApplyModalOpen(true);
                          }}
                        >
                          Apply Now
                        </button>
                      </div>
                    </div>
                  ))
                )
              )}

              {activeTab === 'manage' && (
                managePosts.length === 0 ? (
                  <div className="hr-empty">
                    <span className="material-symbols-outlined">post_add</span>
                    <h3>No hiring posts</h3>
                    <p>Create a post to start hiring for your projects.</p>
                  </div>
                ) : (
                  managePosts.map(post => (
                    <div key={post.id} className="hr-card">
                      <div className="hr-card-top">
                        <div>
                          <h3 className="hr-card-title">{post.title}</h3>
                          <p className="hr-card-project">for {post.idea?.project_title}</p>
                        </div>
                        <span className={`hr-status-badge ${post.status}`}>{post.status}</span>
                      </div>
                      <div className="hr-card-meta">
                        <span className="hr-meta-item">Slots filled: {post.accepted_count} / {post.total_openings}</span>
                      </div>
                      <div className="hr-card-actions">
                        <button className="hr-btn hr-btn-secondary" onClick={() => viewApplicants(post)}>
                          Review Applicants
                        </button>
                        {post.status === 'open' && (
                          <>
                            <button className="hr-btn hr-btn-ghost" onClick={() => {
                              setPostToEdit(post);
                              setEditForm({ openings: post.total_openings });
                              setIsEditModalOpen(true);
                            }}>
                              Edit Openings
                            </button>
                            <button className="hr-btn hr-btn-ghost" onClick={() => handleClosePost(post.id)}>
                              Close Post
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )
              )}

              {activeTab === 'applications' && (
                myApplications.length === 0 ? (
                  <div className="hr-empty">
                    <span className="material-symbols-outlined">history</span>
                    <h3>No applications yet</h3>
                    <p>Apply to open positions and track them here.</p>
                  </div>
                ) : (
                  myApplications.map(app => (
                    <div key={app.id} className="hr-card">
                      <div className="hr-card-top">
                        <div>
                          <h3 className="hr-card-title">{app.post?.title}</h3>
                          <p className="hr-card-project">for {app.post?.idea?.project_title}</p>
                        </div>
                        <span className={`hr-app-status ${app.status}`}>{app.status}</span>
                      </div>
                      <p className="hr-card-desc" style={{ fontStyle: 'italic' }}>"{app.cover_note}"</p>
                      <div className="hr-card-meta">
                        <span className="hr-meta-item">Applied on {new Date(app.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          )}
        </>
      ) : (
        /* --- Applicants Review View --- */
        <div>
          <button className="hr-back-btn" onClick={() => setSelectedPost(null)}>
            <span className="material-symbols-outlined">arrow_back</span> Back to Posts
          </button>

          <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--fd-surface-container-lowest)', borderRadius: '1rem', border: '1px solid var(--fd-ghost-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 className="hr-section-title" style={{ marginBottom: '0.25rem' }}>{selectedPost.title}</h3>
                <p className="hr-card-project">for {selectedPost.idea?.project_title}</p>
              </div>
              <span className={`hr-status-badge ${selectedPost.status}`}>{selectedPost.status}</span>
            </div>
            <div className="hr-card-meta" style={{ marginTop: '1rem' }}>
              <span className="hr-meta-item">Slots filled: {selectedPost.accepted_count} / {selectedPost.total_openings}</span>
              <span className="hr-meta-item">Total applicants: {applicants.length}</span>
            </div>
          </div>

          <div className="hr-applicant-list">
            {applicants.length === 0 ? (
              <div className="hr-empty">
                <span className="material-symbols-outlined">inbox</span>
                <h3>No applicants yet</h3>
              </div>
            ) : (
              applicants.map(app => (
                <div key={app.id} className="hr-applicant-card">
                  <div className="hr-applicant-top" style={{ justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="hr-avatar">
                        {app.applicant?.avatar_url ? (
                          <img src={app.applicant.avatar_url} alt="" />
                        ) : (
                          (app.applicant?.full_name || 'U').charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="hr-applicant-name">{app.applicant?.full_name || 'Unknown User'}</div>
                        <span className={`hr-app-status ${app.status}`} style={{ marginTop: '0.25rem' }}>{app.status}</span>
                      </div>
                    </div>
                    <div className="hr-applicant-actions">
                      <button className="hr-btn hr-btn-ghost" onClick={() => navigate(`/profile/${app.applicant_id}`)}>View Profile</button>
                      <button className="hr-btn hr-btn-secondary" onClick={() => handleMessage(app.applicant_id)}>Message</button>
                    </div>
                  </div>

                  <div className="hr-divider"></div>

                  <div className="hr-field" style={{ gap: '0.2rem' }}>
                    <span className="hr-label">Cover Note</span>
                    <p className="hr-applicant-note">"{app.cover_note}"</p>
                  </div>
                  <div className="hr-field" style={{ gap: '0.2rem' }}>
                    <span className="hr-label">Experience</span>
                    <p className="hr-applicant-note">{app.experience}</p>
                  </div>
                  {app.resume_url && (
                    <div className="hr-field" style={{ gap: '0.2rem' }}>
                      <span className="hr-label">Resume / Link</span>
                      <a href={app.resume_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: 'var(--fd-primary)' }}>{app.resume_url}</a>
                    </div>
                  )}

                  {selectedPost.status === 'open' && app.status === 'pending' && (
                    <div className="hr-applicant-actions" style={{ marginTop: '0.5rem' }}>
                      <button className="hr-btn hr-btn-primary" onClick={() => handleAccept(app.id)}>Accept</button>
                      <button className="hr-btn hr-btn-danger" onClick={() => handleReject(app.id)}>Reject</button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* --- Create Post Modal --- */}
      {isCreateModalOpen && (
        <div className="hr-modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div className="hr-modal" onClick={e => e.stopPropagation()}>
            <div className="hr-modal-header">
              <div>
                <h3 className="hr-modal-title">Create Hiring Post</h3>
                <p className="hr-modal-subtitle">Find the right people for your idea.</p>
              </div>
              <button className="hr-modal-close" onClick={() => setIsCreateModalOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="hr-modal-body">
                <div className="hr-field">
                  <label className="hr-label">Select Project *</label>
                  <select required className="hr-select" value={createForm.idea_id} onChange={e => setCreateForm({ ...createForm, idea_id: e.target.value })}>
                    <option value="">-- Choose a project --</option>
                    {userProjects.map(p => (
                      <option key={p.id} value={p.id}>{p.project_title}</option>
                    ))}
                  </select>
                </div>
                <div className="hr-field">
                  <label className="hr-label">Role Title *</label>
                  <input required className="hr-input" placeholder="e.g. Frontend Developer" value={createForm.title} onChange={e => setCreateForm({ ...createForm, title: e.target.value })} />
                </div>
                <div className="hr-field">
                  <label className="hr-label">Description *</label>
                  <textarea required className="hr-textarea" placeholder="Describe the responsibilities and what you are looking for..." value={createForm.description} onChange={e => setCreateForm({ ...createForm, description: e.target.value })} />
                </div>
                <div className="hr-field">
                  <label className="hr-label">Skills Needed *</label>
                  <div className="hr-tags-input-row">
                    <input className="hr-input" placeholder="Add a skill..." value={createForm.newSkill} onChange={e => setCreateForm({ ...createForm, newSkill: e.target.value })} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }} />
                    <button type="button" className="hr-tag-add-btn" onClick={handleAddSkill}><span className="material-symbols-outlined">add</span></button>
                  </div>
                  {createForm.skills.length > 0 && (
                    <div className="hr-tags-list">
                      {createForm.skills.map((s, i) => (
                        <span key={i} className="hr-tag-pill">
                          {s} <span className="material-symbols-outlined hr-tag-remove" onClick={() => handleRemoveSkill(i)}>close</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="hr-field" style={{ flex: 1 }}>
                    <label className="hr-label">Openings *</label>
                    <div className="hr-stepper">
                      <button type="button" className="hr-stepper-btn" onClick={() => setCreateForm({ ...createForm, openings: Math.max(1, createForm.openings - 1) })}>-</button>
                      <span className="hr-stepper-val">{createForm.openings}</span>
                      <button type="button" className="hr-stepper-btn" onClick={() => setCreateForm({ ...createForm, openings: createForm.openings + 1 })}>+</button>
                    </div>
                  </div>
                  <div className="hr-field" style={{ flex: 2 }}>
                    <label className="hr-label">Commitment *</label>
                    <select required className="hr-select" value={createForm.commitment} onChange={e => setCreateForm({ ...createForm, commitment: e.target.value })}>
                      <option value="">Select commitment</option>
                      <option value="2-5 hrs/week">2-5 hrs/week</option>
                      <option value="5-10 hrs/week">5-10 hrs/week</option>
                      <option value="10-20 hrs/week">10-20 hrs/week</option>
                      <option value="20-30 hrs/week">20-30 hrs/week</option>
                      <option value="Full-time">Full-time</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="hr-modal-footer">
                <button type="button" className="hr-btn hr-btn-ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
                <button type="submit" className="hr-btn hr-btn-primary">Post Role</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Apply Modal --- */}
      {isApplyModalOpen && postToApply && (
        <div className="hr-modal-overlay" onClick={() => setIsApplyModalOpen(false)}>
          <div className="hr-modal" onClick={e => e.stopPropagation()}>
            <div className="hr-modal-header">
              <div>
                <h3 className="hr-modal-title">Apply for Role</h3>
                <p className="hr-modal-subtitle">{postToApply.title} for {postToApply.idea?.project_title}</p>
              </div>
              <button className="hr-modal-close" onClick={() => setIsApplyModalOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleApplySubmit}>
              <div className="hr-modal-body">
                <div className="hr-field">
                  <label className="hr-label">Cover Note *</label>
                  <textarea required className="hr-textarea" placeholder="Why are you interested in this role?" value={applyForm.cover_note} onChange={e => setApplyForm({ ...applyForm, cover_note: e.target.value })} />
                </div>
                <div className="hr-field">
                  <label className="hr-label">Relevant Experience *</label>
                  <textarea required className="hr-textarea" placeholder="Briefly describe your experience related to the skills needed." value={applyForm.experience} onChange={e => setApplyForm({ ...applyForm, experience: e.target.value })} />
                </div>
                <div className="hr-field">
                  <label className="hr-label">Resume / Portfolio Link (Optional)</label>
                  <input type="url" className="hr-input" placeholder="https://..." value={applyForm.resume_url} onChange={e => setApplyForm({ ...applyForm, resume_url: e.target.value })} />
                </div>
              </div>
              <div className="hr-modal-footer">
                <button type="button" className="hr-btn hr-btn-ghost" onClick={() => setIsApplyModalOpen(false)}>Cancel</button>
                <button type="submit" className="hr-btn hr-btn-primary">Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Edit Openings Modal --- */}
      {isEditModalOpen && postToEdit && (
        <div className="hr-modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="hr-modal" onClick={e => e.stopPropagation()}>
            <div className="hr-modal-header">
              <div>
                <h3 className="hr-modal-title">Edit Openings</h3>
                <p className="hr-modal-subtitle">Update the total number of slots for this position.</p>
              </div>
              <button className="hr-modal-close" onClick={() => setIsEditModalOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleEditOpeningsSubmit}>
              <div className="hr-modal-body">
                <div className="hr-field">
                  <label className="hr-label">Total Openings *</label>
                  <p style={{ fontSize: '0.8rem', color: 'var(--fd-on-surface-variant)', margin: '0 0 0.5rem 0' }}>
                    Currently accepted: {postToEdit.accepted_count}
                  </p>
                  <div className="hr-stepper">
                    <button type="button" className="hr-stepper-btn" onClick={() => setEditForm({ ...editForm, openings: Math.max(postToEdit.accepted_count, editForm.openings - 1) })}>-</button>
                    <span className="hr-stepper-val">{editForm.openings}</span>
                    <button type="button" className="hr-stepper-btn" onClick={() => setEditForm({ ...editForm, openings: editForm.openings + 1 })}>+</button>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                    Note: You cannot decrease total openings below the number of currently accepted applicants.
                  </p>
                </div>
              </div>
              <div className="hr-modal-footer">
                <button type="button" className="hr-btn hr-btn-ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="hr-btn hr-btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
