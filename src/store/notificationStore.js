import { create } from 'zustand';
import { supabase } from '../supabaseClient';

// ─── Notification type → sidebar section mapping ─────────────────────────────
// Notification rows are expected to have a `type` column whose value matches
// one of the keys below, or a `link` column that starts with /dashboard/<tab>.
// Supported types:
//   'idea_approved' | 'idea_rejected'  → 'your-ideas'
//   'hiring_application'               → 'hiring'
//   'new_event'                        → 'events'
//   'new_message'                      → 'messages'
const TYPE_TO_TAB = {
  idea_approved:       'your-ideas',
  idea_rejected:       'your-ideas',
  idea_edit_approved:  'your-ideas',
  idea_edit_rejected:  'your-ideas',
  hiring_application:  'hiring',
  hiring_accepted:     'hiring',
  hiring_rejected:     'hiring',
  new_event:           'events',
  new_message:         'messages',
};

const BADGE_TABS = ['your-ideas', 'hiring', 'events', 'messages'];

/** Derive per-section unread counts from a flat notification list. */
function buildBadges(notifications) {
  const counts = { 'your-ideas': 0, hiring: 0, events: 0, messages: 0 };
  for (const n of notifications) {
    if (n.is_read) continue;
    const tab = TYPE_TO_TAB[n.type] ?? null;
    if (tab && counts[tab] !== undefined) counts[tab]++;
  }
  return counts;
}

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  // Per-section badge counts
  badges: { 'your-ideas': 0, hiring: 0, events: 0, messages: 0 },
  loading: false,
  _channel: null,

  // ── Fetch all notifications for a user ─────────────────────────────────────
  fetchNotifications: async (userId) => {
    if (!userId) return;
    set({ loading: true });
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      set({
        notifications: data,
        unreadCount: data.filter(n => !n.is_read).length,
        badges: buildBadges(data),
        loading: false,
      });
    } else {
      set({ loading: false });
    }
  },

  // ── Subscribe to new notifications in real-time ────────────────────────────
  subscribeToNotifications: (userId) => {
    if (!userId) return null;

    // Clean up any previous channel
    const prev = get()._channel;
    if (prev) supabase.removeChannel(prev);

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const { notifications } = get();
          const newNotif = payload.new;
          const updated = [newNotif, ...notifications];
          set({
            notifications: updated,
            unreadCount: updated.filter(n => !n.is_read).length,
            badges: buildBadges(updated),
          });
        }
      )
      .subscribe();

    set({ _channel: channel });
    return channel;
  },

  // ── Clear badge for a section (called when user opens that tab) ────────────
  clearBadge: async (tab, userId) => {
    if (!BADGE_TABS.includes(tab)) return;

    // Optimistically clear the UI
    set(state => ({
      badges: { ...state.badges, [tab]: 0 },
    }));

    // Mark matching unread notifications as read in Supabase
    const types = Object.entries(TYPE_TO_TAB)
      .filter(([, t]) => t === tab)
      .map(([type]) => type);

    if (types.length === 0 || !userId) return;

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
      .in('type', types);

    // Re-sync unreadCount from updated local state
    const { notifications } = get();
    const updated = notifications.map(n =>
      !n.is_read && types.includes(n.type) ? { ...n, is_read: true } : n
    );
    set({
      notifications: updated,
      unreadCount: updated.filter(n => !n.is_read).length,
    });
  },

  // ── Mark a single notification as read ────────────────────────────────────
  markAsRead: async (notificationId) => {
    const { notifications } = get();
    const updated = notifications.map(n =>
      n.id === notificationId ? { ...n, is_read: true } : n
    );
    set({
      notifications: updated,
      unreadCount: updated.filter(n => !n.is_read).length,
      badges: buildBadges(updated),
    });
    await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
  },

  // ── Mark all as read ───────────────────────────────────────────────────────
  markAllAsRead: async (userId) => {
    const { notifications } = get();
    const updated = notifications.map(n => ({ ...n, is_read: true }));
    set({
      notifications: updated,
      unreadCount: 0,
      badges: { 'your-ideas': 0, hiring: 0, events: 0, messages: 0 },
    });
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
  },

  // ── Helpers used by other parts of the app ─────────────────────────────────
  sendNotification: async ({ userId, title, message, type, link }) => {
    await supabase.from('notifications').insert({ user_id: userId, title, message, type, link });
  },

  sendBroadcast: async ({ userIds, title, message, type, link }) => {
    const inserts = userIds.map(id => ({ user_id: id, title, message, type, link }));
    await supabase.from('notifications').insert(inserts);
  },

  // ── Cleanup ────────────────────────────────────────────────────────────────
  cleanup: () => {
    const { _channel } = get();
    if (_channel) supabase.removeChannel(_channel);
    set({ _channel: null });
  },
}));
