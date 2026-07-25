with open('src/components/SignUp.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_ui = r'''  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col font-body">
      <main className="flex-grow flex items-start justify-center px-6 pt-8 md:pt-16 pb-12 w-full">
        <div className="w-full max-w-5xl">
          {/* Branding Header */}
          <div className="flex flex-col items-center mb-10">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-3">IDEA - BOX</h1>
            <p className="text-on-surface-variant text-center max-w-md">Start your journey in the Idea Lab</p>
          </div>

          <div className="bg-surface-container-lowest rounded-[2rem] p-8 md:p-16 shadow-[0_20px_50px_rgba(74,64,224,0.05)] w-full relative">
            {step === 1 && (
              <>
                <div className="mb-10 text-center md:text-left">
                  <span className="text-primary font-bold text-sm tracking-widest uppercase">Step 1: Security & Credentials</span>
                </div>
                
                <form onSubmit={handleStep1Submit} className="space-y-8">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="block font-medium text-sm text-on-surface-variant ml-1" htmlFor="email">Email Address</label>
                    <div className="relative rounded-xl bg-surface-container-low transition-all focus-within:ring-2 focus-within:ring-primary/40">
                      <input 
                        className="w-full h-14 bg-transparent border-none focus:ring-0 px-6 text-on-surface placeholder:text-outline-variant" 
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
                          className="w-full h-14 bg-transparent border-none focus:ring-0 px-6 text-on-surface placeholder:text-outline-variant" 
                          id="password" 
                          name="password" 
                          placeholder="••••••••" 
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required 
                        />
                        <button 
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant hover:text-primary transition-colors" 
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
                          className="w-full h-14 bg-transparent border-none focus:ring-0 px-6 text-on-surface placeholder:text-outline-variant" 
                          id="confirm-password" 
                          name="confirm-password" 
                          placeholder="••••••••" 
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required 
                        />
                        <button 
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant hover:text-primary transition-colors" 
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          <span className="material-symbols-outlined">{showConfirmPassword ? 'visibility' : 'visibility_off'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {error && <p className="text-error font-medium text-sm text-center bg-error-container/10 p-3 rounded-lg border border-error/20">{error}</p>}

                  <div className="pt-6 flex flex-col md:flex-row md:items-center gap-6">
                    <button 
                      className="flex-grow md:flex-none md:w-64 h-16 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-xl font-bold text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-70"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'Continue'}
                    </button>
                    <p className="text-on-surface-variant text-sm">
                      Already have an account? <button type="button" onClick={() => navigate('/login')} className="text-primary font-bold hover:underline">Sign In</button>
                    </p>
                  </div>
                </form>

                {/* Contextual Decorative Elements (Digital Greenhouse feel) */}
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
                      <p className="text-xs text-on-surface-variant leading-relaxed">Enterprise-grade encryption keeps your IP safe.</p>
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
              </>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-6 text-center py-10">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-primary-container/20 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-[3rem] text-primary">mark_email_unread</span>
                  </div>
                </div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-2">Step 2: Verification</h2>
                <p className="text-on-surface-variant mb-6 text-sm">
                  We've sent a 6-digit code to <strong className="text-on-surface">{email}</strong>.<br/>Please enter it below to verify your account.
                </p>
                <div className="max-w-[300px] mx-auto mb-6 relative rounded-xl bg-surface-container-low transition-all focus-within:ring-2 focus-within:ring-primary/40">
                  <input
                    type="text"
                    className="w-full bg-transparent border-none focus:ring-0 h-16 text-center text-3xl font-bold tracking-[0.5em] text-on-surface placeholder:text-outline-variant"
                    placeholder="••••••"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    required
                  />
                </div>
                {error && <p className="text-error font-medium text-sm text-center bg-error-container/10 p-3 rounded-lg border border-error/20 mb-4">{error}</p>}
                
                <div className="flex justify-center">
                  <button 
                    type="submit" 
                    className="md:w-64 w-full h-16 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-xl font-bold text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-70"
                    disabled={loading}
                  >
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleStep3Submit} className="space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                   <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-2 max-w-full">Step 3: Complete Profile</h2>
                   <p className="text-on-surface-variant text-xs text-left mb-6">Customize your experience</p>
                </div>

                {/* Persona Selection */}
                <section>
                  <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-6">I am a...</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
                    {personaOptions.map((option) => (
                      <label key={option.id} className="group cursor-pointer">
                        <input
                          type="radio"
                          name="persona"
                          value={option.id}
                          checked={persona === option.id}
                          onChange={(e) => handlePersonaChange(e.target.value)}
                          className="sr-only peer"
                        />
                        <div className="p-4 md:p-6 rounded-xl border-2 border-transparent bg-surface-container-low peer-checked:bg-primary-container/20 peer-checked:border-primary transition-all duration-300 flex flex-col items-center text-center h-full">
                          <span className="material-symbols-outlined text-3xl mb-3 text-primary">{option.icon}</span>
                          <span className="font-bold text-sm md:text-base text-on-surface">{option.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </section>

                {/* Identity Details */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  <div className="col-span-1 md:col-span-2 border-t border-outline-variant/10 pt-8">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-2">Personal Information</h2>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-on-surface-variant ml-1">Full Name</label>
                    <input 
                      type="text"
                      className="w-full h-14 px-6 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-primary/40 transition-all text-on-surface placeholder:text-outline-variant"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-on-surface-variant ml-1">Mobile Number</label>
                    <input 
                      type="tel"
                      className="w-full h-14 px-6 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-primary/40 transition-all text-on-surface placeholder:text-outline-variant"
                      placeholder="+1 (555) 000-0000"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-on-surface-variant ml-1">Email Address</label>
                    <input 
                      type="email"
                      className="w-full h-14 px-6 bg-surface-container-low rounded-xl border-none focus:ring-none text-on-surface opacity-70 cursor-not-allowed"
                      value={email}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-on-surface-variant ml-1">LinkedIn URL (Optional)</label>
                    <input 
                      type="url"
                      className="w-full h-14 px-6 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-primary/40 transition-all text-on-surface placeholder:text-outline-variant"
                      placeholder="https://linkedin.com/in/username"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                    />
                  </div>
                </section>

                {/* Persona Specific Details dynamically rendered to fit styling */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  <div className="col-span-1 md:col-span-2 border-t border-outline-variant/10 pt-8">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-2">{getInstitutionLabel()} & Area</h2>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-on-surface-variant ml-1">{getInstitutionLabel()}</label>
                    <input 
                      type="text"
                      className="w-full h-14 px-6 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-primary/40 transition-all text-on-surface placeholder:text-outline-variant"
                      placeholder={`e.g. Your ${getInstitutionLabel()}`}
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      required
                    />
                  </div>

                  {persona === 'school-student' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-on-surface-variant ml-1">Education Level</label>
                      <select 
                        className="w-full h-14 px-6 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-primary/40 transition-all text-on-surface"
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
                  )}

                  {persona === 'college-student' && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-on-surface-variant ml-1">Department</label>
                        <input 
                          type="text"
                          className="w-full h-14 px-6 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-primary/40 transition-all text-on-surface placeholder:text-outline-variant"
                          placeholder="e.g. Computer Science"
                          value={personaDetails.department || ''}
                          onChange={(e) => updatePersonaDetail('department', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-on-surface-variant ml-1">Year of Study</label>
                        <select 
                          className="w-full h-14 px-6 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-primary/40 transition-all text-on-surface"
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
                    </>
                  )}

                  {persona === 'faculty' && (
                    <>
                      <div className="space-y-2 flex-grow">
                        <label className="text-sm font-medium text-on-surface-variant ml-1">Degree</label>
                        <input type="text" className="w-full h-14 px-6 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-primary/40 transition-all text-on-surface placeholder:text-outline-variant"
                          placeholder="e.g. PhD, MTech" value={personaDetails.degree || ''} onChange={(e) => updatePersonaDetail('degree', e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-on-surface-variant ml-1">Designation</label>
                        <input type="text" className="w-full h-14 px-6 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-primary/40 transition-all text-on-surface"
                          placeholder="e.g. Assistant Professor" value={personaDetails.designation || ''} onChange={(e) => updatePersonaDetail('designation', e.target.value)} required />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-on-surface-variant ml-1">Years of Experience</label>
                        <input type="number" className="w-full h-14 px-6 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-primary/40 transition-all text-on-surface"
                          placeholder="e.g. 5" value={personaDetails.years_of_experience || ''} onChange={(e) => updatePersonaDetail('years_of_experience', e.target.value)} required />
                      </div>
                    </>
                  )}

                  {persona === 'industry-professional' && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-on-surface-variant ml-1">Job Role</label>
                         <input type="text" className="w-full h-14 px-6 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-primary/40 transition-all text-on-surface placeholder:text-outline-variant"
                          placeholder="e.g. Software Engineer" value={personaDetails.role || ''} onChange={(e) => updatePersonaDetail('role', e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-on-surface-variant ml-1">Specialization</label>
                        <input type="text" className="w-full h-14 px-6 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-primary/40 transition-all text-on-surface"
                          placeholder="e.g. Full Stack" value={personaDetails.specialization || ''} onChange={(e) => updatePersonaDetail('specialization', e.target.value)} required />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-on-surface-variant ml-1">Years of Experience</label>
                        <input type="number" className="w-full h-14 px-6 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-primary/40 transition-all text-on-surface"
                          placeholder="e.g. 7" value={personaDetails.years_of_experience || ''} onChange={(e) => updatePersonaDetail('years_of_experience', e.target.value)} required />
                      </div>
                    </>
                  )}

                  {persona === 'entrepreneur' && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-on-surface-variant ml-1">Industry / Domain</label>
                         <input type="text" className="w-full h-14 px-6 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-primary/40 transition-all text-on-surface placeholder:text-outline-variant"
                          placeholder="e.g. SaaS" value={personaDetails.industry || ''} onChange={(e) => updatePersonaDetail('industry', e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-on-surface-variant ml-1">Startup Stage</label>
                        <select 
                          className="w-full h-14 px-6 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-primary/40 transition-all text-on-surface"
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
                    </>
                  )}
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <section>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-6">Profile Photo (Optional)</h2>
                    <div className="relative group">
                      <input accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" type="file" />
                      <div className="border-2 border-dashed border-outline-variant/30 rounded-2xl p-8 flex flex-col items-center justify-center bg-surface-container-low group-hover:bg-surface-container transition-colors min-h-[160px]">
                        <div className="w-12 h-12 rounded-full bg-primary-container/30 flex items-center justify-center mb-3">
                          <span className="material-symbols-outlined text-primary text-2xl">add_a_photo</span>
                        </div>
                        <h3 className="text-base font-bold text-on-surface text-center">Upload Profile Photo</h3>
                      </div>
                    </div>
                  </section>
                  
                  <section>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-6">Verification</h2>
                    <div className="relative group">
                      <input className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" type="file" onChange={handleFileUpload} accept=".pdf,.png,.jpg,.jpeg" />
                      <div className="border-2 border-dashed border-outline-variant/30 rounded-2xl p-8 flex flex-col items-center justify-center bg-surface-container-low group-hover:bg-surface-container transition-colors min-h-[160px]">
                        <div className="w-12 h-12 rounded-full bg-primary-container/30 flex items-center justify-center mb-4">
                          <span className="material-symbols-outlined text-primary text-2xl">upload_file</span>
                        </div>
                        <h3 className="text-base font-bold text-on-surface text-center">Upload Official Identification</h3>
                        {uploadedFile 
                          ? <p className="text-on-surface-variant text-xs mt-1 truncate max-w-xs">{uploadedFile}</p> 
                          : <p className="text-on-surface-variant text-xs mt-1">Drag and drop or click to browse</p>
                        }
                      </div>
                    </div>
                  </section>
                </div>

                {/* Terms & Submit */}
                <div className="pt-8 border-t border-outline-variant/10">
                  <label className="flex items-start gap-3 cursor-pointer mb-8">
                    <div className="mt-1">
                      <input 
                        className="rounded border-outline-variant text-primary focus:ring-primary h-5 w-5" 
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        required
                      />
                    </div>
                    <span className="text-sm text-on-surface-variant leading-relaxed">
                        I agree to the <a className="text-primary font-bold hover:underline" href="#">Terms of Service</a> and <a className="text-primary font-bold hover:underline" href="#">Privacy Policy</a> of Idea Lab.
                    </span>
                  </label>
                  
                  {error && <p className="text-error font-medium text-sm bg-error-container/10 p-3 rounded-lg border border-error/20 mb-4">{error}</p>}
                  
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <button 
                      className="flex-grow md:flex-none md:w-64 h-16 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-xl font-bold text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-70"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? 'Creating Account...' : 'Complete Profile'}
                    </button>
                    <p className="text-on-surface-variant text-sm">
                        <button type="button" onClick={() => setStep(1)} className="text-primary font-bold hover:underline">Back to step 1</button>
                    </p>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <footer className="py-8 px-6 text-center text-outline-variant text-xs mt-auto">
        © 2026 Idea-Box. Powered by Idea Lab.
      </footer>
    </div>
  );
}
'''

lines[243:752] = [new_ui + '\n']

with open('src/components/SignUp.jsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
