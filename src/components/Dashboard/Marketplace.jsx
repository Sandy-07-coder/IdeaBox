import React from 'react';
import IdeaCard from './IdeaCard';

export default function Marketplace({ projects, loading, currentUser, currentUserProfile, handleOpenDrawer }) {
  // Regular users can only see approved ideas; admins see all
  const filteredProjects = projects.filter(project => {
    if (currentUserProfile?.user_role === 'admin') return true;
    return project.is_approved === true;
  });

  return (
    <section className="w-full">
      {/* Hero Header Section */}
      <div className="mb-8 lg:mb-12">
        <h3 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-on-surface mb-2">
          Explore the Marketplace
        </h3>
        <p className="text-on-surface-variant text-base lg:text-lg">Let’s build your legacy. Explore the latest opportunities.</p>
      </div>

      {/* Project Marketplace Grid */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <h4 className="text-xl lg:text-2xl font-bold tracking-tight">Project Marketplace</h4>
        <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high rounded-xl text-xs font-bold uppercase tracking-wider transition-colors">
          <span className="material-symbols-outlined text-sm">filter_list</span>
          <span>Filters</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
