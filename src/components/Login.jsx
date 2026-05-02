import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import '../design/login.css';
import collegeLogo from '../assets/college-logo.png';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    navigate('/dashboard'); // Change this if you have a different authenticated route
  };

  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/signup`
      }
    });

    if (googleError) {
      setError(googleError.message);
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <main className="login-container">
      {/* Left Side: Brand Narrative (Indigo) */}
      <section className="login-brand-section">
        <div className="login-brand-content">
          <h1 className="login-brand-title">
            Don't just dream it. Launch it.
          </h1>
          <p className="login-brand-subtitle">
            We bridge the gap between academic brilliance and market success by connecting founders with mentors and capital.
          </p>
        </div>
      </section>

      {/* Right Side: Login Form */}
      <section className="login-form-section">
        <div className="login-form-wrapper">
          <div className="login-form-inner">
            {/* Header */}
            <div className="login-header">
              <img
                alt="SEC Logo"
                className="login-logo"
                src={collegeLogo} 
              />
              <h2 className="login-heading">
                Welcome back
              </h2>
              <p className="login-subtitle">
                Continue your journey with Idea-Box.
              </p>
            </div>

            <div className="login-content">
              {/* Social Login */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                style={{ width: '100%', padding: '0.75rem', background: '#fff', border: '1px solid #dadce0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: '500', color: '#3c4043', fontSize: '14px', fontFamily: '"Google Sans", Roboto, Arial, sans-serif', boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3)', transition: 'background-color 0.2s', marginBottom: '1.5rem' }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = '#fff'}
              >
                <svg viewBox="0 0 24 24" style={{width: '20px', height: '20px'}}>
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  ></path>
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  ></path>
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  ></path>
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  ></path>
                </svg>
                Continue with Google
              </button>

              {/* Divider */}
              <div className="login-divider">
                <div className="login-divider-line"></div>
                <span className="login-divider-text">
                  Or use email
                </span>
              </div>

              {error && (
                <div style={{ color: 'red', marginTop: '10px', marginBottom: '10px', textAlign: 'center', fontSize: '0.9rem' }}>
                  {error}
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="login-form">
                {/* Email Field */}
                <div className="login-form-group">
                  <label
                    className="login-label"
                    htmlFor="email"
                  >
                    Email Address
                  </label>
                  <input
                    className="login-input"
                    id="email"
                    placeholder="leo@stanford.edu"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Password Field */}
                <div className="login-form-group">
                  <div className="login-label-row">
                    <label
                      className="login-label"
                      htmlFor="password"
                    >
                      Password
                    </label>
                    <a
                      className="login-forgot-link"
                      href="#"
                    >
                      Forgot Password?
                    </a>
                  </div>
                  <div className="login-password-wrapper">
                    <input
                      className="login-input"
                      id="password"
                      placeholder="••••••••"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      className="login-password-toggle"
                      type="button"
                      onClick={togglePasswordVisibility}
                    >
                      <span className="material-symbols-outlined">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="login-checkbox-group">
                  <input
                    className="login-checkbox"
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label
                    className="login-checkbox-label"
                    htmlFor="remember"
                  >
                    Remember me
                  </label>
                </div>

                {/* Sign In Button */}
                <button
                  className="login-submit-btn"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              {/* Sign Up Link */}
              <p className="login-signup-text">
                New to Idea-Box?{' '}
                <a
                  className="login-signup-link"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/signup');
                  }}
                >
                  Create Account.
                </a>
              </p>
            </div>
          </div>

          {/* Footer */}
          <footer className="login-footer">
            <p className="login-footer-text">
              © 2026 Idea-Box. Lets Build Your Legacy Together
            </p>
          </footer>
        </div>
      </section>
    </main>
  );
}
