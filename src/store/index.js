import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../supabaseClient';

// ─── Auth Store (no caching needed — Supabase session handles this) ───────────
export const useUserStore = create((set) => ({
  currentUser: null,
  currentUserProfile: null,
  loadingAuth: true,
  fetchUser: async (silent = false) => {
    if (!silent) set({ loadingAuth: true });
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      set({ currentUser: user, currentUserProfile: profile, loadingAuth: false });
    } else {
      set({ currentUser: null, currentUserProfile: null, loadingAuth: false });
    }
  },
  clearUser: () => set({ currentUser: null, currentUserProfile: null }),
}));

// ─── Idea Store (stale-while-revalidate via localStorage) ────────────────────
//
// Strategy:
//   1. On first load the store is hydrated from localStorage instantly.
//   2. If cached projects exist, loadingIdeas stays false → cards render
//      immediately from cache (stale).
//   3. fetchIdeas() always re-fetches in the background and updates the store
//      (revalidate), so users see fresh data seconds later without a spinner.
//
// Query is slimmed to card-essential fields only.  The heavy team_requests
// join is deferred to fetchIdeaDetails() which is called by ProjectDrawer
// only when the user actually opens a card.
export const useIdeaStore = create(
  persist(
    (set, get) => ({
      projects: [],
      loadingIdeas: true, // true only on the very first cold load (empty cache)

      fetchIdeas: async () => {
        // Only show the blocking spinner when the cache is empty
        const hasCachedData = get().projects.length > 0;
        if (!hasCachedData) set({ loadingIdeas: true });

        const { data, error } = await supabase
          .from('ideas')
          .select(`
            id,
            project_title,
            description,
            elevator_pitch,
            project_status,
            is_approved,
            is_hiring,
            hiring_openings,
            hiring_commitment,
            author_id,
            approved_by,
            created_at,
            profiles!ideas_author_id_fkey (
              full_name,
              avatar_url,
              persona
            ),
            admin_profile:profiles!ideas_approved_by_fkey (
              full_name
            ),
            team_requests ( id, status )
          `)
          .order('created_at', { ascending: false });

        if (!error && data) {
          set({ projects: data });
        }
        set({ loadingIdeas: false });
      },

      // Called by ProjectDrawer on open — fetches the heavy fields for ONE idea.
      // Returns the enriched project object; does NOT mutate the list store so
      // the card grid stays stable.
      fetchIdeaDetails: async (ideaId) => {
        const { data, error } = await supabase
          .from('ideas')
          .select(`
            *,
            profiles!ideas_author_id_fkey (
              full_name,
              email,
              mobile_number,
              persona,
              avatar_url
            ),
            admin_profile:profiles!ideas_approved_by_fkey ( full_name ),
            team_requests (
              id,
              status,
              bio,
              reason,
              linkedin_link,
              user_id,
              profiles!team_requests_user_id_fkey (
                full_name,
                email,
                mobile_number
              )
            )
          `)
          .eq('id', ideaId)
          .single();

        if (error) {
          console.error('fetchIdeaDetails error:', error.message);
          return null;
        }
        return data;
      },

      refreshIdeas: () => get().fetchIdeas(),
    }),
    {
      name: 'ideabox-ideas-cache',       // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist the card list, not the loading flag
      partialize: (state) => ({ projects: state.projects }),
      // After rehydration: if we have cached data, don't show the spinner
      onRehydrateStorage: () => (state) => {
        if (state && state.projects.length > 0) {
          state.loadingIdeas = false;
        }
      },
    }
  )
);

// ─── Event Store (unchanged) ──────────────────────────────────────────────────
export const useEventStore = create((set, get) => ({
  events: [],
  loadingEvents: true,
  fetchEvents: async () => {
    set({ loadingEvents: true });
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });

    if (!error && data) {
      set({ events: data });
    }
    set({ loadingEvents: false });
  },
  refreshEvents: () => get().fetchEvents(),
}));
