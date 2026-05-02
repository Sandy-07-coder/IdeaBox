import React from 'react';

export default function IdeaCard({ project, onClick, activeTab, currentUser, currentUserProfile }) {
  const getBadgeType = (status) => {
    if (status === 'MVP Built') return 'primary';
    if (status === 'Prototype Ready') return 'secondary';
    return 'tertiary';
  };

  const requestsCount = project.team_requests?.filter(req => req.status === 'pending').length || 0;

  return (
    <div
      className="fd-card"
      onClick={() => onClick(project)}
      style={{ position: 'relative' }}
    >
      {(activeTab === 'your-ideas' || activeTab === 'manage-ideas' || (!project.is_approved && currentUserProfile?.user_role === 'admin')) && (
        <div style={{ position: 'absolute', top: '24px', right: '16px', background: project.is_approved ? '#10b981' : '#fbbf24', color: project.is_approved ? '#064e3b' : '#78350f', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', zIndex: 10 }}>
          {project.is_approved ? '✅ Approved' : '⏳ Pending'}
        </div>
      )}
      <div className="fd-card-topline"></div>
      <div className="fd-card-header">
        <span className={`fd-badge ${getBadgeType(project.project_status)}`}>
          {project.project_status}
        </span>
      </div>
      <h3 className="fd-card-title">{project.project_title}</h3>
      <p className="fd-card-desc">{project.elevator_pitch}</p>

      {activeTab === 'your-ideas' && (
        <div style={{ marginTop: '1rem', color: '#B0B0B0', fontSize: '0.85rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '1rem', verticalAlign: 'middle', marginRight: '4px' }}>groups</span>
          {requestsCount} Pending Request(s)
        </div>
      )}

      <div className="fd-tags">
        {(project.skills_needed || []).map((tag, idx) => (
          <span key={idx} className="fd-tag">{tag}</span>
        ))}
      </div>
      <button className="fd-details-btn">
        View Details
      </button>
    </div>
  );
}
