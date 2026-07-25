import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
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

    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    // Check if profile is complete
    if (authData?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('institution_name, terms_agreed, user_role')
        .eq('id', authData.user.id)
        .maybeSingle();

      setLoading(false);

      if (profile?.user_role === 'admin') {
        navigate('/admin');
      } else if (profile && (profile.institution_name || profile.terms_agreed)) {
        navigate('/dashboard');
      } else {
        // Profile incomplete, send to signup page (step 3)
        navigate('/signup');
      }
    } else {
      setLoading(false);
      navigate('/dashboard');
    }
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
    <main className="flex min-h-screen w-full">
      {/* Left Side: Brand Narrative (Indigo) */}
      <section className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden flex-col justify-center p-20">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-primary-container opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-80 h-80 bg-secondary-container opacity-10 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-xl">
          <h1 className="text-white text-6xl font-extrabold tracking-tight leading-[1.1] mb-10">
            Don't just dream it. Launch it.
          </h1>
          <p className="text-on-primary text-xl font-medium leading-relaxed opacity-90">
            We bridge the gap between academic brilliance and market success by connecting founders with mentors and capital.
          </p>
        </div>
      </section>

      {/* Right Side: Login Form */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-20 bg-surface">
        <div className="w-full max-w-md flex flex-col min-h-[80vh]">
          <div className="flex-grow flex flex-col justify-center">
            <div className="mb-10 text-left">
              <div className="mb-8">
                <img
                  alt="SEC Logo"
                  className="h-14 w-auto object-contain"
                  src={collegeLogo}
                />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-on-surface mb-2">
                Welcome back
              </h2>
              <p className="text-on-surface-variant font-medium">
                Continue your journey with Idea-Box.
              </p>
            </div>

            <div className="space-y-6">
              {error && (
                <div className="text-error font-medium text-sm text-center bg-error-container/10 p-3 rounded-lg border border-error/20">
                  {error}
                </div>
              )}

              {/* Social Login */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-surface-container-lowest text-on-surface font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-outline-variant/10 active:scale-[0.98]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                Sign in with Google
              </button>

              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-outline-variant/30"></div>
                <span className="absolute bg-surface px-4 text-sm font-medium text-on-surface-variant">
                  Or use email
                </span>
              </div>

              {/* Input Fields */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-on-surface-variant ml-1" htmlFor="email">
                    Email Address
                  </label>
                  <input
                    className="w-full px-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/40 text-on-surface placeholder:text-outline transition-all"
                    id="email"
                    placeholder="leo@stanford.edu"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-sm font-semibold text-on-surface-variant" htmlFor="password">
                      Password
                    </label>
                    <a className="text-sm font-bold text-primary hover:text-primary-dim transition-colors" href="#">
                      Forgot Password?
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      className="w-full px-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/40 text-on-surface placeholder:text-outline transition-all"
                      id="password"
                      placeholder="••••••••"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
                      type="button"
                      onClick={togglePasswordVisibility}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 py-2">
                  <input
                    className="w-5 h-5 rounded border-none bg-surface-container-high text-primary focus:ring-primary focus:ring-offset-0 transition-all cursor-pointer"
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label className="text-sm font-medium text-on-surface-variant select-none cursor-pointer" htmlFor="remember">
                    Remember me
                  </label>
                </div>

                <button
                  className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 active:scale-95"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <p className="text-center pt-8 text-on-surface-variant font-medium">
                New to Idea-Box?{' '}
                <a
                  className="text-primary font-bold hover:underline decoration-2 underline-offset-4 cursor-pointer"
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

          <footer className="mt-auto pt-10 text-center">
            <p className="text-xs text-on-surface-variant font-medium opacity-60">
              © 2026 Idea-Box. Lets Build Your Legacy Together
            </p>
          </footer>
        </div>
      </section>
    </main>
  );
}
