import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import '../design/dashboard.css'; // Re-use general styles

export default function ProjectApplicants() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProjectData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ideas')
      .select('*, profiles!ideas_author_id_fkey(full_name, persona), team_requests(*, profiles!team_requests_user_id_fkey(full_name, mobile_number, email))')
      .eq('id', id)
      .single();

    if (!error && data) {
      setProject(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const handleRequestAction = async (req, status) => {
    const { error } = await supabase
      .from('team_requests')
      .update({ status })
      .eq('id', req.id);
      
    if (error) {
      alert(error.message);
    } else {
      alert(`Request ${status} successfully!`);
      fetchProjectData();
      
      // Send notification
      const { sendNotification } = await import('../store/notificationStore').then(m => m.useNotificationStore.getState());
      await sendNotification({
        userId: req.user_id,
        title: `Application ${status === 'accepted' ? 'Accepted' : 'Rejected'}`,
        message: `Your application to join "${project.project_title}" was ${status}.`,
        type: 'application',
        link: `/dashboard/marketplace/${project.id}`
      });
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading applicants...</div>;
  }

  if (!project) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Project not found.</div>;
  }

  const pendingRequests = project.team_requests?.filter(r => r.status === 'pending') || [];
  const processedRequests = project.team_requests?.filter(r => r.status !== 'pending') || [];

  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', padding: '2rem' }}>
      <button 
        onClick={() => navigate('/dashboard')} 
        style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: '#4F46E5', cursor: 'pointer', fontWeight: '500', fontSize: '1rem' }}
      >
        <span className="material-symbols-outlined">arrow_back</span>
        Back to Dashboard
      </button>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
          Applicants for "{project.project_title}"
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Review and manage people who want to join your team.</p>

        <div style={{ display: 'flex', gap: '2rem', flexDirection: 'column' }}>
          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151', borderBottom: '1px solid #d1d5db', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              Pending Requests ({pendingRequests.length})
            </h2>

            {pendingRequests.length === 0 ? (
              <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', textAlign: 'center', color: '#6b7280', border: '1px solid #e5e7eb' }}>
                No pending applicants right now.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pendingRequests.map(req => (
                  <div key={req.id} style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold', color: '#111827' }}>{req.profiles?.full_name}</h3>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', color: '#4b5563', fontSize: '0.9rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>mail</span> {req.profiles?.email}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>call</span> {req.profiles?.mobile_number}</span>
                        </div>
                      </div>
                      {req.linkedin_link && (
                        <a href={req.linkedin_link} target="_blank" rel="noreferrer" style={{ color: '#4F46E5', textDecoration: 'none', fontWeight: '500', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>link</span> LinkedIn Profile
                        </a>
                      )}
                    </div>
                    
                    <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem' }}>
                      <div style={{ marginBottom: '1rem' }}>
                        <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bio (Skills & Experience)</h4>
                        <p style={{ margin: 0, color: '#1f2937', fontSize: '0.95rem', lineHeight: '1.5' }}>{req.bio || 'Not provided'}</p>
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reason for Joining</h4>
                        <p style={{ margin: 0, color: '#1f2937', fontSize: '0.95rem', lineHeight: '1.5' }}>{req.reason || 'Not provided'}</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button 
                        onClick={() => handleRequestAction(req, 'accepted')}
                        style={{ flex: 1, padding: '0.75rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                      >
                        <span className="material-symbols-outlined">check_circle</span> Accept
                      </button>
                      <button 
                        onClick={() => handleRequestAction(req, 'rejected')}
                        style={{ flex: 1, padding: '0.75rem', background: '#f3f4f6', color: '#4b5563', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                      >
                        <span className="material-symbols-outlined">cancel</span> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {processedRequests.length > 0 && (
            <section style={{ marginTop: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151', borderBottom: '1px solid #d1d5db', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                Processed Requests
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {processedRequests.map(req => (
                  <div key={req.id} style={{ background: '#fff', padding: '1rem 1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold', color: '#111827' }}>{req.profiles?.full_name}</h3>
                      <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280', fontSize: '0.85rem' }}>{req.profiles?.email}</p>
                    </div>
                    <div>
                      <span style={{ 
                        display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: '500',
                        backgroundColor: req.status === 'accepted' ? '#d1fae5' : '#fee2e2',
                        color: req.status === 'accepted' ? '#065f46' : '#991b1b'
                      }}>
                        {req.status === 'accepted' ? 'Accepted' : 'Rejected'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
