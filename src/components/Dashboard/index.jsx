import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  // UI State
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState('marketplace');
  const [isApplying, setIsApplying] = useState(false);
  const [applyForm, setApplyForm] = useState({ linkedin: '', bio: '', reason: '' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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

  const handleOpenDrawer = (project) => {
    setSelectedProject(project);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseDrawer = () => {
    setSelectedProject(null);
    setIsApplying(false);
    setApplyForm({ linkedin: '', bio: '', reason: '' });
    document.body.style.overflow = 'auto';
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
        return <YourIdeas projects={projects} loading={loading} currentUser={currentUser} currentUserProfile={currentUserProfile} handleOpenDrawer={handleOpenDrawer} />;
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
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Main Content */}
      <main className="fd-main" style={{ marginLeft: isSidebarOpen ? '16rem' : '0', width: isSidebarOpen ? 'calc(100% - 16rem)' : '100%', transition: 'all 0.3s ease', padding: 0 }}>
        <TopHeader toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <div style={{ padding: '0 2rem 2rem 2rem' }}>
          {/* Header Section */}
          <header className="fd-header">
            <div className="fd-header-content">
              <h1 className="fd-header-title">
                Welcome Back, {currentUserProfile?.full_name ? currentUserProfile.full_name.split(' ')[0] : 'Innovator'}! <br />
                <span>Let's build your legacy.</span>
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
