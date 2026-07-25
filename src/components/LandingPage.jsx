import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  
  // Using an intersection observer to keep the animation logic from original HTML
  useEffect(() => {
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('opacity-100', 'translate-y-0');
                entry.target.classList.remove('opacity-0', 'translate-y-10');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        el.classList.add('transition-all', 'duration-700', 'opacity-0', 'translate-y-10');
        observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-xl dark:bg-surface-dim/70 shadow-[0_20px_50px_rgba(74,64,224,0.05)]">
        <div className="flex justify-between items-center w-full px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-headline-md font-display font-black tracking-tighter text-primary dark:text-primary-fixed">Idea-Box</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="text-on-surface-variant hover:text-primary font-body text-label-md uppercase tracking-wide transition-all active:scale-95"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-body text-label-md uppercase tracking-wide font-bold hover:scale-105 transition-transform duration-200 active:scale-95 shadow-lg shadow-primary/20"
            >
              Create Account
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-24 overflow-hidden">
        {/* Hero Section */}
        <section className="relative min-h-[870px] flex items-center px-8 max-w-7xl mx-auto" style={{ background: "radial-gradient(circle at 70% 30%, rgba(74, 64, 224, 0.08) 0%, transparent 50%)" }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center w-full">
            {/* Left: Content */}
            <div className="space-y-8 animate-on-scroll">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary-container/30 text-primary font-bold text-xs uppercase tracking-widest">
                Launch Your Legacy
              </div>
              <h1 className="text-6xl md:text-7xl font-display font-black text-on-surface tracking-tighter leading-[1.1]">
                Where student ideas turn into <span className="text-primary">real-world</span> projects.
              </h1>
              <p className="text-xl text-on-surface-variant leading-relaxed max-w-xl">
                Idea-Box is the campus incubator designed to empower student founders with the tools, teams, and mentorship needed to build impactful startups. Bridge the gap between dorm-room concepts and market-ready prototypes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => navigate('/login')}
                  className="text-on-primary px-8 py-4 rounded-xl font-bold text-lg hover:scale-[1.02] transition-transform shadow-xl shadow-primary/30 flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #4a40e0 0%, #9795ff 100%)" }}
                >
                  Explore Projects
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 600" }}>arrow_forward</span>
                </button>
              </div>
            </div>
            {/* Right: Mockup */}
            <div className="relative group animate-on-scroll">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <img alt="Hardware prototype testing" className="rounded-2xl shadow-lg object-cover aspect-square w-full" src="https://lh3.googleusercontent.com/aida/AP1WRLvsLbubkNS0RdlMJQoqwEJBsfZZRcHSPcRzJLXpE7UJpIsD8ku5hpbVnl3vwIQrfV2vXViAU-gQ037BPAb2StGjj3dzXalsxF4Ynxj2rzrLKTcl9sR9eFp7G0ZmS6EIlXXdvsOENLuJrV3eP0P7w9K5mx5_wN3mf8kKYdcSsnc7nlripMI-ZlmPZErLzcN-0n_YTW01JoxU_mOKF5_ASW-pgMBPu9RZDN7LwMu9y8J2RUohQmHkmFSNoRU" />
                  <img alt="Soldering station" className="rounded-2xl shadow-lg object-cover aspect-[3/4] w-full" src="https://lh3.googleusercontent.com/aida/AP1WRLtfIPrSYhIqzY-fCJIScdCwQ9SGoShJAZxn4wDjCIIZJtf1Z3irWiK8qaBU1WDqE6_jHxdlb78YwwEuc6KN4alYxDh3KE0UuYTdGqhQ3QpdJBe2esCMVgETXoz4WLbJ20NuXkdOUzVGZ4Kzcn3j4FmLhYfVeKwbMQwAJO6ZoLURCZHCq0aWiu8yLjJtrG52jAWJSviILVJIEuDKcPlXTSGAEiHoOVdc9mSh8zeHe-wiv6PrTwGCYK8JLQ" />
                </div>
                <div className="space-y-4 pt-8">
                  <img alt="Robotics collaboration" className="rounded-2xl shadow-lg object-cover aspect-[3/4] w-full" src="https://lh3.googleusercontent.com/aida/AP1WRLu9EQUKriKHPWWNUblbVLy2oVLBVTLxliLK5KRNUdotOVr-3S_aIF1NHbiNc0U6wCbF7PbwxIqRIBfAqGv7L9GnPf_A6CQWpv48__K8ZASzjvbkTP160Z4L-CE4IXPZQEC7ackNCJWLTNTfXZlGExRBngmmS2mB9CHyF4CaIFxmHaj3Wxw2njwqxfxkkXcLnMwyF5Ldm1UkjV1hLAMATOegoaEvpjT9OKwpBqG96ZFYJ6AprU8X8ZduXIM" />
                  <img alt="3D printers" className="rounded-2xl shadow-lg object-cover aspect-square w-full" src="https://lh3.googleusercontent.com/aida/AP1WRLvo61kIhHhsd_68Y5EdCt9kf0XIeWWq4zWNR0ECWTEwDVa8dpdh_bnXbMBeSOTTcScCL37jlL_J9r63Bt7Q6x6HpKDSRrfCdvQeBx7QfbgGtjALzNTmFMoCRdjn3YFo8bxXD6dSqe1LOczltWWBDEJA1qWcYykS4ChimCHqnfRGeyrKxtXcVxQLWp4ngvpKoJKDI9NI8QxI610pZ-dIZeaEFRfFLUYVGystyylPj5GptjI-J3N5P7BePMo" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Features */}
        <section className="py-32 px-8 bg-surface-container-low">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20 space-y-4 animate-on-scroll">
              <h2 className="text-4xl font-display font-black tracking-tight">The Incubator Ecosystem</h2>
              <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">Everything you need to move from a "What if?" to a functional prototype, all within your university network.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-surface-container-lowest p-10 rounded-xl hover:scale-105 transition-all duration-300 shadow-[0_20px_50px_rgba(74,64,224,0.03)] group border-t-2 border-transparent hover:border-primary animate-on-scroll">
                <div className="w-14 h-14 bg-primary-container/20 rounded-xl flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined text-3xl">lightbulb</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Submit &amp; Refine</h3>
                <p className="text-on-surface-variant leading-relaxed">Share project concepts and get structured feedback from peers and industry professionals to sharpen your value proposition.</p>
              </div>
              {/* Feature 2 */}
              <div className="bg-surface-container-lowest p-10 rounded-xl hover:scale-105 transition-all duration-300 shadow-[0_20px_50px_rgba(74,64,224,0.03)] group border-t-2 border-transparent hover:border-primary animate-on-scroll">
                <div className="w-14 h-14 bg-primary-container/20 rounded-xl flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined text-3xl">groups</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Team Matching</h3>
                <p className="text-on-surface-variant leading-relaxed">Connect with peers across engineering, design, and business. Build a multidisciplinary team capable of total execution.</p>
              </div>
              {/* Feature 3 */}
              <div className="bg-surface-container-lowest p-10 rounded-xl hover:scale-105 transition-all duration-300 shadow-[0_20px_50px_rgba(74,64,224,0.03)] group border-t-2 border-transparent hover:border-primary animate-on-scroll">
                <div className="w-14 h-14 bg-primary-container/20 rounded-xl flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined text-3xl">psychology</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Mentorship &amp; Support</h3>
                <p className="text-on-surface-variant leading-relaxed">Get guidance from faculty, campus advisors, and successful alumni who have navigated the startup journey before you.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-32 px-8 bg-surface overflow-hidden">
          <div className="max-w-7xl mx-auto relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-20 gap-8 animate-on-scroll">
              <div className="space-y-2">
                <span className="text-primary font-bold uppercase tracking-widest text-sm">The Roadmap</span>
                <h2 className="text-5xl font-display font-black tracking-tight">Your Launch Sequence</h2>
              </div>
              <div className="h-px flex-grow bg-outline-variant/20 hidden md:block mx-12"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 relative animate-on-scroll">
              {/* Connector Line (Desktop) */}
              <div className="absolute top-1/4 left-0 w-full h-0.5 bg-outline-variant/10 hidden lg:block -z-10"></div>
              {/* Step 1 */}
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-full bg-surface-container-lowest border-4 border-surface shadow-xl flex items-center justify-center text-primary font-black text-2xl">1</div>
                <div className="space-y-2">
                  <h4 className="text-xl font-bold">Create an Account</h4>
                  <p className="text-on-surface-variant text-sm">Join the network using your student credentials to verify your status within the campus incubator ecosystem.</p>
                </div>
              </div>
              {/* Step 2 */}
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-full bg-surface-container-lowest border-4 border-surface shadow-xl flex items-center justify-center text-primary font-black text-2xl">2</div>
                <div className="space-y-2">
                  <h4 className="text-xl font-bold">Post Your Idea or Join a Team</h4>
                  <p className="text-on-surface-variant text-sm">Launch a new concept or browse existing projects that align with your specific skills and entrepreneurial interests.</p>
                </div>
              </div>
              {/* Step 3 */}
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-full bg-surface-container-lowest border-4 border-surface shadow-xl flex items-center justify-center text-primary font-black text-2xl">3</div>
                <div className="space-y-2">
                  <h4 className="text-xl font-bold">Connect with Mentors</h4>
                  <p className="text-on-surface-variant text-sm">Schedule one-on-one sessions with faculty leads or industry mentors to vet your business model and tech stack.</p>
                </div>
              </div>
              {/* Step 4 */}
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-full bg-primary border-4 border-surface shadow-xl shadow-primary/20 flex items-center justify-center text-on-primary font-black text-2xl">4</div>
                <div className="space-y-2">
                  <h4 className="text-xl font-bold">Launch Your Prototype</h4>
                  <p className="text-on-surface-variant text-sm">Utilize Idea-Box resources to build and present your MVP to the campus community and potential early investors.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-8">
          <div className="max-w-5xl mx-auto rounded-3xl p-12 md:p-20 text-center text-on-primary relative overflow-hidden shadow-2xl shadow-primary/30 animate-on-scroll" style={{ background: "linear-gradient(135deg, #4a40e0 0%, #9795ff 100%)" }}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="relative z-10 space-y-8">
              <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight">Ready to build something that matters?</h2>
              <p className="text-on-primary/80 text-xl max-w-2xl mx-auto">Join students already collaborating on the next generation of campus startups.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={() => navigate('/login')}
                  className="border-2 border-on-primary/30 text-on-primary px-10 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-colors"
                >
                  Explore All Ideas
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 bg-surface-container-low dark:bg-surface-dim mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-8 max-w-7xl mx-auto space-y-4 md:space-y-0">
          <div className="flex items-center space-x-6">
            <span className="text-headline-sm font-display font-bold text-on-surface">Idea-Box</span>
            <span className="font-body text-body-sm text-on-surface-variant">© 2026 Idea-Box. All rights reserved.</span>
          </div>
          <div className="flex items-center space-x-8">
            <a className="font-body text-body-sm text-on-surface-variant hover:text-on-surface hover:underline decoration-primary/30 transition-opacity duration-200" href="#">Terms</a>
            <a className="font-body text-body-sm text-on-surface-variant hover:text-on-surface hover:underline decoration-primary/30 transition-opacity duration-200" href="#">Privacy</a>
            <a className="font-body text-body-sm text-on-surface-variant hover:text-on-surface hover:underline decoration-primary/30 transition-opacity duration-200" href="#">College Administration</a>
          </div>
          <div className="flex space-x-4">
            <a className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface hover:bg-primary hover:text-on-primary transition-all" href="#">
              <span className="material-symbols-outlined">share</span>
            </a>
            <a className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface hover:bg-primary hover:text-on-primary transition-all" href="#">
              <span className="material-symbols-outlined">hub</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
