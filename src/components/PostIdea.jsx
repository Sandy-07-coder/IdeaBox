import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import '../design/post-idea.css';

export default function PostIdea() {
  const navigate = useNavigate();
  const [projectTitle, setProjectTitle] = useState('');
  const [elevatorPitch, setElevatorPitch] = useState('');
  const [projectStatus, setProjectStatus] = useState('Just an Idea');
  const [teammatesNeeded, setTeammatesNeeded] = useState(1);
  const [skills, setSkills] = useState([
    { id: 1, name: 'UI/UX', type: 'primary' },
    { id: 2, name: 'Python', type: 'primary' },
    { id: 3, name: 'Finance', type: 'tertiary' }
  ]);
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePitchChange = (e) => {
    if (e.target.value.length <= 100) {
      setElevatorPitch(e.target.value);
    }
  };

  const handleTeammateChange = (delta) => {
    setTeammatesNeeded(prev => {
      const newVal = prev + delta;
      if (newVal >= 1 && newVal <= 10) return newVal;
      return prev;
    });
  };

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' && newSkill.trim() !== '') {
      e.preventDefault();
      const newSkillObj = {
        id: Date.now(),
        name: newSkill.trim(),
        type: 'primary' // default type
      };
      setSkills([...skills, newSkillObj]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (idToRemove) => {
    setSkills(skills.filter(skill => skill.id !== idToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (!user) {
      setError('You must be logged in to post an idea. Please log in.');
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from('ideas').insert([
      {
        author_id: user.id,
        project_title: projectTitle,
        elevator_pitch: elevatorPitch,
        project_status: projectStatus,
        teammates_needed: teammatesNeeded,
        skills_needed: skills.map(s => s.name),
        is_approved: false
      }
    ]);

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    navigate('/dashboard');
  };

  return (
    <div className="post-idea-wrapper">
      {/* Background Mockup (Blurred) */}
      <main className="pi-bg-mockup">
        <div className="pi-bg-header">
          <div className="pi-bg-flex-gap">
            <div className="pi-bg-box-1"></div>
            <div className="pi-bg-box-2"></div>
          </div>
          <div className="pi-bg-flex-gap">
            <div className="pi-bg-circle"></div>
            <div className="pi-bg-circle"></div>
          </div>
        </div>
        <div className="pi-bg-content">
          <div className="pi-bg-col-8">
            <div className="pi-bg-card-large"></div>
            <div className="pi-bg-grid-2">
              <div className="pi-bg-card-medium"></div>
              <div className="pi-bg-card-medium"></div>
            </div>
          </div>
          <div className="pi-bg-col-4">
            <div className="pi-bg-card-tall"></div>
            <div className="pi-bg-card-medium"></div>
          </div>
        </div>
      </main>

      {/* Modal Overlay */}
      <div className="pi-modal-overlay">
        {/* Form Card */}
        <section className="pi-form-card">
          {/* Header */}
          <div className="pi-header">
            <img 
              alt="SEC Logo" 
              className="pi-logo" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1aDWPXfkYscYWDWX4_1d9rTvnTyQuoZFByy2N5bgAfOHNYw_nM6jbF28XU5yzSXNNZVAQ1W3pGF6yKbA5a6_qyvO4AuEWPmmIPz9B2gdMkDNyQGU2JooxY1Pu91WgokFmM6UH5eKYxUyb-hxjlkk8C-9n86Zi_qzkNVZtBt8G8E6hICrwRdOOe09wgxR8MOC62soB6KIlz0pU-nH480RqAx8X2VgESZ44_Y7__BheYVHutUkuC_h-hP7gGU99kgdADnlLXS3Mh_w" 
            />
            <h1 className="pi-title">Post Your Idea</h1>
            <p className="pi-subtitle">Share your vision with the Idea-Box community</p>
          </div>

          {/* Form Body */}
          <form className="pi-form-body" onSubmit={handleSubmit}>
            {/* Project Title */}
            <div className="pi-input-group">
              <label className="pi-label">Project Title</label>
              <input 
                className="pi-input bold" 
                placeholder="Enter a descriptive name for your idea" 
                type="text" 
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                required
              />
            </div>

            {/* Elevator Pitch */}
            <div className="pi-input-group">
              <div className="pi-label">
                <span>Elevator Pitch</span>
                <span className="pi-char-count">{elevatorPitch.length}/100</span>
              </div>
              <input 
                className="pi-input" 
                maxLength="100" 
                placeholder="Explain your idea in one sentence..." 
                type="text" 
                value={elevatorPitch}
                onChange={handlePitchChange}
                required
              />
            </div>

            {/* Two Column Row: Status & Teammates */}
            <div className="pi-row">
              {/* Project Status */}
              <div className="pi-input-group">
                <label className="pi-label">Project Status</label>
                <div className="pi-select-wrapper">
                  <select 
                    className="pi-select"
                    value={projectStatus}
                    onChange={(e) => setProjectStatus(e.target.value)}
                  >
                    <option value="Just an Idea">Just an Idea</option>
                    <option value="Prototype Ready">Prototype Ready</option>
                    <option value="MVP Built">MVP Built</option>
                  </select>
                  <span className="material-symbols-outlined pi-select-icon">expand_more</span>
                </div>
              </div>

              {/* Teammates Needed */}
              <div className="pi-input-group">
                <label className="pi-label">Teammates Needed</label>
                <div className="pi-counter">
                  <button 
                    type="button"
                    className="pi-counter-btn" 
                    onClick={() => handleTeammateChange(-1)}
                  >
                    <span className="material-symbols-outlined">remove</span>
                  </button>
                  <input 
                    className="pi-counter-input" 
                    max="10" 
                    min="1" 
                    type="number" 
                    value={teammatesNeeded}
                    readOnly
                  />
                  <button 
                    type="button"
                    className="pi-counter-btn" 
                    onClick={() => handleTeammateChange(1)}
                  >
                    <span className="material-symbols-outlined">add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Skills Looking For */}
            <div className="pi-input-group">
              <label className="pi-label">Skills I’m Looking For</label>
              <div className="pi-skills-container">
                {/* Tags */}
                {skills.map(skill => (
                  <div key={skill.id} className={`pi-skill-tag ${skill.type}`}>
                    {skill.name}
                    <span 
                      className="material-symbols-outlined pi-skill-remove"
                      onClick={() => handleRemoveSkill(skill.id)}
                    >
                      close
                    </span>
                  </div>
                ))}
                
                <input 
                  className="pi-skill-input" 
                  placeholder="Add skill... (Press Enter)" 
                  type="text" 
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={handleAddSkill}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pi-actions">
              {error && <p style={{ color: 'red', marginRight: 'auto', fontSize: '0.9rem', width: '100%' }}>{error}</p>}
              <button 
                type="button" 
                className="pi-btn-cancel"
                onClick={() => navigate('/dashboard')}
                disabled={loading}
              >
                Cancel
              </button>
              <button type="submit" className="pi-btn-submit" disabled={loading}>
                {loading ? 'Launching...' : 'Launch Idea to Marketplace'}
                <span className="material-symbols-outlined">rocket_launch</span>
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
