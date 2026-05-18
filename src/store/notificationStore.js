import { create } from 'zustand';
import { supabase } from '../supabaseClient';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

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
        loading: false
      });
    } else {
      set({ loading: false });
    }
  },

  markAsRead: async (notificationId) => {
    const { notifications } = get();
    const updated = notifications.map(n => n.id === notificationId ? { ...n, is_read: true } : n);
    set({
      notifications: updated,
      unreadCount: updated.filter(n => !n.is_read).length
    });

    await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
  },

  markAllAsRead: async (userId) => {
    const { notifications } = get();
    const updated = notifications.map(n => ({ ...n, is_read: true }));
    set({
      notifications: updated,
      unreadCount: 0
    });

    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
  },

  subscribeToNotifications: (userId) => {
    if (!userId) return null;
    const channel = supabase.channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const { notifications } = get();
          const newNotif = payload.new;
          const updated = [newNotif, ...notifications];
          set({
            notifications: updated,
            unreadCount: updated.filter(n => !n.is_read).length
          });
        }
      )
      .subscribe();
    return channel;
  },

  sendNotification: async ({ userId, title, message, type, link }) => {
    await supabase.from('notifications').insert({
      user_id: userId,
      title,
      message,
      type,
      link
    });
  },

  sendBroadcast: async ({ userIds, title, message, type, link }) => {
    // Insert in batches if many users, or just map
    const inserts = userIds.map(id => ({
      user_id: id,
      title,
      message,
      type,
      link
    }));
    await supabase.from('notifications').insert(inserts);
  }
}));
