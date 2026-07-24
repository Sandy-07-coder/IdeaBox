import React from 'react';

/* ─── Inline SVG Icons ─────────────────────────────────────────────────────── */
const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M7 12.5l3.5 3.5 6.5-7" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
  </svg>
);

const UserPlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);

const StopCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <rect x="9" y="9" width="6" height="6" rx="1" />
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

/* ─── Component ────────────────────────────────────────────────────────────── */
export default function IdeaCard({ project, onClick, activeTab, currentUser, currentUserProfile, onHire, onStopHire, onEditHire }) {
  const getBadgeType = (status) => {
    if (status === 'MVP Built') return 'primary';
    if (status === 'Prototype Ready') return 'secondary';
    return 'tertiary';
  };

  const requestsCount = project.team_requests?.filter(req => req.status === 'pending').length || 0;

  const descText = project.description || project.elevator_pitch || '';
  const shortDesc = descText.length > 120 ? descText.substring(0, 120) + '...' : descText;

  return (
    <div
      className="fd-card"
      onClick={() => onClick(project)}
      style={{ position: 'relative', cursor: 'pointer' }}
    >
      {/* ── Approval Badge ─────────────────────────────────────────────── */}
      {(activeTab === 'your-ideas' || activeTab === 'manage-ideas' || (!project.is_approved && currentUserProfile?.user_role === 'admin')) && (
        <div style={{
          position: 'absolute', top: '20px', right: '16px', zIndex: 10,
          display: 'flex', alignItems: 'center', gap: '5px',
          padding: '0.25rem 0.65rem', borderRadius: '20px',
          fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em',
          /* Approved: soft pastel green per request; Pending: amber */
          background: project.is_approved ? '#d1fae5' : '#fef3c7',
          color:      project.is_approved ? '#065f46' : '#92400e',
        }}>
          {project.is_approved ? <CheckCircleIcon /> : <ClockIcon />}
          {project.is_approved ? 'Approved' : 'Pending'}
        </div>
      )}

      {/* ── Hiring Badge (marketplace) ──────────────────────────────────── */}
      {project.is_hiring && activeTab === 'marketplace' && (
        <div style={{
          position: 'absolute', top: '20px', right: '16px', zIndex: 10,
          display: 'flex', alignItems: 'center', gap: '5px',
          padding: '0.25rem 0.65rem', borderRadius: '20px',
          background: '#dbeafe', color: '#1e40af',
          fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em',
        }}>
          <BriefcaseIcon />
          Hiring
        </div>
      )}

      <div className="fd-card-topline" />
      <div className="fd-card-header">
        <span className={`fd-badge ${getBadgeType(project.project_status)}`}>
          {project.project_status}
        </span>
      </div>
      <h3 className="fd-card-title">{project.project_title}</h3>
      <p className="fd-card-desc">{shortDesc}</p>

      {/* ── Pending requests count ──────────────────────────────────────── */}
      {activeTab === 'your-ideas' && (
        <div style={{ marginTop: '0.5rem', marginBottom: '0.25rem', color: '#6b7280', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <UsersIcon />
          {requestsCount === 1 ? '1 Pending Request' : `${requestsCount} Pending Requests`}
        </div>
      )}

      {/* ── Hiring chips (marketplace) ──────────────────────────────────── */}
      {activeTab === 'marketplace' && project.is_hiring && (
        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: '#4F46E5', background: '#e0e7ff', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '500' }}>
            {project.hiring_openings} opening{project.hiring_openings !== 1 ? 's' : ''}
          </span>
          {project.hiring_commitment && (
            <span style={{ fontSize: '0.75rem', color: '#6b7280', background: '#f3f4f6', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
              {project.hiring_commitment}
            </span>
          )}
        </div>
      )}

      {/* ── Bottom Button Row ───────────────────────────────────────────── */}
      <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.625rem', width: '100%' }}>
        {activeTab === 'your-ideas' && project.is_approved ? (
          <>
            {/* Primary: View Details */}
            <button
              className="fd-details-btn"
              style={{
                flex: 1, margin: 0,
                background: '#1d4ed8', color: '#ffffff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}
            >
              View Details
              <ArrowRightIcon />
            </button>

            {/* Secondary: Hire / Stop Hire */}
            {!project.is_hiring ? (
              <button
                onClick={(e) => { e.stopPropagation(); onHire && onHire(project); }}
                style={{
                  flex: 1, padding: '0.65rem',
                  background: '#e0e7ff', color: '#3730a3',
                  border: 'none', borderRadius: '8px', cursor: 'pointer',
                  fontWeight: '600', fontSize: '0.85rem', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  margin: 0, zIndex: 5,
                }}
              >
                <UserPlusIcon />
                Hire
              </button>
            ) : (
              <div style={{ flex: 1, display: 'flex', gap: '0.5rem' }}>
                {/* Destructive: Stop Hire — #b91c1c on #fee2e2 ≈ 5.9:1 contrast ✓ WCAG AA */}
                <button
                  onClick={(e) => { e.stopPropagation(); onStopHire && onStopHire(project.id); }}
                  style={{
                    flex: 1, padding: '0.65rem',
                    background: '#fee2e2', color: '#b91c1c',
                    border: 'none', borderRadius: '8px', cursor: 'pointer',
                    fontWeight: '600', fontSize: '0.85rem', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    margin: 0, zIndex: 5,
                  }}
                >
                  <StopCircleIcon />
                  Stop Hire
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onEditHire && onEditHire(project); }}
                  title="Edit Hiring Details"
                  style={{
                    padding: '0.65rem 0.75rem',
                    background: '#f3f4f6', color: '#374151',
                    border: 'none', borderRadius: '8px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: 0, zIndex: 5,
                  }}
                >
                  <EditIcon />
                </button>
              </div>
            )}
          </>
        ) : (
          /* Default: View Details (primary solid) */
          <button
            className="fd-details-btn"
            style={{
              width: '100%', margin: 0,
              background: '#1d4ed8', color: '#ffffff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}
          >
            View Details
            <ArrowRightIcon />
          </button>
        )}
      </div>
    </div>
  );
}
