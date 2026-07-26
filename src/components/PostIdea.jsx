import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import '../design/post-idea.css';

export default function PostIdea() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Basic Info, 2: Additional Details
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Step 1 fields
  const [ideaTitle, setIdeaTitle] = useState('');
  const [description, setDescription] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [solution, setSolution] = useState('');
  const [targetAudience, setTargetAudience] = useState('');

  // Step 2 fields
  const [requirements, setRequirements] = useState('');
  const [prototypeUrl, setPrototypeUrl] = useState('');

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
        project_title: ideaTitle,
        elevator_pitch: description.substring(0, 100),
        description: description,
        problem_statement: problemStatement,
        solution: solution,
        target_audience: targetAudience,
        requirements: requirements || null,
        prototype_url: prototypeUrl || null,
        team_members: [],
        project_status: 'Just an Idea',
        teammates_needed: 1,
        skills_needed: [],
        is_approved: false,
        is_hiring: false,
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
        <section className="pi-form-card">
          {/* Header */}
          <div className="pi-header">
            <img
              alt="SEC Logo"
              className="pi-logo"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1aDWPXfkYscYWDWX4_1d9rTvnTyQuoZFByy2N5bgAfOHNYw_nM6jbF28XU5yzSXNNZVAQ1W3pGF6yKbA5a6_qyvO4AuEWPmmIPz9B2gdMkDNyQGU2JooxY1Pu91WgokFmM6UH5eKYxUyb-hxjlkk8C-9n86Zi_qzkNVZtBt8G8E6hICrwRdOOe09wgxR8MOC62soB6KIlz0pU-nH480RqAx8X2VgESZ44_Y7__BheYVHutUkuC_h-hP7gGU99kgdADnlLXS3Mh_w"
            />
            <h1 className="pi-title">Post Your Idea</h1>
            <p className="pi-subtitle">
              {step === 1 ? 'Tell us about your vision' : 'Add supporting details (optional)'}
            </p>

            {/* Step Indicator */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <div style={{ width: '3rem', height: '4px', borderRadius: '2px', background: '#2563eb', transition: 'background 0.3s' }}></div>
              <div style={{ width: '3rem', height: '4px', borderRadius: '2px', background: step >= 2 ? '#2563eb' : '#e2e8f0', transition: 'background 0.3s' }}></div>
            </div>
          </div>

          {/* Form Body */}
          <form className="pi-form-body" onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); setStep(2); }}>

            {step === 1 && (
              <>
                {/* Idea Title */}
                <div className="pi-input-group">
                  <label className="pi-label">Idea Title *</label>
                  <input
                    className="pi-input bold"
                    placeholder="Give your idea a compelling name"
                    type="text"
                    value={ideaTitle}
                    onChange={(e) => setIdeaTitle(e.target.value)}
                    required
                  />
                </div>

                {/* Description */}
                <div className="pi-input-group">
                  <label className="pi-label">Description *</label>
                  <textarea
                    className="pi-input"
                    placeholder="Describe your idea in detail — what is it and what does it do?"
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    style={{ resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </div>

                {/* Problem Statement */}
                <div className="pi-input-group">
                  <label className="pi-label">Problem Statement *</label>
                  <textarea
                    className="pi-input"
                    placeholder="What problem does your idea solve? Why does it matter?"
                    rows="3"
                    value={problemStatement}
                    onChange={(e) => setProblemStatement(e.target.value)}
                    required
                    style={{ resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </div>

                {/* Solution */}
                <div className="pi-input-group">
                  <label className="pi-label">Solution *</label>
                  <textarea
                    className="pi-input"
                    placeholder="How does your idea solve the problem? What's your approach?"
                    rows="3"
                    value={solution}
                    onChange={(e) => setSolution(e.target.value)}
                    required
                    style={{ resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </div>

                {/* Target Audience */}
                <div className="pi-input-group">
                  <label className="pi-label">Target Audience *</label>
                  <input
                    className="pi-input"
                    placeholder="Who will benefit from this idea? (e.g., Students, Small businesses)"
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                {/* Requirements */}
                <div className="pi-input-group">
                  <label className="pi-label">Requirements</label>
                  <textarea
                    className="pi-input"
                    placeholder="Technical requirements, resources, or tools needed for this idea"
                    rows="3"
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    style={{ resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </div>

                {/* Prototype URL */}
                <div className="pi-input-group">
                  <label className="pi-label">
                    <span>Prototype / Demo Link</span>
                    <span className="pi-char-count">Optional</span>
                  </label>
                  <input
                    className="pi-input"
                    placeholder="https://your-prototype-link.com"
                    type="url"
                    value={prototypeUrl}
                    onChange={(e) => setPrototypeUrl(e.target.value)}
                  />
                </div>

              </>
            )}

            {/* Actions */}
            <div className="pi-actions">
              {error && <p style={{ color: 'red', marginRight: 'auto', fontSize: '0.9rem', width: '100%' }}>{error}</p>}

              {step === 2 && (
                <button
                  type="button"
                  className="pi-btn-cancel"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  ← Back
                </button>
              )}

              {step === 1 && (
                <button
                  type="button"
                  className="pi-btn-cancel"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </button>
              )}

              {step === 1 ? (
                <button type="submit" className="pi-btn-submit">
                  Continue
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              ) : (
                <button type="submit" className="pi-btn-submit" disabled={loading}>
                  {loading ? 'Launching...' : 'Submit Idea for Review'}
                  <span className="material-symbols-outlined">rocket_launch</span>
                </button>
              )}
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}