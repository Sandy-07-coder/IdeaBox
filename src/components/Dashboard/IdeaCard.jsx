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

/* Status icons */
const LightbulbIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="9" y1="18" x2="15" y2="18" />
    <line x1="10" y1="22" x2="14" y2="22" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A7 7 0 1 0 6.5 11.5c.76.76 1.23 1.52 1.41 2.5" />
  </svg>
);

const FlaskIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 3h6M9 3v7l-5 9a1 1 0 0 0 .9 1.5h14.2a1 1 0 0 0 .9-1.5L15 10V3" />
    <line x1="6.5" y1="15" x2="17.5" y2="15" />
  </svg>
);

const RocketIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2a2.99 2.99 0 1 0-3-3Z" />
    <path d="M12 2S7 7 7 13l4 4c6 0 11-5 11-11-2-2-6-4-10-4Z" />
    <circle cx="14.5" cy="9.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

/* ─── Status badge config ──────────────────────────────────────────────────── */
const STATUS_CONFIG = {
  'Just an Idea':    { icon: <LightbulbIcon />, bg: '#fef9c3', color: '#854d0e' }, // amber-100 / amber-800
  'Prototype Ready': { icon: <FlaskIcon />,     bg: '#e0e7ff', color: '#3730a3' }, // indigo-100 / indigo-800
  'MVP Built':       { icon: <RocketIcon />,    bg: '#dcfce7', color: '#166534' }, // green-100 / green-800
};

/* ─── Component ────────────────────────────────────────────────────────────── */
export default function IdeaCard({ project, onClick, activeTab, currentUser, currentUserProfile, onHire, onStopHire, onEditHire }) {
  const requestsCount = project.team_requests?.filter(req => req.status === 'pending').length || 0;

  const descText = project.description || project.elevator_pitch || '';
  const shortDesc = descText.length > 120 ? descText.substring(0, 120) + '...' : descText;

  // Resolve status badge config; fall back gracefully for unknown statuses
  const statusCfg = STATUS_CONFIG[project.project_status] ?? {
    icon: <LightbulbIcon />,
    bg: '#f3f4f6',
    color: '#374151',
  };

  return (
    <div
      className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow border border-outline-variant/10 cursor-pointer group hover:-translate-y-1 transition-all duration-300 relative flex flex-col gap-4 overflow-hidden"
      onClick={() => onClick(project)}
    >
      {/* Featured top edge for Incubator style */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-primary sm:rounded-t-xl" />
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

      
      <div className="flex flex-wrap items-start justify-between gap-2">
        {/* Status badge — icon + label in a self-contained pill */}
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          padding: '0.28rem 0.7rem', borderRadius: '20px',
          fontSize: '0.72rem', fontWeight: '700',
          textTransform: 'uppercase', letterSpacing: '0.04em',
          background: statusCfg.bg, color: statusCfg.color,
        }}>
          {statusCfg.icon}
          {project.project_status}
        </span>
      </div>
      <h3 className="font-headline font-black text-2xl tracking-tight text-on-surface leading-tight">{project.project_title}</h3>
      {/* Extra bottom margin separates description from metadata / buttons */}
      <p className="font-body text-sm text-on-surface-variant line-clamp-3 leading-relaxed mt-1">{shortDesc}</p>

      {/* ── Pending requests count ──────────────────────────────────────── */}
      {activeTab === 'your-ideas' && (
        <div style={{ marginTop: '0.5rem', marginBottom: '0.25rem', color: '#6b7280', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <UsersIcon />
          {requestsCount === 1 ? '1 Pending Request' : `${requestsCount} Pending Requests`}
        </div>
      )}

      {/* ── Hiring chips (marketplace) ──────────────────────────────────── */}
      {/* Both chips share the same neutral palette: #374151 on #f3f4f6.
           #374151 on #f3f4f6 gives ~7.5:1 contrast — well above WCAG AA.      */}
      {activeTab === 'marketplace' && project.is_hiring && (
        <div style={{ marginTop: '0.5rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className="bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-md text-xs font-bold tracking-widest uppercase">
            {project.hiring_openings} opening{project.hiring_openings !== 1 ? 's' : ''}
          </span>
          {project.hiring_commitment && (
            <span className="bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-md text-xs font-bold tracking-widest uppercase">
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
              className="flex-1 flex items-center justify-center gap-2 primary-gradient text-on-primary py-3 rounded-xl font-bold hover:shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
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
            className="w-full flex items-center justify-center gap-2 primary-gradient text-on-primary py-3 rounded-xl font-bold hover:shadow-xl shadow-primary/20 transition-all active:scale-[0.98] mt-auto"
          >
            View Details
            <ArrowRightIcon />
          </button>
        )}
      </div>
    </div>
  );
}
