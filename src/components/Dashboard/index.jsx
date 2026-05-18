import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useUserStore, useIdeaStore, useEventStore } from '../../store';
import TopHeader from '../header/TopHeader';
import LeftSidebar from './LeftSidebar';
import Marketplace from './Marketplace';
import YourIdeas from './YourIdeas';
import Events from './Events';
import ManageIdeas from './ManageIdeas';
import Messages from './Messages';
import Settings from './Settings';
import ProjectDrawer from './ProjectDrawer';
import '../../design/dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const { tab, itemId } = useParams();
  const activeTab = tab || 'marketplace';
  
  // UI State
  const [selectedProject, setSelectedProject] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applyForm, setApplyForm] = useState({ linkedin: '', bio: '', reason: '' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

  // Global State
  const { currentUser, currentUserProfile, fetchUser } = useUserStore();
  const { projects, loadingIdeas: loading, fetchIdeas } = useIdeaStore();
  const { events, loadingEvents, fetchEvents } = useEventStore();

  const isAdmin = currentUserProfile?.user_role === 'admin';

  useEffect(() => {
    fetchUser();
    fetchIdeas();
    fetchEvents();
  }, [fetchUser, fetchIdeas, fetchEvents]);

  // Redirect admins to /admin
  useEffect(() => {
    if (currentUserProfile && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [currentUserProfile, isAdmin]);

  // Sync selectedProject with URL itemId
  useEffect(() => {
    if (itemId && ['marketplace', 'your-ideas', 'manage-ideas'].includes(activeTab)) {
      const project = projects.find(p => p.id === itemId);
      if (project) {
        setSelectedProject(project);
        document.body.style.overflow = 'hidden';
      }
    } else {
      setSelectedProject(null);
      document.body.style.overflow = 'auto';
    }
  }, [itemId, activeTab, projects]);

  const handleOpenDrawer = (project) => {
    navigate(`/dashboard/${activeTab}/${project.id}`);
  };

  const handleCloseDrawer = () => {
    setIsApplying(false);
    setApplyForm({ linkedin: '', bio: '', reason: '' });
    navigate(`/dashboard/${activeTab}`);
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    if (!currentUser) return alert("Please log in first.");

    const { error } = await supabase.from('team_requests').insert([
      {
        idea_id: selectedProject.id,
        user_id: currentUser.id,
        linkedin_link: applyForm.linkedin,
        bio: applyForm.bio,
        reason: applyForm.reason
      }
    ]);

    if (error) {
      alert(error.message);
    } else {
      alert("Application sent successfully!");
      setIsApplying(false);
      setApplyForm({ linkedin: '', bio: '', reason: '' });
      fetchIdeas();
      handleCloseDrawer();
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'marketplace':
        return <Marketplace projects={projects} loading={loading} currentUser={currentUser} currentUserProfile={currentUserProfile} handleOpenDrawer={handleOpenDrawer} />;
      case 'your-ideas':
        return <YourIdeas projects={projects} loading={loading} currentUser={currentUser} currentUserProfile={currentUserProfile} handleOpenDrawer={handleOpenDrawer} fetchIdeas={fetchIdeas} />;
      case 'events':
        return <Events events={events} loadingEvents={loadingEvents} />;
      case 'manage-ideas':
        return isAdmin ? <ManageIdeas projects={projects} loading={loading} currentUser={currentUser} currentUserProfile={currentUserProfile} handleOpenDrawer={handleOpenDrawer} /> : null;
      case 'messages':
        return <Messages />;
      case 'settings':
        return <Settings />;
      default:
        return <Marketplace projects={projects} loading={loading} currentUser={currentUser} currentUserProfile={currentUserProfile} handleOpenDrawer={handleOpenDrawer} />;
    }
  };

  return (
    <div className="fd-container" style={{ overflowX: 'hidden' }}>
      {/* Sidebar */}
      <LeftSidebar
        activeTab={activeTab}
        setActiveTab={(t) => navigate(`/dashboard/${t}`)}
        isAdmin={isAdmin}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Main Content */}
      <main className={`fd-main ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <TopHeader toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <div style={{ padding: '0 1rem 2rem 1rem' }}>
          {/* Header Section */}
          <header className="fd-header">
            <div className="fd-header-content">
              <h1 className="fd-header-title">
                Welcome Back, {currentUserProfile?.full_name ? currentUserProfile.full_name.split(' ')[0] : 'Innovator'}! <br />

              </h1>
              <p className="fd-header-text">You have {projects.filter(p => p.author_id === currentUser?.id).reduce((acc, p) => acc + (p.team_requests?.filter(req => req.status === 'pending').length || 0), 0)} pending team requests.</p>
            </div>
            <button className="fd-post-btn" onClick={() => navigate('/post-idea')}>
              <span className="material-symbols-outlined">add_circle</span>
              POST YOUR IDEA
            </button>
          </header>

          {/* Tab Content */}
          {renderContent()}
        </div>
      </main>

      {/* Shared Project Drawer */}
      <ProjectDrawer
        selectedProject={selectedProject}
        handleCloseDrawer={handleCloseDrawer}
        activeTab={activeTab}
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
