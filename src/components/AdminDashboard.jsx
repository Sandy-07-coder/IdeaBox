import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useUserStore, useIdeaStore, useEventStore } from '../store';
import ManageIdeas from './Dashboard/ManageIdeas';
import ProjectDrawer from './Dashboard/ProjectDrawer';
import TopHeader from './header/TopHeader';
import AdminEvents from './Admin/AdminEvents';
import AdminUsers from './Admin/AdminUsers';
import Messages from './Dashboard/Messages';
import AdminNotifications from './Admin/AdminNotifications';
import '../design/dashboard.css';

export default function AdminDashboard() {
  const { tab, itemId } = useParams();
  const navigate = useNavigate();
  const { currentUser, currentUserProfile, fetchUser } = useUserStore();
  const { projects, loadingIdeas: loading, fetchIdeas } = useIdeaStore();
  const { events, fetchEvents, refreshEvents } = useEventStore();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applyForm, setApplyForm] = useState({ linkedin: '', bio: '', reason: '' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

  // Stats
  const [stats, setStats] = useState({ totalUsers: 0, totalIdeas: 0, pendingApprovals: 0, approvedIdeas: 0 });

  useEffect(() => {
    fetchUser();
    fetchIdeas();
    fetchEvents();
  }, [fetchUser, fetchIdeas, fetchEvents]);

  // Sync selectedProject with URL itemId
  useEffect(() => {
    if (itemId && ['manage-ideas', 'overview'].includes(tab)) {
      const p = projects.find(x => x.id === itemId);
      if (p) setSelectedProject(p);
    } else {
      setSelectedProject(null);
    }
  }, [itemId, projects, tab]);

  // Compute stats from real data
  useEffect(() => {
    if (projects) {
      setStats({
        totalUsers: new Set(projects.map(p => p.author_id).filter(Boolean)).size,
        totalIdeas: projects.length,
        pendingApprovals: projects.filter(p => !p.is_approved).length,
        approvedIdeas: projects.filter(p => p.is_approved).length,
      });
    }
  }, [projects]);

  const handleOpenDrawer = (project) => {
    navigate(`/admin/${tab}/${project.id}`);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseDrawer = () => {
    navigate(`/admin/${tab}`);
    setIsApplying(false);
    setApplyForm({ linkedin: '', bio: '', reason: '' });
    document.body.style.overflow = 'auto';
  };

  const submitApplication = async (e) => {
    e.preventDefault();
  };

  // Redirect if not admin
  if (currentUserProfile && currentUserProfile.user_role !== 'admin') {
    navigate('/dashboard');
    return null;
  }

  const getNavClass = (tabId) => {
    return `flex items-center space-x-3 py-3 rounded-xl font-bold transition-all sidebar-item overflow-hidden ${
      isSidebarOpen ? 'px-4 justify-start' : 'px-0 lg:justify-center px-4 justify-start'
    } ${
      tab === tabId
        ? 'bg-primary/10 text-primary'
        : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
    }`;
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-surface font-body text-on-surface">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Admin Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-outline-variant/10 flex flex-col space-y-2 transition-all duration-300 ease-in-out lg:static lg:h-screen lg:shrink-0 
          ${isSidebarOpen ? 'translate-x-0 w-64 p-6' : '-translate-x-full w-64 p-6 lg:translate-x-0 lg:w-[80px] lg:px-2 lg:py-6'}
        `} 
        id="sidebar"
      >
        <div className={`mb-8 flex items-center gap-2 sidebar-header ${isSidebarOpen ? 'justify-between lg:justify-start' : 'justify-between lg:justify-center'}`}>
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="material-symbols-outlined text-primary text-3xl shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
            <h1 className={`text-xl font-black tracking-tighter text-primary sidebar-logo-text whitespace-nowrap transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-100 lg:opacity-0 lg:w-0'}`}>
              ADMIN
            </h1>
          </div>
          <button className="lg:hidden p-2 text-on-surface-variant" onClick={() => setIsSidebarOpen(false)}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden">
          <a className={getNavClass('overview')} href="#" onClick={(e) => { e.preventDefault(); navigate('/admin/overview'); setIsSidebarOpen(false); }}>
            <span className="material-symbols-outlined shrink-0">dashboard</span>
            <span className={`font-inter text-sm font-medium uppercase tracking-widest sidebar-text whitespace-nowrap transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-100 lg:opacity-0 lg:w-0'}`}>Overview</span>
          </a>
          <a className={getNavClass('manage-ideas')} href="#" onClick={(e) => { e.preventDefault(); navigate('/admin/manage-ideas'); setIsSidebarOpen(false); }}>
            <span className="material-symbols-outlined shrink-0">settings_suggest</span>
            <span className={`font-inter text-sm font-medium uppercase tracking-widest sidebar-text whitespace-nowrap transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-100 lg:opacity-0 lg:w-0'}`}>Manage Ideas</span>
          </a>
          <a className={getNavClass('events')} href="#" onClick={(e) => { e.preventDefault(); navigate('/admin/events'); setIsSidebarOpen(false); }}>
            <span className="material-symbols-outlined shrink-0">event</span>
            <span className={`font-inter text-sm font-medium uppercase tracking-widest sidebar-text whitespace-nowrap transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-100 lg:opacity-0 lg:w-0'}`}>Events</span>
          </a>
          <a className={getNavClass('users')} href="#" onClick={(e) => { e.preventDefault(); navigate('/admin/users'); setIsSidebarOpen(false); }}>
            <span className="material-symbols-outlined shrink-0">group</span>
            <span className={`font-inter text-sm font-medium uppercase tracking-widest sidebar-text whitespace-nowrap transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-100 lg:opacity-0 lg:w-0'}`}>Users</span>
          </a>
          <a className={getNavClass('messages')} href="#" onClick={(e) => { e.preventDefault(); navigate('/admin/messages'); setIsSidebarOpen(false); }}>
            <span className="material-symbols-outlined shrink-0">chat</span>
            <span className={`font-inter text-sm font-medium uppercase tracking-widest sidebar-text whitespace-nowrap transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-100 lg:opacity-0 lg:w-0'}`}>Messages</span>
          </a>
          <a className={getNavClass('notifications')} href="#" onClick={(e) => { e.preventDefault(); navigate('/admin/notifications'); setIsSidebarOpen(false); }}>
            <span className="material-symbols-outlined shrink-0">campaign</span>
            <span className={`font-inter text-sm font-medium uppercase tracking-widest sidebar-text whitespace-nowrap transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-100 lg:opacity-0 lg:w-0'}`}>Notifications</span>
          </a>
        </nav>

        <div className={`mt-4 overflow-hidden transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-100 lg:opacity-0 lg:hidden'}`}>
          <div className="bg-amber-50 border border-amber-400 p-4 rounded-xl flex flex-col items-center text-center">
            <h4 className="text-amber-900 font-bold text-sm mb-1 uppercase tracking-wider">⚡ Admin Mode</h4>
            <p className="text-amber-700 text-xs font-medium">Full platform access</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen pb-24 lg:pb-0 overflow-y-auto w-full">
        <TopHeader toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <div className="px-4 md:px-8 lg:px-12 pb-12 w-full max-w-[100vw] lg:max-w-none">
          {/* Admin Header */}
          <div className="mb-8 lg:mb-12 mt-6">
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-on-surface mb-2">
                Admin Dashboard
              </h3>
              <p className="text-on-surface-variant text-base lg:text-lg">{stats.pendingApprovals} ideas pending approval.</p>
          </div>

          {/* Stats Cards */}
          {tab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '500' }}>Unique Authors</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', color: '#4F46E5', background: '#e0e7ff', padding: '0.5rem', borderRadius: '8px' }}>groups</span>
                </div>
                <h3 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>{stats.totalUsers}</h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#10b981', fontWeight: '500' }}>Active contributors</p>
              </div>

              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '500' }}>Total Ideas</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', color: '#7c3aed', background: '#ede9fe', padding: '0.5rem', borderRadius: '8px' }}>lightbulb</span>
                </div>
                <h3 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>{stats.totalIdeas}</h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>In the platform</p>
              </div>

              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '500' }}>Approved</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', color: '#10b981', background: '#d1fae5', padding: '0.5rem', borderRadius: '8px' }}>check_circle</span>
                </div>
                <h3 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>{stats.approvedIdeas}</h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#10b981', fontWeight: '500' }}>Live on marketplace</p>
              </div>

              <div style={{ background: '#fff', border: '1px solid #fbbf24', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '500' }}>Pending Approval</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', color: '#f59e0b', background: '#fef3c7', padding: '0.5rem', borderRadius: '8px' }}>pending_actions</span>
                </div>
                <h3 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>{stats.pendingApprovals}</h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#f59e0b', fontWeight: '500' }}>Needs your attention</p>
              </div>
            </div>
          )}

          {/* Overview - Recent pending ideas */}
          {tab === 'overview' && (
            <section>
              <div className="fd-section-header">
                <h2 className="fd-section-title">Recent Pending Ideas</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                {projects.filter(p => !p.is_approved).slice(0, 5).map(project => (
                  <div
                    key={project.id}
                    onClick={() => handleOpenDrawer(project)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '1rem 1.25rem', background: '#fff', border: '1px solid #e5e7eb',
                      borderRadius: '8px', cursor: 'pointer', transition: 'box-shadow 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
                    onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', color: '#f59e0b', background: '#fef3c7', padding: '0.5rem', borderRadius: '8px' }}>lightbulb</span>
                      <div>
                        <h4 style={{ margin: 0, color: '#111827', fontSize: '1rem', fontWeight: '600' }}>{project.project_title}</h4>
                        <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280', fontSize: '0.85rem' }}>
                          by {project.profiles?.full_name || 'Unknown'} • {new Date(project.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span style={{ padding: '0.25rem 0.75rem', background: '#fef3c7', color: '#92400e', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600' }}>⏳ Pending</span>
                  </div>
                ))}
                {projects.filter(p => !p.is_approved).length === 0 && (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280', background: '#fff', borderRadius: '8px', border: '1px dashed #e5e7eb' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: '#10b981', marginBottom: '0.5rem' }}>check_circle</span>
                    <p style={{ margin: 0 }}>All ideas are approved! 🎉</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Manage Ideas Tab */}
          {tab === 'manage-ideas' && (
            <ManageIdeas
              projects={projects}
              loading={loading}
              currentUser={currentUser}
              currentUserProfile={currentUserProfile}
              handleOpenDrawer={handleOpenDrawer}
            />
          )}

          {/* Events Tab */}
          {tab === 'events' && (
            <AdminEvents
              events={events}
              refreshEvents={refreshEvents}
              currentUser={currentUser}
            />
          )}

          {/* Users Tab */}
          {tab === 'users' && (
            <AdminUsers />
          )}

          {/* Messages Tab */}
          {tab === 'messages' && (
            <Messages />
          )}

          {/* Notifications Tab */}
          {tab === 'notifications' && (
            <AdminNotifications />
          )}
        </div>
      </main>

      {/* Shared Project Drawer */}
      <ProjectDrawer
        selectedProject={selectedProject}
        handleCloseDrawer={handleCloseDrawer}
        activeTab={tab}
        currentUser={currentUser}
        currentUserProfile={currentUserProfile}
        fetchIdeas={fetchIdeas}
        isApplying={isApplying}
        setIsApplying={setIsApplying}
        applyForm={applyForm}
        setApplyForm={setApplyForm}
        submitApplication={submitApplication}
      />
    </div>
  );
}