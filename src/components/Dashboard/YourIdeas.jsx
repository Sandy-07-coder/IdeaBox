import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import IdeaCard from './IdeaCard';

export default function YourIdeas({ projects, loading, currentUser, currentUserProfile, handleOpenDrawer, fetchIdeas }) {
  if (!currentUser) return <p>Loading...</p>;
  const userProjects = projects.filter(p => p.author_id === currentUser.id);
  const [hiringProject, setHiringProject] = useState(null);
  const [hiringForm, setHiringForm] = useState({ openings: 1, skills: [], commitment: '', newSkill: '' });

  const openHiringModal = (project) => {
    setHiringForm({
      openings: project.hiring_openings || 1,
      skills: project.hiring_skills || [],
      commitment: project.hiring_commitment || '',
      newSkill: ''
    });
    setHiringProject(project);
  };

  const addSkill = () => {
    if (hiringForm.newSkill.trim()) {
      setHiringForm({ ...hiringForm, skills: [...hiringForm.skills, hiringForm.newSkill.trim()], newSkill: '' });
    }
  };

  const removeSkill = (idx) => {
    setHiringForm({ ...hiringForm, skills: hiringForm.skills.filter((_, i) => i !== idx) });
  };

  const submitHiring = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('ideas')
      .update({
        is_hiring: true,
        hiring_openings: hiringForm.openings,
        hiring_skills: hiringForm.skills,
        hiring_commitment: hiringForm.commitment
      })
      .eq('id', hiringProject.id);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      alert('Hiring details saved! Your idea is now visible for applications.');
      setHiringProject(null);
      fetchIdeas();
    }
  };

  const stopHiring = async (projectId) => {
    const { error } = await supabase
      .from('ideas')
      .update({ is_hiring: false })
      .eq('id', projectId);
    if (!error) fetchIdeas();
  };

  return (
    <section>
      <div className="fd-section-header">
        <h2 className="fd-section-title">Your Ideas</h2>
      </div>

      <div className="fd-grid">
        {loading ? (
          <p>Loading projects...</p>
        ) : userProjects.length === 0 ? (
          <p>You haven't posted any ideas yet.</p>
        ) : (
          userProjects.map((project) => (
            <div key={project.id}>
              <IdeaCard
                project={project}
                onClick={handleOpenDrawer}
                activeTab="your-ideas"
                currentUser={currentUser}
                currentUserProfile={currentUserProfile}
                onHire={openHiringModal}
                onEditHire={openHiringModal}
                onStopHire={stopHiring}
              />
            </div>
          ))
        )}
      </div>

      {/* Hire Teammates Modal */}
      {hiringProject && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 900 }} onClick={() => setHiringProject(null)}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '92%', maxWidth: '480px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', fontWeight: '700', color: '#111827' }}>Hire Teammates</h3>
            <p style={{ margin: '0 0 1.5rem 0', color: '#6b7280', fontSize: '0.85rem' }}>for "{hiringProject.project_title}"</p>

            <form onSubmit={submitHiring}>
              {/* Openings */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '0.4rem' }}>No. of Openings *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button type="button" onClick={() => setHiringForm({ ...hiringForm, openings: Math.max(1, hiringForm.openings - 1) })} style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#f9fafb', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                  <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', minWidth: '2rem', textAlign: 'center' }}>{hiringForm.openings}</span>
                  <button type="button" onClick={() => setHiringForm({ ...hiringForm, openings: Math.min(20, hiringForm.openings + 1) })} style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#f9fafb', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                </div>
              </div>

              {/* Skills */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '0.4rem' }}>Skills Needed *</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
                  {hiringForm.skills.map((s, i) => (
                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.6rem', background: '#e0e7ff', color: '#3730a3', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '500' }}>
                      {s}
                      <span className="material-symbols-outlined" style={{ fontSize: '0.85rem', cursor: 'pointer' }} onClick={() => removeSkill(i)}>close</span>
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="text" placeholder="Add a skill..." value={hiringForm.newSkill} onChange={e => setHiringForm({ ...hiringForm, newSkill: e.target.value })} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} style={{ flex: 1, padding: '0.6rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', fontSize: '0.9rem' }} />
                  <button type="button" onClick={addSkill} style={{ padding: '0.6rem 0.75rem', background: '#4F46E5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>add</span>
                  </button>
                </div>
              </div>

              {/* Commitment */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '0.4rem' }}>Commitment to Work *</label>
                <select required value={hiringForm.commitment} onChange={e => setHiringForm({ ...hiringForm, commitment: e.target.value })} style={{ width: '100%', padding: '0.7rem', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', fontSize: '0.9rem', background: '#fff', cursor: 'pointer' }}>
                  <option value="">Select commitment level</option>
                  <option value="2-5 hrs/week">2-5 hrs/week</option>
                  <option value="5-10 hrs/week">5-10 hrs/week</option>
                  <option value="10-20 hrs/week">10-20 hrs/week</option>
                  <option value="20-30 hrs/week">20-30 hrs/week</option>
                  <option value="Full-time (30+ hrs/week)">Full-time (30+ hrs/week)</option>
                </select>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={() => setHiringProject(null)} style={{ flex: 1, padding: '0.75rem', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '0.75rem', background: '#4F46E5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>check</span>
                  Start Hiring
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
