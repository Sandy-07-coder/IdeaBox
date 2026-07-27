import React from 'react';

/** Small circular badge — hidden when count is 0. */
function NavBadge({ count }) {
  if (!count || count === 0) return null;
  const label = count > 99 ? '99+' : String(count);
  return (
    <span
      className="fd-nav-badge"
      aria-label={`${count} unread notification${count !== 1 ? 's' : ''}`}
    >
      {label}
    </span>
  );
}

export default function LeftSidebar({ activeTab, setActiveTab, isAdmin, isSidebarOpen, setIsSidebarOpen, badges = {} }) {
  // On desktop: sidebar is always visible but collapses to icon rail when closed.
  // On mobile: sidebar slides in/out as an overlay.
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
  const collapsed = !isSidebarOpen;

  // Navigate and auto-close sidebar on mobile after a nav item is tapped
  const handleNav = (e, tab) => {
    e.preventDefault();
    setActiveTab(tab);
    if (!isDesktop) setIsSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile overlay — hidden on desktop via CSS */}
      <div
        className={`fd-sidebar-overlay ${isSidebarOpen && !isDesktop ? 'active' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside className={`fd-sidebar ${collapsed ? 'fd-sidebar--collapsed' : ''}`}>
        <div className="fd-sidebar-header">
          <img
            alt="SEC Logo"
            className="fd-logo"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1hoqJZyGKtGRUSPLooiT1UFLV6yZy9ufFAcl8CWdhPJMUU3eMkPPoPUZ8xLcp64ABrBUDUQTYM66r3ayf_CtOPDCxXNY7NWiUye_INy1Cn8NlgxSMnc9labJkYNjZ3DW3fAjg8nT8wLhvljKENnNROY9m7vjteQtOnmHG-nuzrB8X0SG2SEy0b9mddfjqHB8mv2KVibWTL_NPfrAV3Bcoj7PvpPYPDn8_Y0jVCS_PUXPn0YqT8BFoOZE2w9_3QxGjjenLfQV-PNw"
          />
          <span className="fd-brand">IDEA-BOX</span>
        </div>

        <nav className="fd-nav">
          {/* Marketplace — no badge */}
          <a
            className={`fd-nav-item ${activeTab === 'marketplace' ? 'active' : ''}`}
            href="#"
            title="Marketplace"
            onClick={(e) => handleNav(e, 'marketplace')}
          >
            <span className="fd-nav-icon-wrap">
              <span className="material-symbols-outlined">rocket_launch</span>
            </span>
            <span className="fd-nav-label">Marketplace</span>
          </a>

          {/* Your Ideas */}
          <a
            className={`fd-nav-item ${activeTab === 'your-ideas' ? 'active' : ''}`}
            href="#"
            title="Your Ideas"
            onClick={(e) => handleNav(e, 'your-ideas')}
          >
            <span className="fd-nav-icon-wrap">
              <span className="material-symbols-outlined">lightbulb</span>
              <NavBadge count={badges['your-ideas']} />
            </span>
            <span className="fd-nav-label">Your Ideas</span>
          </a>

          {/* Hiring */}
          <a
            className={`fd-nav-item ${activeTab === 'hiring' ? 'active' : ''}`}
            href="#"
            title="Hiring"
            onClick={(e) => handleNav(e, 'hiring')}
          >
            <span className="fd-nav-icon-wrap">
              <span className="material-symbols-outlined">work</span>
              <NavBadge count={badges['hiring']} />
            </span>
            <span className="fd-nav-label">Hiring</span>
          </a>

          {/* Events */}
          <a
            className={`fd-nav-item ${activeTab === 'events' ? 'active' : ''}`}
            href="#"
            title="Events"
            onClick={(e) => handleNav(e, 'events')}
          >
            <span className="fd-nav-icon-wrap">
              <span className="material-symbols-outlined">event</span>
              <NavBadge count={badges['events']} />
            </span>
            <span className="fd-nav-label">Events</span>
          </a>

          {isAdmin && (
            <a
              className={`fd-nav-item ${activeTab === 'manage-ideas' ? 'active' : ''}`}
              href="#"
              title="Manage Ideas"
              onClick={(e) => handleNav(e, 'manage-ideas')}
            >
              <span className="fd-nav-icon-wrap">
                <span className="material-symbols-outlined">settings_suggest</span>
              </span>
              <span className="fd-nav-label">Manage Ideas</span>
            </a>
          )}

          {/* Messages */}
          <a
            className={`fd-nav-item ${activeTab === 'messages' ? 'active' : ''}`}
            href="#"
            title="Messages"
            onClick={(e) => handleNav(e, 'messages')}
          >
            <span className="fd-nav-icon-wrap">
              <span className="material-symbols-outlined">chat_bubble</span>
              <NavBadge count={badges['messages']} />
            </span>
            <span className="fd-nav-label">Messages</span>
          </a>

          {/* Settings — no badge */}
          <a
            className={`fd-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            href="#"
            title="Settings"
            onClick={(e) => handleNav(e, 'settings')}
          >
            <span className="fd-nav-icon-wrap">
              <span className="material-symbols-outlined">settings</span>
            </span>
            <span className="fd-nav-label">Settings</span>
          </a>
        </nav>
      </aside>
    </>
  );
}
