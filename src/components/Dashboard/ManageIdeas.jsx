import React from 'react';
import IdeaCard from './IdeaCard';

export default function ManageIdeas({ projects, loading, currentUser, currentUserProfile, handleOpenDrawer }) {
  return (
    <section>
      <div className="fd-section-header">
        <h2 className="fd-section-title">Manage All Ideas</h2>
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
        ) : projects.length === 0 ? (
          <p>No ideas found in the database.</p>
        ) : (
          projects.map((project) => (
            <IdeaCard
              key={project.id}
              project={project}
              onClick={handleOpenDrawer}
              activeTab="manage-ideas"
              currentUser={currentUser}
              currentUserProfile={currentUserProfile}
            />
          ))
        )}
      </div>
    </section>
  );
}
