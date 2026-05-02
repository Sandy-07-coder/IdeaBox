import React from 'react';
import IdeaCard from './IdeaCard';

export default function Marketplace({ projects, loading, currentUser, currentUserProfile, handleOpenDrawer }) {
  // Regular users can only see approved ideas; admins see all
  const filteredProjects = projects.filter(project => {
    if (currentUserProfile?.user_role === 'admin') return true;
    return project.is_approved === true;
  });

  return (
    <section>
      <div className="fd-section-header">
        <h2 className="fd-section-title">Project Marketplace</h2>
        <div className="fd-filters">
          <button className="fd-filter-btn">
            <span className="material-symbols-outlined text-sm">filter_list</span> Filter
          </button>
          <button className="fd-filter-btn">
            <span className="material-symbols-outlined text-sm">sort</span> Trending
          </button>
        </div>
      </div>

      <div className="fd-grid">
        {loading ? (
          <p>Loading projects...</p>
        ) : filteredProjects.length === 0 ? (
          <p>No ideas posted yet. Be the first!</p>
        ) : (
          filteredProjects.map((project) => (
            <IdeaCard
              key={project.id}
              project={project}
              onClick={handleOpenDrawer}
              activeTab="marketplace"
              currentUser={currentUser}
              currentUserProfile={currentUserProfile}
            />
          ))
        )}
      </div>
    </section>
  );
}
