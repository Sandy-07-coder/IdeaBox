import React from 'react';

export default function IdeaCard({ project, onClick, activeTab, currentUser, currentUserProfile, onHire, onStopHire, onEditHire }) {
  const getBadgeType = (status) => {
    if (status === 'MVP Built') return 'primary';
    if (status === 'Prototype Ready') return 'secondary';
    return 'tertiary';
  };

  const requestsCount = project.team_requests?.filter(req => req.status === 'pending').length || 0;

  // For marketplace: show only title, description (short), and hiring badge
  const descText = project.description || project.elevator_pitch || '';
  const shortDesc = descText.length > 120 ? descText.substring(0, 120) + '...' : descText;

  return (
    <div
      className="fd-card"
      onClick={() => onClick(project)}
      style={{ position: 'relative' }}
    >
      {/* Approval Badge */}
      {(activeTab === 'your-ideas' || activeTab === 'manage-ideas' || (!project.is_approved && currentUserProfile?.user_role === 'admin')) && (
        <div style={{ position: 'absolute', top: '24px', right: '16px', background: project.is_approved ? '#10b981' : '#fbbf24', color: project.is_approved ? '#064e3b' : '#78350f', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', zIndex: 10 }}>
          {project.is_approved ? '✅ Approved' : '⏳ Pending'}
        </div>
      )}

      {/* Hiring Badge */}
      {project.is_hiring && activeTab === 'marketplace' && (
        <div style={{ position: 'absolute', top: '24px', right: '16px', background: '#dbeafe', color: '#1e40af', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem', zIndex: 10 }}>
          <span className="material-symbols-outlined" style={{ fontSize: '0.85rem' }}>work</span>
          Hiring
        </div>
      )}

      <div className="fd-card-topline"></div>
      <div className="fd-card-header">
        <span className={`fd-badge ${getBadgeType(project.project_status)}`}>
          {project.project_status}
        </span>
      </div>
      <h3 className="fd-card-title">{project.project_title}</h3>
      <p className="fd-card-desc">{shortDesc}</p>

      {activeTab === 'your-ideas' && (
        <div style={{ marginTop: '0.75rem', color: '#B0B0B0', fontSize: '0.85rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '1rem', verticalAlign: 'middle', marginRight: '4px' }}>groups</span>
          {requestsCount} Pending Request(s)
        </div>
      )}

      {/* Hiring info for marketplace */}
      {activeTab === 'marketplace' && project.is_hiring && (
        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: '#4F46E5', background: '#e0e7ff', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '500' }}>
            {project.hiring_openings} opening(s)
          </span>
          {project.hiring_commitment && (
            <span style={{ fontSize: '0.75rem', color: '#6b7280', background: '#f3f4f6', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
              {project.hiring_commitment}
            </span>
          )}
        </div>
      )}

      {/* Bottom Buttons */}
      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', width: '100%' }}>
        {activeTab === 'your-ideas' && project.is_approved ? (
          <>
            <button className="fd-details-btn" style={{ flex: 1, margin: 0 }}>
              View Details
            </button>
            {!project.is_hiring ? (
              <button 
                onClick={(e) => { e.stopPropagation(); onHire && onHire(project); }} 
                style={{ flex: 1, padding: '0.65rem', background: '#e0e7ff', color: '#4f46e5', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', margin: 0, zIndex: 5 }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>person_add</span>
                Hire
              </button>
            ) : (
              <div style={{ flex: 1, display: 'flex', gap: '0.25rem' }}>
                <button 
                  onClick={(e) => { e.stopPropagation(); onStopHire && onStopHire(project.id); }} 
                  style={{ flex: 1, padding: '0.65rem', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', margin: 0, zIndex: 5 }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>block</span>
                  Stop Hire
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onEditHire && onEditHire(project); }} 
                  style={{ padding: '0.65rem', background: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0, zIndex: 5 }} 
                  title="Edit Hiring Details"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>edit</span>
                </button>
              </div>
            )}
          </>
        ) : (
          <button className="fd-details-btn" style={{ width: '100%', margin: 0 }}>
            View Details
          </button>
        )}
      </div>
    </div>
  );
}
