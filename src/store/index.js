import { create } from 'zustand';
import { supabase } from '../supabaseClient';

export const useUserStore = create((set) => ({
  currentUser: null,
  currentUserProfile: null,
  loadingAuth: true,
  fetchUser: async () => {
    set({ loadingAuth: true });
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      set({ currentUser: user, currentUserProfile: profile, loadingAuth: false });
    } else {
      set({ currentUser: null, currentUserProfile: null, loadingAuth: false });
    }
  },
  clearUser: () => set({ currentUser: null, currentUserProfile: null })
}));

export const useIdeaStore = create((set, get) => ({
  projects: [],
  loadingIdeas: true,
  fetchIdeas: async () => {
    set({ loadingIdeas: true });
    const { data, error } = await supabase
      .from('ideas')
      .select('*, profiles!ideas_author_id_fkey(full_name, mobile_number, persona), admin_profile:profiles!ideas_approved_by_fkey(full_name), team_requests(*, profiles!team_requests_user_id_fkey(full_name, mobile_number, email))')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      set({ projects: data });
    }
    set({ loadingIdeas: false });
  },
  refreshIdeas: () => get().fetchIdeas(),
}));

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
  refreshEvents: () => get().fetchEvents()
}));
