import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import '../design/signup.css';

export default function SignUp() {
  const navigate = useNavigate();
  
  // Steps tracking
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState(null);
  const [otp, setOtp] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    // Check if a user with a session already has a completed profile
    const checkExistingProfile = async (user) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        // Profile already exists — skip signup entirely
        navigate('/dashboard');
        return true;
      }
      return false;
    };

    // Check if a session already exists
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const alreadyDone = await checkExistingProfile(session.user);
        if (alreadyDone) return;

        // No profile yet — let them fill out Step 3
        if (session.user?.email) setEmail(session.user.email);
        if (session.user?.user_metadata?.full_name) setFullName(session.user.user_metadata.full_name);
        if (session.user?.user_metadata?.avatar_url) setAvatarUrl(session.user.user_metadata.avatar_url);
        setStep(3);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const alreadyDone = await checkExistingProfile(session.user);
          if (alreadyDone) return;

          // No profile yet — let them fill out Step 3
          if (session.user?.email) setEmail(session.user.email);
          if (session.user?.user_metadata?.full_name) setFullName(session.user.user_metadata.full_name);
          if (session.user?.user_metadata?.avatar_url) setAvatarUrl(session.user.user_metadata.avatar_url);
          setStep(3);
        }
      }
    );

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [navigate]);

  // Step 1: Security
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 3: Profile info
  const [persona, setPersona] = useState('school-student');
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Persona-specific details
  const [personaDetails, setPersonaDetails] = useState({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getInstitutionLabel = () => {
    switch (persona) {
      case 'school-student': return 'School Name';
      case 'college-student': return 'College Name';
      case 'faculty': return 'College/University Name';
      case 'industry-professional': return 'Company Name';
      case 'entrepreneur': return 'Company Name';
      case 'others': return 'Organization Name';
      default: return 'Institution/Organization Name';
    }
  };

  const handlePersonaChange = (newPersona) => {
    setPersona(newPersona);
    setPersonaDetails({});
  };

  const updatePersonaDetail = (key, value) => {
    setPersonaDetails(prev => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file.name);
    }
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);

    // Call Supabase to create the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (authData?.user) {
      setUserId(authData.user.id);
      setStep(2); // Proceed to Verification Step
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: otpError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'signup'
    });

    if (otpError) {
      setError(otpError.message);
      setLoading(false);
      return;
    }

    if (data?.session) {
      if (data.user) setUserId(data.user.id);
      setStep(3);
    }
    
    setLoading(false);
  };

  const handleGoogleOAuth = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/signup`
      }
    });

    if (error) {
      setError(error.message);
    }
  };

  const handleStep3Submit = async (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      setError("Please agree to the Terms of Service.");
      return;
    }

    setLoading(true);
    setError(null);

    const activeUserId = userId || (await supabase.auth.getUser()).data?.user?.id;

    if (!activeUserId) {
      setError("User session is not active. Please start the sign-up process again.");
      setLoading(false);
      return;
    }

    if (activeUserId) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([
          {
            id: activeUserId,
            email,
            full_name: fullName,
            mobile_number: mobileNumber,
            persona,
            institution_name: institutionName,
            linkedin_url: linkedinUrl,
            avatar_url: avatarUrl,
            persona_details: personaDetails,
            terms_agreed: agreeTerms
          }
        ]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        setError(profileError.message);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    navigate('/dashboard');
  };

  const personaOptions = [
    { id: 'school-student', label: 'School Student', icon: 'school' },
    { id: 'college-student', label: 'College Student', icon: 'history_edu' },
    { id: 'faculty', label: 'Faculty', icon: 'work' },
    { id: 'industry-professional', label: 'Industry Professional', icon: 'business_center' },
    { id: 'entrepreneur', label: 'Entrepreneur', icon: 'rocket_launch' },
    { id: 'others', label: 'Others', icon: 'person' },
  ];

  return (
    <div className="signup-page">
      <main className="signup-main">
        <div className="signup-container">
          <div className="signup-header">
            <h1 className="signup-title">IDEA - BOX</h1>
            <p className="signup-subtitle">Start your journey in the Idea Lab</p>
          </div>

          <div className="signup-card">
            {step === 1 && (
              <form onSubmit={handleStep1Submit} className="signup-form">
                <section className="signup-section">
                  <div className="signup-section-header">
                    <h2 className="signup-section-title">Step 1: Security & Credentials</h2>
                  </div>
                  <div className="signup-form-grid">
                    <div className="signup-form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="signup-label" htmlFor="email">Email Address</label>
                      <input
                        id="email"
                        className="signup-input"
                        placeholder="john@university.edu"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="signup-form-group">
                      <label className="signup-label" htmlFor="password">Password</label>
                      <div className="signup-password-wrapper">
                        <input
                          id="password"
                          className="signup-input"
                          placeholder="••••••••"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button
                          className="signup-password-toggle"
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <span className="material-symbols-outlined">
                            {showPassword ? 'visibility' : 'visibility_off'}
                          </span>
                        </button>
                      </div>
                    </div>
                    <div className="signup-form-group">
                      <label className="signup-label" htmlFor="confirm-password">Confirm Password</label>
                      <div className="signup-password-wrapper">
                        <input
                          id="confirm-password"
                          className="signup-input"
                          placeholder="••••••••"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                        <button
                          className="signup-password-toggle"
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          <span className="material-symbols-outlined">
                            {showConfirmPassword ? 'visibility' : 'visibility_off'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="signup-footer">
                  <div className="signup-action-group">
                    {error && <p className="signup-error-text" style={{ color: 'red', marginTop: '0.5rem', marginBottom: '1rem' }}>{error}</p>}
                    <button type="submit" className="signup-submit-btn" disabled={loading}>
                      {loading ? 'Processing...' : 'Continue to Verification'}
                    </button>
                    
                    <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0', color: '#6b7280' }}>
                      <hr style={{ flex: 1, borderTop: '1px solid #e5e7eb' }} />
                      <span style={{ margin: '0 1rem', fontSize: '0.875rem' }}>OR</span>
                      <hr style={{ flex: 1, borderTop: '1px solid #e5e7eb' }} />
                    </div>

                    <button 
                      type="button" 
                      onClick={handleGoogleOAuth}
                      style={{ width: '100%', padding: '0.75rem', background: '#fff', border: '1px solid #dadce0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: '500', color: '#3c4043', fontSize: '14px', fontFamily: '"Google Sans", Roboto, Arial, sans-serif', boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3)', transition: 'background-color 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                      onMouseOut={e => e.currentTarget.style.backgroundColor = '#fff'}
                    >
                      <svg viewBox="0 0 24 24" style={{width: '20px', height: '20px'}}>
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                      </svg>
                      Continue with Google
                    </button>

                    <p className="signup-signin-text" style={{ marginTop: '1.5rem' }}>
                      Already have an account?{' '}
                      <a href="#" className="signup-link" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Sign In</a>
                    </p>
                  </div>
                </div>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="signup-form" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: '#4F46E5', marginBottom: '1rem' }}>mark_email_unread</span>
                <h2 className="signup-section-title" style={{ marginBottom: '1rem' }}>Enter Verification Code</h2>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                  We've sent a 6-digit code to <strong>{email}</strong>. <br/>
                  Please enter it below to verify your account.
                </p>
                <div style={{ maxWidth: '300px', margin: '0 auto 2rem auto' }}>
                  <input
                    type="text"
                    className="signup-input"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    required
                    style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5em', fontWeight: 'bold' }}
                  />
                </div>
                <div className="signup-action-group">
                  {error && <p className="signup-error-text" style={{ color: 'red', marginTop: '0.5rem', marginBottom: '1rem' }}>{error}</p>}
                  <button type="submit" className="signup-submit-btn" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleStep3Submit} className="signup-form">
                <section className="signup-section">
                  <h2 className="signup-section-title">Step 3: Tell us about yourself...</h2>
                  <div className="signup-persona-grid">
                    {personaOptions.map((option) => (
                      <label key={option.id} className="signup-persona-label">
                        <input
                          type="radio"
                          name="persona"
                          value={option.id}
                          checked={persona === option.id}
                          onChange={(e) => handlePersonaChange(e.target.value)}
                          className="signup-persona-input"
                        />
                        <div className="signup-persona-card">
                          <span className="material-symbols-outlined signup-persona-icon">{option.icon}</span>
                          <span className="signup-persona-label-text">{option.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </section>

                {/* Persona-specific fields */}
                {persona === 'school-student' && (
                  <section className="signup-section">
                    <h2 className="signup-section-title">Education Details</h2>
                    <div className="signup-form-grid">
                      <div className="signup-form-group">
                        <label className="signup-label">School Name</label>
                        <input
                          type="text"
                          className="signup-input"
                          placeholder="e.g., ABC School, XYZ High School"
                          value={institutionName}
                          onChange={(e) => setInstitutionName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="signup-form-group">
                        <label className="signup-label">Education Level</label>
                        <select 
                          className="signup-input"
                          value={personaDetails.education_level || ''}
                          onChange={(e) => updatePersonaDetail('education_level', e.target.value)}
                          required
                          style={{ appearance: 'auto' }}
                        >
                          <option value="">-- Choose level --</option>
                          <option value="elementary">Elementary School</option>
                          <option value="middle">Middle School</option>
                          <option value="higher">High School</option>
                          <option value="higher-sec">Higher Secondary</option>
                        </select>
                      </div>
                    </div>
                  </section>
                )}

                {persona === 'college-student' && (
                  <section className="signup-section">
                    <h2 className="signup-section-title">College Details</h2>
                    <div className="signup-form-grid">
                      <div className="signup-form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="signup-label">College Name</label>
                        <input
                          type="text"
                          className="signup-input"
                          placeholder="e.g., MIT, Stanford University"
                          value={institutionName}
                          onChange={(e) => setInstitutionName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="signup-form-group">
                        <label className="signup-label">Year of Study</label>
                        <select 
                          className="signup-input"
                          value={personaDetails.year || ''}
                          onChange={(e) => updatePersonaDetail('year', e.target.value)}
                          required
                          style={{ appearance: 'auto' }}
                        >
                          <option value="">-- Choose year --</option>
                          <option value="1">1st Year</option>
                          <option value="2">2nd Year</option>
                          <option value="3">3rd Year</option>
                          <option value="4">4th Year</option>
                        </select>
                      </div>
                      <div className="signup-form-group">
                        <label className="signup-label">Department</label>
                        <input
                          type="text"
                          className="signup-input"
                          placeholder="e.g., Computer Science, Electronics"
                          value={personaDetails.department || ''}
                          onChange={(e) => updatePersonaDetail('department', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </section>
                )}

                {persona === 'faculty' && (
                  <section className="signup-section">
                    <h2 className="signup-section-title">Faculty Details</h2>
                    <div className="signup-form-grid">
                      <div className="signup-form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="signup-label">College/University Name</label>
                        <input
                          type="text"
                          className="signup-input"
                          placeholder="e.g., MIT, Stanford University"
                          value={institutionName}
                          onChange={(e) => setInstitutionName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="signup-form-group">
                        <label className="signup-label">Degree</label>
                        <input
                          type="text"
                          className="signup-input"
                          placeholder="e.g., BTech, MTech, PhD"
                          value={personaDetails.degree || ''}
                          onChange={(e) => updatePersonaDetail('degree', e.target.value)}
                          required
                        />
                      </div>
                      <div className="signup-form-group">
                        <label className="signup-label">Designation</label>
                        <input
                          type="text"
                          className="signup-input"
                          placeholder="e.g., Assistant Professor, Associate Professor"
                          value={personaDetails.designation || ''}
                          onChange={(e) => updatePersonaDetail('designation', e.target.value)}
                          required
                        />
                      </div>
                      <div className="signup-form-group">
                        <label className="signup-label">Years of Experience</label>
                        <input
                          type="number"
                          className="signup-input"
                          placeholder="e.g., 5"
                          value={personaDetails.years_of_experience || ''}
                          onChange={(e) => updatePersonaDetail('years_of_experience', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </section>
                )}

                {persona === 'industry-professional' && (
                  <section className="signup-section">
                    <h2 className="signup-section-title">Professional Details</h2>
                    <div className="signup-form-grid">
                      <div className="signup-form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="signup-label">Company Name</label>
                        <input
                          type="text"
                          className="signup-input"
                          placeholder="e.g., Google, Microsoft, Startup Inc"
                          value={institutionName}
                          onChange={(e) => setInstitutionName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="signup-form-group">
                        <label className="signup-label">Job Role</label>
                        <input
                          type="text"
                          className="signup-input"
                          placeholder="e.g., Software Engineer, Product Manager"
                          value={personaDetails.role || ''}
                          onChange={(e) => updatePersonaDetail('role', e.target.value)}
                          required
                        />
                      </div>
                      <div className="signup-form-group">
                        <label className="signup-label">Years of Experience</label>
                        <input
                          type="number"
                          className="signup-input"
                          placeholder="e.g., 7"
                          value={personaDetails.years_of_experience || ''}
                          onChange={(e) => updatePersonaDetail('years_of_experience', e.target.value)}
                          required
                        />
                      </div>
                      <div className="signup-form-group">
                        <label className="signup-label">Specialization</label>
                        <input
                          type="text"
                          className="signup-input"
                          placeholder="e.g., Full Stack Development, Cloud Architecture"
                          value={personaDetails.specialization || ''}
                          onChange={(e) => updatePersonaDetail('specialization', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </section>
                )}

                {persona === 'entrepreneur' && (
                  <section className="signup-section">
                    <h2 className="signup-section-title">Startup Details</h2>
                    <div className="signup-form-grid">
                      <div className="signup-form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="signup-label">Startup/Company Name</label>
                        <input
                          type="text"
                          className="signup-input"
                          placeholder="e.g., TechStartup Inc"
                          value={institutionName}
                          onChange={(e) => setInstitutionName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="signup-form-group">
                        <label className="signup-label">Industry/Domain</label>
                        <input
                          type="text"
                          className="signup-input"
                          placeholder="e.g., SaaS, FinTech, HealthTech"
                          value={personaDetails.industry || ''}
                          onChange={(e) => updatePersonaDetail('industry', e.target.value)}
                          required
                        />
                      </div>
                      <div className="signup-form-group">
                        <label className="signup-label">Startup Stage</label>
                        <select 
                          className="signup-input"
                          value={personaDetails.stage || ''}
                          onChange={(e) => updatePersonaDetail('stage', e.target.value)}
                          required
                          style={{ appearance: 'auto' }}
                        >
                          <option value="">-- Choose stage --</option>
                          <option value="idea">Idea Stage</option>
                          <option value="mvp">MVP</option>
                          <option value="seed">Seed Funded</option>
                          <option value="series-a">Series A</option>
                          <option value="series-b">Series B+</option>
                        </select>
                      </div>
                    </div>
                  </section>
                )}

                <section className="signup-section">
                  <div className="signup-section-header">
                    <h2 className="signup-section-title">Personal Information</h2>
                  </div>
                  <div className="signup-form-grid">
                    <div className="signup-form-group">
                      <label className="signup-label" htmlFor="fullname">Full Name</label>
                      <input
                        id="fullname"
                        className="signup-input"
                        placeholder="John Doe"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="signup-form-group">
                      <label className="signup-label" htmlFor="mobile">Mobile Number</label>
                      <input
                        id="mobile"
                        className="signup-input"
                        placeholder="+1 (555) 000-0000"
                        type="tel"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        required
                      />
                    </div>
                    <div className="signup-form-group">
                      <label className="signup-label" htmlFor="linkedin">LinkedIn Profile URL</label>
                      <input
                        id="linkedin"
                        className="signup-input"
                        placeholder="https://linkedin.com/in/username"
                        type="url"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                      />
                    </div>
                  </div>
                </section>

                <section className="signup-section">
                  <h2 className="signup-section-title">Verification</h2>
                  <div className="signup-upload-wrapper">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="signup-file-input"
                    />
                    <div className="signup-upload-box">
                      <div className="signup-upload-icon-container">
                        <span className="material-symbols-outlined signup-upload-icon">upload_file</span>
                      </div>
                      <h3 className="signup-upload-title">Upload Official Identification</h3>
                      <p className="signup-upload-text">Drag and drop or click to browse (PDF, PNG, JPG)</p>
                      {uploadedFile && (
                        <p className="signup-upload-filename">Uploaded: {uploadedFile}</p>
                      )}
                    </div>
                  </div>
                </section>

                <div className="signup-footer">
                  <label className="signup-terms-label">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="signup-checkbox"
                      required
                    />
                    <span className="signup-terms-text">
                      I agree to the <a href="#" className="signup-link">Terms of Service</a> and <a href="#" className="signup-link">Privacy Policy</a>.
                    </span>
                  </label>
                  <div className="signup-action-group">
                    {error && <p className="signup-error-text" style={{ color: 'red', marginTop: '0.5rem', marginBottom: '1rem' }}>{error}</p>}
                    <button type="submit" className="signup-submit-btn" disabled={loading}>
                      {loading ? 'Creating Profile...' : 'Complete Sign Up'}
                    </button>
                    <p className="signup-signin-text">
                      <a href="#" className="signup-link" onClick={() => setStep(1)}>Back to Step 1</a>
                    </p>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <footer className="signup-footer-text">
        © 2026 Idea-Box. Powered by Idea Lab.
      </footer>
    </div>
  );
}
