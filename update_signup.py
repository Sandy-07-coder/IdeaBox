with open('src/components/SignUp.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_ui = r'''  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col font-body">
      <main className="flex-grow flex flex-col items-center justify-center px-6 py-12">
        {/* Branding Header */}
        <header className="text-center mb-10">
          <h1 className="font-display font-black text-5xl tracking-tighter text-on-surface mb-3">IDEA - BOX</h1>
          <p className="font-body text-on-surface-variant text-lg">Start your journey in the Idea Lab</p>
        </header>

        {/* Main Registration Card */}
        <section className="w-full max-w-4xl bg-surface-container-lowest rounded-xl p-8 md:p-12 shadow-[0_20px_50px_rgba(74,64,224,0.05)] border border-outline-variant/10">
          {step === 1 && (
            <>
              {/* Stepper Header */}
              <div className="mb-10">
                <span className="text-primary font-bold text-sm tracking-widest uppercase">Step 1: Security & Credentials</span>
              </div>
              
              <form onSubmit={handleStep1Submit} className="space-y-8">
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="block font-medium text-sm text-on-surface-variant ml-1" htmlFor="email">Email Address</label>
                  <div className="relative rounded-xl bg-surface-container-low transition-all focus-within:ring-2 focus-within:ring-primary/40">
                    <input 
                      className="w-full bg-transparent border-none focus:ring-0 px-5 py-4 text-on-surface placeholder:text-outline-variant" 
                      id="email" 
                      name="email" 
                      placeholder="name@example.com" 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                {/* Password Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Password */}
                  <div className="space-y-2">
                    <label className="block font-medium text-sm text-on-surface-variant ml-1" htmlFor="password">Password</label>
                    <div className="relative rounded-xl bg-surface-container-low transition-all flex items-center focus-within:ring-2 focus-within:ring-primary/40">
                      <input 
                        className="w-full bg-transparent border-none focus:ring-0 px-5 py-4 text-on-surface placeholder:text-outline-variant" 
                        id="password" 
                        name="password" 
                        placeholder="••••••••" 
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                      />
                      <button 
                        className="px-4 text-outline-variant hover:text-primary transition-colors" 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <span className="material-symbols-outlined">{showPassword ? 'visibility' : 'visibility_off'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label className="block font-medium text-sm text-on-surface-variant ml-1" htmlFor="confirm-password">Confirm Password</label>
                    <div className="relative rounded-xl bg-surface-container-low transition-all flex items-center focus-within:ring-2 focus-within:ring-primary/40">
                      <input 
                        className="w-full bg-transparent border-none focus:ring-0 px-5 py-4 text-on-surface placeholder:text-outline-variant" 
                        id="confirm-password" 
                        name="confirm-password" 
                        placeholder="••••••••" 
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required 
                      />
                      <button 
                        className="px-4 text-outline-variant hover:text-primary transition-colors" 
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <span className="material-symbols-outlined">{showConfirmPassword ? 'visibility' : 'visibility_off'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {error && <p className="text-error font-medium text-sm text-center bg-error-container/10 p-3 rounded-lg border border-error/20">{error}</p>}

                {/* Action Row */}
                <div className="pt-6 flex flex-col md:flex-row items-center gap-6 justify-center">
                  <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full">
                    <button 
                      className="w-full md:w-auto px-8 py-4 text-on-primary font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95 text-center disabled:opacity-70" 
                      style={{ background: "linear-gradient(135deg, #4a40e0 0%, #9795ff 100%)" }}
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'Continue to Verification'}
                    </button>

                    <div className="flex items-center gap-4 text-outline-variant font-medium text-xs tracking-widest">
                      <div className="w-8 h-px bg-outline-variant/20"></div>
                      <span>OR</span>
                      <div className="w-8 h-px bg-outline-variant/20"></div>
                    </div>

                    <div className="w-full md:w-auto flex flex-col items-center gap-4">
                      <button 
                        className="w-full md:min-w-[280px] flex items-center justify-center gap-3 px-6 py-4 border border-outline-variant/20 rounded-xl hover:bg-surface-container transition-colors text-on-surface font-medium" 
                        type="button"
                        onClick={handleGoogleOAuth}
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                          <path d="M5.84 14.09c-.22-.66-.35-1.43-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                        </svg>
                        <span className="whitespace-nowrap">Continue with Google</span>
                      </button>
                      <p className="text-sm text-on-surface-variant">
                        Already have an account? <button type="button" onClick={() => navigate('/login')} className="text-primary font-bold hover:underline">Sign in</button>
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            </>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6 text-center py-10">
              <span className="material-symbols-outlined text-[4rem] text-primary mb-4">mark_email_unread</span>
              <h2 className="text-2xl font-bold mb-2">Enter Verification Code</h2>
              <p className="text-on-surface-variant mb-6 leading-relaxed">
                We've sent a 6-digit code to <strong className="text-on-surface">{email}</strong>. <br/>
                Please enter it below to verify your account.
              </p>
              <div className="max-w-[300px] mx-auto mb-6 relative rounded-xl bg-surface-container-low transition-all focus-within:ring-2 focus-within:ring-primary/40">
                <input
                  type="text"
                  className="w-full bg-transparent border-none focus:ring-0 py-4 text-center text-3xl font-bold tracking-[0.5em] text-on-surface placeholder:text-outline-variant"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>
              {error && <p className="text-error font-medium text-sm text-center bg-error-container/10 p-3 rounded-lg border border-error/20 mb-4">{error}</p>}
              <button 
                type="submit" 
                className="px-8 py-4 text-on-primary font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95 disabled:opacity-70"
                style={{ background: "linear-gradient(135deg, #4a40e0 0%, #9795ff 100%)" }}
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="signup-card" style={{ maxWidth: '100%', boxShadow: 'none', padding: '0', background: 'transparent' }}>
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
                      <div className="signup-persona-card text-left">
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

              <div className="signup-footer text-left">
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
                  {error && <p className="text-error font-medium text-sm text-left bg-error-container/10 p-3 rounded-lg border border-error/20 my-4">{error}</p>}
                  <button type="submit" className="w-full md:w-auto px-8 py-4 text-on-primary font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95 text-center disabled:opacity-70" style={{ background: "linear-gradient(135deg, #4a40e0 0%, #9795ff 100%)" }} disabled={loading}>
                    {loading ? 'Creating Profile...' : 'Complete Sign Up'}
                  </button>
                  <p className="signup-signin-text">
                    <button type="button" className="signup-link bg-transparent border-0" onClick={() => setStep(1)}>Back to Step 1</button>
                  </p>
                </div>
              </div>
            </form>
            </div>
          )}

        </section>

        {/* Contextual Decorative Elements (Digital Greenhouse feel) */}
        {step === 1 && (
          <div className="mt-16 w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-container-low/40 rounded-xl p-6 flex items-start gap-4 transition-all hover:bg-surface-container-low/60">
              <span className="material-symbols-outlined text-primary text-3xl">rocket_launch</span>
              <div className="text-left">
                <h4 className="font-bold text-sm text-on-surface mb-1">Launch Ready</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">Your ideas deserve the best start. Join founders today.</p>
              </div>
            </div>
            <div className="bg-surface-container-low/40 rounded-xl p-6 flex items-start gap-4 transition-all hover:bg-surface-container-low/60">
              <span className="material-symbols-outlined text-tertiary text-3xl">shield_person</span>
              <div className="text-left">
                <h4 className="font-bold text-sm text-on-surface mb-1">Secure by Design</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">Enterprise-grade encryption keeps your intellectual property safe.</p>
              </div>
            </div>
            <div className="bg-surface-container-low/40 rounded-xl p-6 flex items-start gap-4 transition-all hover:bg-surface-container-low/60">
              <span className="material-symbols-outlined text-secondary text-3xl">groups</span>
              <div className="text-left">
                <h4 className="font-bold text-sm text-on-surface mb-1">Expert Network</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">Get paired with mentors as soon as you finish your profile.</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low dark:bg-surface-dim w-full py-12 px-6 flex flex-col md:flex-row justify-between items-center gap-6 mt-auto">
        <div className="flex flex-col gap-2 text-left md:text-left">
          <div className="font-headline font-bold text-on-surface text-xl">Idea-Box</div>
          <p className="font-body text-label-md text-on-surface-variant max-w-xs md:max-w-md">
            <span>© 2026 Idea-Box.</span><br/>
            <span>Cultivating the next generation of founders.</span>
          </p>
        </div>
        <nav className="flex flex-wrap justify-center md:justify-end gap-x-8 gap-y-4">
          <a className="text-on-surface-variant font-medium hover:text-on-surface transition-colors cursor-pointer text-sm" href="#">Privacy Policy</a>
          <a className="text-on-surface-variant font-medium hover:text-on-surface transition-colors cursor-pointer text-sm" href="#">Terms of Service</a>
          <a className="text-on-surface-variant font-medium hover:text-on-surface transition-colors cursor-pointer text-sm" href="#">Incubator Rules</a>
          <a className="text-on-surface-variant font-medium hover:text-on-surface transition-colors cursor-pointer text-sm" href="#">Contact Support</a>
        </nav>
      </footer>
    </div>
  );
}
'''

lines[243:746] = [new_ui + '\n']

with open('src/components/SignUp.jsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
