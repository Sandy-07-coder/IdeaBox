import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../design/LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('home');

  const scrollToSection = (e, id) => {
    e.preventDefault();
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-page">
      {/* TopNavBar */}
      <nav className="landing-navbar">
        <div className="navbar-container">
          <div className="navbar-left">
            <a className="navbar-brand" href="#">Idea Lab</a>
            <div className="navbar-links">
              <a className={`nav-link ${activeSection === 'home' ? 'active' : ''}`} href="#home" onClick={(e) => scrollToSection(e, 'home')}>Home</a>
              <a className={`nav-link ${activeSection === 'events' ? 'active' : ''}`} href="#events" onClick={(e) => scrollToSection(e, 'events')}>Events</a>
              <a className={`nav-link ${activeSection === 'team' ? 'active' : ''}`} href="#team" onClick={(e) => scrollToSection(e, 'team')}>Team</a>
              <a className={`nav-link ${activeSection === 'join' ? 'active' : ''}`} href="#join" onClick={(e) => scrollToSection(e, 'join')}>Join Us</a>
            </div>
          </div>
          <div className="navbar-right">
            <div className="navbar-icons">
              <button className="icon-btn">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="icon-btn">
                <span className="material-symbols-outlined">account_circle</span>
              </button>
            </div>
            <button className="btn-primary" onClick={() => navigate('/login')}>Pitch Idea</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="badge">
              <span>Spring Cohort Open</span>
            </div>
            <h1 className="hero-title">
              Pitch Ideas.<br />Find Teammates.<br /><span className="highlight-text">Build the Future.</span>
            </h1>
            <p className="hero-description">
              The University Idea Lab is where academic rigor meets startup execution. Connect with brilliant minds across campus, form interdisciplinary teams, and turn your spark into a blueprint.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary flex-btn" onClick={() => navigate('/login')}>
                Pitch Your Idea
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <button className="btn-secondary">
                Browse Projects
              </button>
            </div>
          </div>
          <div className="hero-image-wrapper">
            <img alt="Students collaborating" className="hero-image" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1WxztuWZRVuup_XfoKwJIJvpY9G5zh_GNUSQSk_eoGjJyI17QBAXS_dhdrHtSaZesamp8xNJAThYw07Byct2DUKOjzcGUx6M6wSh32K7_UHtyL9eBAkfvJ-ufe2MaLxrVLvG0YcKcyc6tY8v3sVrg4atnhvxrBexXUfYeigVKwKIRZX4HP2FjRmmb9_eCPrinoWZt2T1k9qky0EFSY8Gc8D3dsy8ieK6CDkuZSe3f63hoq_Ar3dbQP8KgfEc2JyaPZWpl5rdzaNY" />
            <div className="hero-image-gradient"></div>
          </div>
        </div>
        {/* Abstract Background Elements */}
        <div className="bg-glow-top-right"></div>
        <div className="bg-glow-bottom-left"></div>
      </section>

      {/* Upcoming Events Section */}
      <section id="events" className="events-section">
        <div className="section-container">
          <div className="section-header">
            <div>
              <span className="section-pre-title">Don't Miss Out</span>
              <h2 className="section-title">Upcoming Events</h2>
            </div>
            <a className="view-all-link desktop-only" href="#">
              View all events
              <span className="material-symbols-outlined">arrow_forward</span>
            </a>
          </div>
          <div className="events-grid">
            {/* Event Card 1: Idea Ignite */}
            <div className="event-card">
              <div className="event-card-header">
                <div className="event-icon-box">
                  <span className="material-symbols-outlined">auto_awesome</span>
                </div>
                <span className="event-tag">Workshop</span>
              </div>
              <h3 className="event-title">Idea Ignite</h3>
              <p className="event-description">
                Where participants spin wheels to get a problem statement and pitch their solutions on the spot.
              </p>
              <button className="btn-outline-primary w-full">
                Register Now
              </button>
            </div>
            {/* Event Card 2: VibeShift */}
            <div className="event-card">
              <div className="event-card-header">
                <div className="event-icon-box">
                  <span className="material-symbols-outlined">psychology</span>
                </div>
                <span className="event-tag">AI &amp; Tech</span>
              </div>
              <h3 className="event-title">VibeShift</h3>
              <p className="event-description">
                Learn how to build a professional portfolio using the latest AI tools.
              </p>
              <button className="btn-outline-primary w-full">
                Register Now
              </button>
            </div>
          </div>
          <div className="mobile-only-link-container">
            <a className="view-all-link mobile-only" href="#">
              View all events
              <span className="material-symbols-outlined">arrow_forward</span>
            </a>
          </div>
        </div>
      </section>

      {/* Meet Our Team Section */}
      <section id="team" className="team-section">
        <div className="section-container">
          <div className="team-header-top">
            <span className="section-pre-title">Who we are</span>
            <h2 className="section-title">Meet Our Team</h2>
          </div>

          {/* Core Team */}
          <div className="team-group">
            <h3 className="team-group-title">Core Team</h3>
            <div className="team-grid">
              {/* Core Member 1 */}
              <div className="team-card">
                <div className="team-avatar">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <h4 className="team-name">Alex Rivera</h4>
                <p className="team-role">Program Director</p>
              </div>
              {/* Core Member 2 */}
              <div className="team-card">
                <div className="team-avatar">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <h4 className="team-name">Sarah Chen</h4>
                <p className="team-role">Operations Lead</p>
              </div>
              {/* Core Member 3 */}
              <div className="team-card">
                <div className="team-avatar">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <h4 className="team-name">David Park</h4>
                <p className="team-role">Tech Advisor</p>
              </div>
              {/* Core Member 4 */}
              <div className="team-card">
                <div className="team-avatar">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <h4 className="team-name">Maya Johnson</h4>
                <p className="team-role">Ecosystem Manager</p>
              </div>
            </div>
          </div>

          {/* Marketing Team */}
          <div className="team-group">
            <h3 className="team-group-title">Marketing Team</h3>
            <div className="team-grid-marketing">
              {/* Marketing Member 1 */}
              <div className="team-card">
                <div className="team-avatar-sm">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <h4 className="team-name">Leo Garcia</h4>
                <p className="team-role">Social Media Specialist</p>
              </div>
              {/* Marketing Member 2 */}
              <div className="team-card">
                <div className="team-avatar-sm">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <h4 className="team-name">Chloe Kim</h4>
                <p className="team-role">Content Creator</p>
              </div>
              {/* Marketing Member 3 */}
              <div className="team-card">
                <div className="team-avatar-sm">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <h4 className="team-name">Tom Wilson</h4>
                <p className="team-role">Growth Strategist</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="join" className="cta-section">
        <div className="cta-glow-bg"></div>
        <div className="cta-container">
          <span className="material-symbols-outlined cta-icon">lightbulb</span>
          <h2 className="cta-title">Ready to build?</h2>
          <p className="cta-description">
            Don't let your ideas live in a notebook. Pitch it to the lab, find your co-founders, and get access to university resources.
          </p>
          <button className="btn-primary-large" onClick={() => navigate('/signup')}>
            Start Your Pitch
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-logo">Idea Lab</div>
          <div className="footer-links">
            <a href="#">Contact Us</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Mentorship</a>
            <a href="#">Resources</a>
          </div>
          <div className="footer-copyright">
            © 2024 University Idea Lab. Built for the next generation of founders.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
