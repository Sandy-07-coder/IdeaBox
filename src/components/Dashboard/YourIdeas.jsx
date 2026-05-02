import React from 'react';
import IdeaCard from './IdeaCard';

export default function YourIdeas({ projects, loading, currentUser, currentUserProfile, handleOpenDrawer }) {
  const userProjects = projects.filter(p => p.author_id === currentUser?.id);

  return (
    <section>
      <div className="fd-section-header">
        <h2 className="fd-section-title">Your Managed Ideas</h2>
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
        ) : userProjects.length === 0 ? (
          <p>You haven't posted any ideas yet.</p>
        ) : (
          userProjects.map((project) => (
            <IdeaCard
              key={project.id}
              project={project}
              onClick={handleOpenDrawer}
              activeTab="your-ideas"
              currentUser={currentUser}
              currentUserProfile={currentUserProfile}
            />
          ))
        )}
      </div>
    </section>
  );
}
