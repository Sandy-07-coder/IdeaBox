import React from 'react';

export default function LeftSidebar({ activeTab, setActiveTab, isAdmin, isSidebarOpen, setIsSidebarOpen }) {
  const getNavClass = (tabId) => {
    return `flex items-center space-x-3 py-3 rounded-xl font-bold transition-all sidebar-item overflow-hidden ${
      isSidebarOpen ? 'px-4 justify-start' : 'px-0 lg:justify-center px-4 justify-start'
    } ${
      activeTab === tabId
        ? 'bg-primary/10 text-primary'
        : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
    }`;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-outline-variant/10 flex flex-col space-y-2 transition-all duration-300 ease-in-out lg:static lg:h-screen lg:shrink-0 
          ${isSidebarOpen ? 'translate-x-0 w-64 p-6' : '-translate-x-full w-64 p-6 lg:translate-x-0 lg:w-[80px] lg:px-2 lg:py-6'}
        `} 
        id="sidebar"
      >
        <div className={`mb-8 flex items-center gap-2 sidebar-header ${isSidebarOpen ? 'justify-between lg:justify-start' : 'justify-between lg:justify-center'}`}>
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="material-symbols-outlined text-primary text-3xl shrink-0" data-icon="rocket_launch">rocket_launch</span>
            <h1 className={`text-2xl font-black tracking-tighter text-primary sidebar-logo-text whitespace-nowrap transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-100 lg:opacity-0 lg:w-0'}`}>
              Idea-Box
            </h1>
          </div>
          <button className="lg:hidden p-2 text-on-surface-variant" onClick={() => setIsSidebarOpen(false)}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden">
          <a className={getNavClass('marketplace')} href="#" onClick={(e) => { e.preventDefault(); setActiveTab('marketplace'); setIsSidebarOpen(false); }}>
            <span className="material-symbols-outlined shrink-0" data-icon="storefront">storefront</span>
            <span className={`font-inter text-sm font-medium uppercase tracking-widest sidebar-text whitespace-nowrap transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-100 lg:opacity-0 lg:w-0'}`}>Marketplace</span>
          </a>
          <a className={getNavClass('your-ideas')} href="#" onClick={(e) => { e.preventDefault(); setActiveTab('your-ideas'); setIsSidebarOpen(false); }}>
            <span className="material-symbols-outlined shrink-0" data-icon="lightbulb">lightbulb</span>
            <span className={`font-inter text-sm font-medium uppercase tracking-widest sidebar-text whitespace-nowrap transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-100 lg:opacity-0 lg:w-0'}`}>My Ideas</span>
          </a>
          <a className={getNavClass('events')} href="#" onClick={(e) => { e.preventDefault(); setActiveTab('events'); setIsSidebarOpen(false); }}>
            <span className="material-symbols-outlined shrink-0" data-icon="event">event</span>
            <span className={`font-inter text-sm font-medium uppercase tracking-widest sidebar-text whitespace-nowrap transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-100 lg:opacity-0 lg:w-0'}`}>Events</span>
          </a>
          {isAdmin && (
            <a className={getNavClass('manage-ideas')} href="#" onClick={(e) => { e.preventDefault(); setActiveTab('manage-ideas'); setIsSidebarOpen(false); }}>
              <span className="material-symbols-outlined shrink-0" data-icon="settings_suggest">settings_suggest</span>
              <span className={`font-inter text-sm font-medium uppercase tracking-widest sidebar-text whitespace-nowrap transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-100 lg:opacity-0 lg:w-0'}`}>Manage Ideas</span>
            </a>
          )}
          <a className={getNavClass('messages')} href="#" onClick={(e) => { e.preventDefault(); setActiveTab('messages'); setIsSidebarOpen(false); }}>
            <span className="material-symbols-outlined shrink-0" data-icon="chat_bubble">chat_bubble</span>
            <span className={`font-inter text-sm font-medium uppercase tracking-widest sidebar-text whitespace-nowrap transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-100 lg:opacity-0 lg:w-0'}`}>Messages</span>
          </a>
          <a href="/profile" className={`flex items-center space-x-3 py-3 text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors sidebar-item rounded-xl overflow-hidden ${isSidebarOpen ? 'px-4 justify-start' : 'px-0 lg:justify-center px-4 justify-start'}`}>
            <span className="material-symbols-outlined shrink-0" data-icon="person">person</span>
            <span className={`font-inter text-sm font-medium uppercase tracking-widest sidebar-text whitespace-nowrap transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-100 lg:opacity-0 lg:w-0'}`}>My Profile</span>
          </a>
          <a className={getNavClass('settings')} href="#" onClick={(e) => { e.preventDefault(); setActiveTab('settings'); setIsSidebarOpen(false); }}>
            <span className="material-symbols-outlined shrink-0" data-icon="settings">settings</span>
            <span className={`font-inter text-sm font-medium uppercase tracking-widest sidebar-text whitespace-nowrap transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-100 lg:opacity-0 lg:w-0'}`}>Settings</span>
          </a>
        </nav>
      </aside>

      {/* Bottom Navigation for Mobile/Tablet */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-outline-variant/20 z-50 px-4 py-2 flex justify-around items-center">
        <a className={`flex flex-col items-center p-2 ${activeTab === 'marketplace' ? 'text-primary' : 'text-on-surface-variant'}`} href="#" onClick={(e) => { e.preventDefault(); setActiveTab('marketplace'); }}>
          <span className="material-symbols-outlined">storefront</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Market</span>
        </a>
        <a className={`flex flex-col items-center p-2 ${activeTab === 'your-ideas' ? 'text-primary' : 'text-on-surface-variant'}`} href="#" onClick={(e) => { e.preventDefault(); setActiveTab('your-ideas'); }}>
          <span className="material-symbols-outlined">lightbulb</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Ideas</span>
        </a>
        <button className="flex flex-col items-center p-2 text-on-surface-variant" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          <span className="material-symbols-outlined">menu</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Menu</span>
        </button>
      </nav>
    </>
  );
}
