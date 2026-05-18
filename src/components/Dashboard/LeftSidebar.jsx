import React from 'react';

export default function LeftSidebar({ activeTab, setActiveTab, isAdmin, isSidebarOpen, setIsSidebarOpen }) {
  return (
    <>
      <div className={`fd-sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>
      <aside className="fd-sidebar" style={{ transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)' }}>
      <div className="fd-sidebar-header">
        <img
          alt="SEC Logo"
          className="fd-logo"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1hoqJZyGKtGRUSPLooiT1UFLV6yZy9ufFAcl8CWdhPJMUU3eMkPPoPUZ8xLcp64ABrBUDUQTYM66r3ayf_CtOPDCxXNY7NWiUye_INy1Cn8NlgxSMnc9labJkYNjZ3DW3fAjg8nT8wLhvljKENnNROY9m7vjteQtOnmHG-nuzrB8X0SG2SEy0b9mddfjqHB8mv2KVibWTL_NPfrAV3Bcoj7PvpPYPDn8_Y0jVCS_PUXPn0YqT8BFoOZE2w9_3QxGjjenLfQV-PNw"
        />
        <span className="fd-brand">IDEA-BOX</span>
      </div>

      <nav className="fd-nav">
        <a
          className={`fd-nav-item ${activeTab === 'marketplace' ? 'active' : ''}`}
          href="#"
          onClick={(e) => { e.preventDefault(); setActiveTab('marketplace'); }}
        >
          <span className="material-symbols-outlined">rocket_launch</span>
          <span>Marketplace</span>
        </a>
        <a
          className={`fd-nav-item ${activeTab === 'your-ideas' ? 'active' : ''}`}
          href="#"
          onClick={(e) => { e.preventDefault(); setActiveTab('your-ideas'); }}
        >
          <span className="material-symbols-outlined">lightbulb</span>
          <span>Your Ideas</span>
        </a>
        <a
          className={`fd-nav-item ${activeTab === 'events' ? 'active' : ''}`}
          href="#"
          onClick={(e) => { e.preventDefault(); setActiveTab('events'); }}
        >
          <span className="material-symbols-outlined">event</span>
          <span>Events</span>
        </a>
        {isAdmin && (
          <a
            className={`fd-nav-item ${activeTab === 'manage-ideas' ? 'active' : ''}`}
            href="#"
            onClick={(e) => { e.preventDefault(); setActiveTab('manage-ideas'); }}
          >
            <span className="material-symbols-outlined">settings_suggest</span>
            <span>Manage Ideas</span>
          </a>
        )}
        <a
          className={`fd-nav-item ${activeTab === 'messages' ? 'active' : ''}`}
          href="#"
          onClick={(e) => { e.preventDefault(); setActiveTab('messages'); }}
        >
          <span className="material-symbols-outlined">chat_bubble</span>
          <span>Messages</span>
        </a>
        <a
          className={`fd-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          href="#"
          onClick={(e) => { e.preventDefault(); setActiveTab('settings'); }}
        >
          <span className="material-symbols-outlined">settings</span>
          <span>Settings</span>
        </a>
      </nav>

      <div className="fd-progress-box">
        <div className="fd-progress-card">
          <h4 className="fd-progress-title">Your Growth</h4>
          <div className="fd-progress-track">
            <div className="fd-progress-fill"></div>
          </div>
          <p className="fd-progress-stage">Stage: Pre-Seed</p>
        </div>
      </div>
    </aside>
    </>
  );
}
