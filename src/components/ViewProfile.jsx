import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useUserStore } from '../store';
import TopHeader from './header/TopHeader';

export default function ViewProfile() {
  const navigate = useNavigate();
  const { id: profileId } = useParams();
  const { currentUser, currentUserProfile, loadingAuth, fetchUser } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [viewedProfile, setViewedProfile] = useState(null);
  const [loadingViewedProfile, setLoadingViewedProfile] = useState(false);
  const [profileNotFound, setProfileNotFound] = useState(false);

  // Editable fields
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [persona, setPersona] = useState('');
  const [personaDetails, setPersonaDetails] = useState({});
  const [bio, setBio] = useState('');
  const [positionInIdeaLab, setPositionInIdeaLab] = useState('');
  const [role, setRole] = useState('');
  const [userRole, setUserRole] = useState('regular');

  useEffect(() => {
    if (!currentUser && !loadingAuth) {
      fetchUser();
    }
  }, [currentUser, loadingAuth, fetchUser]);

  useEffect(() => {
    const fetchProfileToView = async () => {
      if (profileId && profileId !== currentUser?.id) {
        setLoadingViewedProfile(true);
        setProfileNotFound(false);
        const { data, error } = await supabase.from('profiles').select('*').eq('id', profileId).maybeSingle();
        if (data) {
          setViewedProfile(data);
        } else {
          setError('Profile not found.');
          setProfileNotFound(true);
        }
        setLoadingViewedProfile(false);
      } else {
        setViewedProfile(null);
      }
    };
    fetchProfileToView();
  }, [profileId, currentUser?.id]);

  const activeProfile = viewedProfile || currentUserProfile;
  const isOwnProfile = !profileId || profileId === currentUser?.id;

  useEffect(() => {
    if (activeProfile) {
      setFullName(activeProfile.full_name || '');
      setMobileNumber(activeProfile.mobile_number || '');
      setInstitutionName(activeProfile.institution_name || '');
      setLinkedinUrl(activeProfile.linkedin_url || '');
      setPersona(activeProfile.persona || '');
      setPersonaDetails(activeProfile.persona_details || {});
      setBio(activeProfile.bio || '');
      setPositionInIdeaLab(activeProfile.position_in_idealab || '');
      setRole(activeProfile.role || '');
      setUserRole(activeProfile.user_role || 'regular');
    }
  }, [activeProfile]);

  const getInstitutionLabel = () => {
    switch (persona) {
      case 'school-student': return 'School Name';
      case 'college-student': return 'College Name';
      case 'faculty': return 'College/University Name';
      case 'industry-professional': return 'Company Name';
      case 'entrepreneur': return 'Startup/Company Name';
      default: return 'Institution';
    }
  };

  const updatePersonaDetail = (key, value) => {
    setPersonaDetails(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      if (!currentUser?.id) throw new Error('User not authenticated');

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: currentUser.id,
          email: currentUser.email,
          full_name: fullName,
          mobile_number: mobileNumber,
          institution_name: institutionName,
          linkedin_url: linkedinUrl,
          persona_details: personaDetails,
          bio: bio,
          position_in_idealab: positionInIdeaLab,
          role: role,
          user_role: userRole,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (updateError) throw updateError;

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Refresh user profile
      await fetchUser();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      console.error('Error updating profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingAuth || loadingViewedProfile) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading profile...</div>;
  }

  if (profileNotFound) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f5f7f9' }}>
        <TopHeader toggleSidebar={() => {}} />
        <main style={{ flex: 1, padding: '2rem', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <button 
              onClick={() => navigate(-1)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '8px' }}
              onMouseOver={e => e.currentTarget.style.background = '#e5e7eb'}
              onMouseOut={e => e.currentTarget.style.background = 'none'}
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Back
            </button>
          </div>
          <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', padding: '4rem 2rem', textAlign: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: '#9ca3af', marginBottom: '1rem' }}>person_off</span>
            <h2 style={{ color: '#111827', marginBottom: '0.5rem' }}>Profile Not Found</h2>
            <p style={{ color: '#6b7280' }}>This user has not set up their profile details yet.</p>
          </div>
        </main>
      </div>
    );
  }

  if (!activeProfile) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Profile not found or you must be logged in.</p>
        <button onClick={() => navigate('/login')} style={{ padding: '0.75rem 1.5rem', background: '#4F46E5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f5f7f9' }}>
      <TopHeader toggleSidebar={() => {}} />

      <main style={{ flex: 1, padding: '2rem', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={() => isEditing ? setIsEditing(false) : navigate(-1)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '8px' }}
              onMouseOver={e => e.currentTarget.style.background = '#e5e7eb'}
              onMouseOut={e => e.currentTarget.style.background = 'none'}
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Back
            </button>
            <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#111827', fontWeight: 'bold' }}>{isEditing ? 'Edit Profile' : (isOwnProfile ? 'Your Profile' : 'User Profile')}</h1>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', padding: '2rem' }}>
          {/* Header Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '2rem', marginBottom: '2rem' }}>
            <div style={{ height: '100px', width: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #4F46E5 0%, #7c3aed 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '3rem', overflow: 'hidden', boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)' }}>
              {activeProfile?.avatar_url ? <img src={activeProfile.avatar_url} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (fullName ? fullName.charAt(0).toUpperCase() : "U")}
            </div>
            <div>
              <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', color: '#111827' }}>{fullName || 'Anonymous User'}</h2>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>badge</span>
                {persona || 'Member'}
              </p>
              <p style={{ margin: '0', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', paddingRight: '1rem' }}>
                <span style={{ padding: '0.25rem 0.75rem', background: userRole === 'admin' ? '#fef3c7' : '#dbeafe', color: userRole === 'admin' ? '#92400e' : '#1e40af', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {userRole === 'admin' ? '⭐ Admin' : 'Regular'}
                </span>
              </p>
            </div>
          </div>

          {/* Messages */}
          {error && <div style={{ padding: '1rem', background: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}
          {success && <div style={{ padding: '1rem', background: '#dcfce7', border: '1px solid #bbf7d0', color: '#16a34a', borderRadius: '8px', marginBottom: '1rem' }}>{success}</div>}

          {!isEditing ? (
            // View Mode
            <>
              <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Basic Info */}
                <div>
                  <label style={{ display: 'block', color: '#6b7280', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Email Address</label>
                  <div style={{ padding: '0.75rem 1rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="material-symbols-outlined" style={{ color: '#9ca3af' }}>mail</span>
                    {activeProfile.email || 'Not provided'}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#6b7280', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Mobile Number</label>
                  <div style={{ padding: '0.75rem 1rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="material-symbols-outlined" style={{ color: '#9ca3af' }}>phone_iphone</span>
                    {mobileNumber || 'Not provided'}
                  </div>
                </div>

                {institutionName && (
                  <div>
                    <label style={{ display: 'block', color: '#6b7280', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>{getInstitutionLabel()}</label>
                    <div style={{ padding: '0.75rem 1rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className="material-symbols-outlined" style={{ color: '#9ca3af' }}>location_on</span>
                      {institutionName}
                    </div>
                  </div>
                )}

                {linkedinUrl && (
                  <div>
                    <label style={{ display: 'block', color: '#6b7280', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>LinkedIn Profile</label>
                    <div style={{ padding: '0.75rem 1rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <svg viewBox="0 0 24 24" style={{ width: '20px', height: '20px', color: '#0A66C2' }} fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.725-2.004 1.425-.103.25-.129.599-.129.949v5.431h-3.554s.05-8.786 0-9.714h3.554v1.375c.427-.659 1.191-1.597 2.897-1.597 2.117 0 3.704 1.384 3.704 4.362v5.574zM5.337 8.855c-1.144 0-1.915-.759-1.915-1.71 0-.955.77-1.71 1.952-1.71 1.181 0 1.915.75 1.933 1.71 0 .951-.752 1.71-1.97 1.71zm1.581 11.597h-3.154v-9.714h3.154v9.714zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#4F46E5', textDecoration: 'none', fontWeight: '500' }}>View LinkedIn Profile</a>
                    </div>
                  </div>
                )}

                {/* Persona Details Section */}
                {(persona === 'school-student' || persona === 'college-student' || persona === 'faculty' || persona === 'industry-professional' || persona === 'entrepreneur') && Object.keys(personaDetails).length > 0 && (
                  <div style={{ padding: '1.5rem', background: '#f3f4f6', border: '2px solid #e5e7eb', borderRadius: '12px', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', color: '#4F46E5' }}>info</span>
                      <h3 style={{ margin: 0, fontSize: '1.125rem', color: '#111827', fontWeight: '600' }}>Persona Details</h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      {persona === 'school-student' && personaDetails?.education_level && (
                        <div>
                          <label style={{ display: 'block', color: '#6b7280', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Education Level</label>
                          <p style={{ margin: 0, color: '#111827', fontSize: '0.95rem', fontWeight: '500' }}>
                            {personaDetails.education_level.charAt(0).toUpperCase() + personaDetails.education_level.slice(1)}
                          </p>
                        </div>
                      )}

                      {persona === 'college-student' && (
                        <>
                          {personaDetails?.year && (
                            <div>
                              <label style={{ display: 'block', color: '#6b7280', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Year of Study</label>
                              <p style={{ margin: 0, color: '#111827', fontSize: '0.95rem', fontWeight: '500' }}>{personaDetails.year}</p>
                            </div>
                          )}
                          {personaDetails?.department && (
                            <div>
                              <label style={{ display: 'block', color: '#6b7280', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Department</label>
                              <p style={{ margin: 0, color: '#111827', fontSize: '0.95rem', fontWeight: '500' }}>{personaDetails.department}</p>
                            </div>
                          )}
                        </>
                      )}

                      {persona === 'faculty' && (
                        <>
                          {personaDetails?.degree && (
                            <div>
                              <label style={{ display: 'block', color: '#6b7280', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Degree</label>
                              <p style={{ margin: 0, color: '#111827', fontSize: '0.95rem', fontWeight: '500' }}>{personaDetails.degree}</p>
                            </div>
                          )}
                          {personaDetails?.designation && (
                            <div>
                              <label style={{ display: 'block', color: '#6b7280', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Designation</label>
                              <p style={{ margin: 0, color: '#111827', fontSize: '0.95rem', fontWeight: '500' }}>{personaDetails.designation}</p>
                            </div>
                          )}
                          {personaDetails?.years_of_experience && (
                            <div>
                              <label style={{ display: 'block', color: '#6b7280', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Years of Experience</label>
                              <p style={{ margin: 0, color: '#111827', fontSize: '0.95rem', fontWeight: '500' }}>{personaDetails.years_of_experience} years</p>
                            </div>
                          )}
                        </>
                      )}

                      {persona === 'industry-professional' && (
                        <>
                          {personaDetails?.role && (
                            <div>
                              <label style={{ display: 'block', color: '#6b7280', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Job Role</label>
                              <p style={{ margin: 0, color: '#111827', fontSize: '0.95rem', fontWeight: '500' }}>{personaDetails.role}</p>
                            </div>
                          )}
                          {personaDetails?.years_of_experience && (
                            <div>
                              <label style={{ display: 'block', color: '#6b7280', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Years of Experience</label>
                              <p style={{ margin: 0, color: '#111827', fontSize: '0.95rem', fontWeight: '500' }}>{personaDetails.years_of_experience} years</p>
                            </div>
                          )}
                          {personaDetails?.specialization && (
                            <div style={{ gridColumn: '1 / -1' }}>
                              <label style={{ display: 'block', color: '#6b7280', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Specialization</label>
                              <p style={{ margin: 0, color: '#111827', fontSize: '0.95rem', fontWeight: '500' }}>{personaDetails.specialization}</p>
                            </div>
                          )}
                        </>
                      )}

                      {persona === 'entrepreneur' && (
                        <>
                          {personaDetails?.industry && (
                            <div>
                              <label style={{ display: 'block', color: '#6b7280', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Industry/Domain</label>
                              <p style={{ margin: 0, color: '#111827', fontSize: '0.95rem', fontWeight: '500' }}>{personaDetails.industry}</p>
                            </div>
                          )}
                          {personaDetails?.stage && (
                            <div>
                              <label style={{ display: 'block', color: '#6b7280', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Startup Stage</label>
                              <p style={{ margin: 0, color: '#111827', fontSize: '0.95rem', fontWeight: '500' }}>
                                {personaDetails.stage.charAt(0).toUpperCase() + personaDetails.stage.slice(1).replace('-', ' ')}
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional Info Section */}
                {(bio || positionInIdeaLab || role) && (
                  <div style={{ padding: '1.5rem', background: '#f0f9ff', border: '2px solid #bfdbfe', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', color: '#0369a1' }}>description</span>
                      <h3 style={{ margin: 0, fontSize: '1.125rem', color: '#111827', fontWeight: '600' }}>Additional Information</h3>
                    </div>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                      {bio && (
                        <div>
                          <label style={{ display: 'block', color: '#6b7280', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bio</label>
                          <p style={{ margin: 0, color: '#111827', fontSize: '0.95rem', lineHeight: '1.5' }}>{bio}</p>
                        </div>
                      )}
                      {positionInIdeaLab && (
                        <div>
                          <label style={{ display: 'block', color: '#6b7280', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Position in IdeaLab</label>
                          <p style={{ margin: 0, color: '#111827', fontSize: '0.95rem', fontWeight: '500' }}>{positionInIdeaLab}</p>
                        </div>
                      )}
                      {role && (
                        <div>
                          <label style={{ display: 'block', color: '#6b7280', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role</label>
                          <p style={{ margin: 0, color: '#111827', fontSize: '0.95rem', fontWeight: '500' }}>{role}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', color: '#6b7280', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Account Created</label>
                  <div style={{ padding: '0.75rem 1rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="material-symbols-outlined" style={{ color: '#9ca3af' }}>calendar_today</span>
                    {new Date(activeProfile.created_at || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                {isOwnProfile && (
                  <button onClick={() => setIsEditing(true)} style={{ padding: '0.75rem 1.5rem', background: '#4F46E5', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>edit</span>
                    Edit Profile
                  </button>
                )}
              </div>
            </>
          ) : (
            // Edit Mode
            <form onSubmit={handleSaveProfile}>
              <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '2rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#6b7280', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Full Name</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem', fontFamily: 'inherit' }} required />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#6b7280', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Mobile Number</label>
                  <input type="tel" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem', fontFamily: 'inherit' }} required />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#6b7280', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>{getInstitutionLabel()}</label>
                  <input type="text" value={institutionName} onChange={(e) => setInstitutionName(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem', fontFamily: 'inherit' }} />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#6b7280', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>LinkedIn Profile URL</label>
                  <input type="url" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/username" style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem', fontFamily: 'inherit' }} />
                </div>

                {currentUserProfile?.user_role === 'admin' && (
                  <div>
                    <label style={{ display: 'block', color: '#6b7280', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>User Role</label>
                    <select value={userRole} onChange={(e) => setUserRole(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem', fontFamily: 'inherit' }}>
                      <option value="regular">Regular User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                )}

                {/* Edit Persona-Specific Details */}
                {persona === 'school-student' && (
                  <div>
                    <label style={{ display: 'block', color: '#6b7280', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Education Level</label>
                    <select value={personaDetails.education_level || ''} onChange={(e) => updatePersonaDetail('education_level', e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem', fontFamily: 'inherit' }}>
                      <option value="">-- Choose level --</option>
                      <option value="elementary">Elementary School</option>
                      <option value="middle">Middle School</option>
                      <option value="higher">High School</option>
                      <option value="higher-sec">Higher Secondary</option>
                    </select>
                  </div>
                )}

                {persona === 'college-student' && (
                  <>
                    <div>
                      <label style={{ display: 'block', color: '#6b7280', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Year of Study</label>
                      <select value={personaDetails.year || ''} onChange={(e) => updatePersonaDetail('year', e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem', fontFamily: 'inherit' }}>
                        <option value="">-- Choose year --</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#6b7280', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Department</label>
                      <input type="text" value={personaDetails.department || ''} onChange={(e) => updatePersonaDetail('department', e.target.value)} placeholder="e.g., Computer Science" style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem', fontFamily: 'inherit' }} />
                    </div>
                  </>
                )}

                {persona === 'faculty' && (
                  <>
                    <div>
                      <label style={{ display: 'block', color: '#6b7280', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Degree</label>
                      <input type="text" value={personaDetails.degree || ''} onChange={(e) => updatePersonaDetail('degree', e.target.value)} placeholder="e.g., BTech, MTech, PhD" style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem', fontFamily: 'inherit' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#6b7280', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Designation</label>
                      <input type="text" value={personaDetails.designation || ''} onChange={(e) => updatePersonaDetail('designation', e.target.value)} placeholder="e.g., Assistant Professor" style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem', fontFamily: 'inherit' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#6b7280', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Years of Experience</label>
                      <input type="number" value={personaDetails.years_of_experience || ''} onChange={(e) => updatePersonaDetail('years_of_experience', e.target.value)} placeholder="e.g., 5" style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem', fontFamily: 'inherit' }} />
                    </div>
                  </>
                )}

                {persona === 'industry-professional' && (
                  <>
                    <div>
                      <label style={{ display: 'block', color: '#6b7280', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Job Role</label>
                      <input type="text" value={personaDetails.role || ''} onChange={(e) => updatePersonaDetail('role', e.target.value)} placeholder="e.g., Software Engineer" style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem', fontFamily: 'inherit' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#6b7280', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Years of Experience</label>
                      <input type="number" value={personaDetails.years_of_experience || ''} onChange={(e) => updatePersonaDetail('years_of_experience', e.target.value)} placeholder="e.g., 7" style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem', fontFamily: 'inherit' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#6b7280', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Specialization</label>
                      <input type="text" value={personaDetails.specialization || ''} onChange={(e) => updatePersonaDetail('specialization', e.target.value)} placeholder="e.g., Full Stack Development" style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem', fontFamily: 'inherit' }} />
                    </div>
                  </>
                )}

                {persona === 'entrepreneur' && (
                  <>
                    <div>
                      <label style={{ display: 'block', color: '#6b7280', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Industry/Domain</label>
                      <input type="text" value={personaDetails.industry || ''} onChange={(e) => updatePersonaDetail('industry', e.target.value)} placeholder="e.g., SaaS, FinTech" style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem', fontFamily: 'inherit' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#6b7280', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Startup Stage</label>
                      <select value={personaDetails.stage || ''} onChange={(e) => updatePersonaDetail('stage', e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem', fontFamily: 'inherit' }}>
                        <option value="">-- Choose stage --</option>
                        <option value="idea">Idea Stage</option>
                        <option value="mvp">MVP</option>
                        <option value="seed">Seed Funded</option>
                        <option value="series-a">Series A</option>
                        <option value="series-b">Series B+</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Additional Info Section */}
                <div style={{ gridColumn: '1 / -1', paddingTop: '1rem', borderTop: '2px solid #e5e7eb' }}>
                  <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#111827', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: '#0369a1' }}>description</span>
                    Additional Information
                  </h3>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', color: '#6b7280', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Bio</label>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Write a brief bio about yourself..." style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem', fontFamily: 'inherit', minHeight: '100px', resize: 'vertical' }} />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#6b7280', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Position in IdeaLab</label>
                  <input type="text" value={positionInIdeaLab} onChange={(e) => setPositionInIdeaLab(e.target.value)} placeholder="e.g., Member, Moderator, Contributor" style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem', fontFamily: 'inherit' }} />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#6b7280', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Role</label>
                  <input type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g., Innovator, Mentor, Advisor" style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem', fontFamily: 'inherit' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setIsEditing(false)} style={{ padding: '0.75rem 1.5rem', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} style={{ padding: '0.75rem 1.5rem', background: '#4F46E5', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.6 : 1 }}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
