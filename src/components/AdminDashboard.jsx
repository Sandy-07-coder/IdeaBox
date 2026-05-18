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

  return (
    <div className="fd-container" style={{ overflowX: 'hidden' }}>
      <div className={`fd-sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>
      {/* Admin Sidebar */}
      <aside className="fd-sidebar" style={{ transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)' }}>
        <div className="fd-sidebar-header">
          <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: '#4F46E5', fontVariationSettings: "'FILL' 1" }}>verified_user</span>
          <span className="fd-brand">ADMIN PANEL</span>
        </div>

        <nav className="fd-nav">
          <a
            className={`fd-nav-item ${tab === 'overview' ? 'active' : ''}`}
            href="#"
            onClick={(e) => { e.preventDefault(); navigate('/admin/overview'); }}
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span>Overview</span>
          </a>
          <a
            className={`fd-nav-item ${tab === 'manage-ideas' ? 'active' : ''}`}
            href="#"
            onClick={(e) => { e.preventDefault(); navigate('/admin/manage-ideas'); }}
          >
            <span className="material-symbols-outlined">settings_suggest</span>
            <span>Manage Ideas</span>
          </a>
          <a
            className={`fd-nav-item ${tab === 'events' ? 'active' : ''}`}
            href="#"
            onClick={(e) => { e.preventDefault(); navigate('/admin/events'); }}
          >
            <span className="material-symbols-outlined">event</span>
            <span>Events</span>
          </a>
          <a
            className={`fd-nav-item ${tab === 'users' ? 'active' : ''}`}
            href="#"
            onClick={(e) => { e.preventDefault(); navigate('/admin/users'); }}
          >
            <span className="material-symbols-outlined">group</span>
            <span>Users</span>
          </a>
          <a
            className={`fd-nav-item ${tab === 'messages' ? 'active' : ''}`}
            href="#"
            onClick={(e) => { e.preventDefault(); navigate('/admin/messages'); }}
          >
            <span className="material-symbols-outlined">chat</span>
            <span>Messages</span>
          </a>
          <a
            className={`fd-nav-item ${tab === 'notifications' ? 'active' : ''}`}
            href="#"
            onClick={(e) => { e.preventDefault(); navigate('/admin/notifications'); }}
          >
            <span className="material-symbols-outlined">campaign</span>
            <span>Send Notifications</span>
          </a>
        </nav>

        <div className="fd-progress-box">
          <div className="fd-progress-card" style={{ background: '#fef3c7', border: '1px solid #fbbf24' }}>
            <h4 className="fd-progress-title" style={{ color: '#92400e' }}>⚡ Admin Mode</h4>
            <p className="fd-progress-stage" style={{ color: '#92400e' }}>Full platform access</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`fd-main ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <TopHeader toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <div style={{ padding: '0 1rem 2rem 1rem' }}>
          {/* Admin Header */}
          <header className="fd-header">
            <div className="fd-header-content">
              <h1 className="fd-header-title">
                Admin Dashboard <br />
                <span>Manage ideas, users, and platform health.</span>
              </h1>
              <p className="fd-header-text">{stats.pendingApprovals} ideas pending approval.</p>
            </div>
          </header>

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