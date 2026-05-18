import { create } from 'zustand';
import { supabase } from '../supabaseClient';

export const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  loadingConversations: true,
  loadingMessages: false,
  unreadCount: 0,
  onlineUsers: {},
  typingUsers: {},
  realtimeChannel: null,
  presenceChannel: null,

  // Fetch all conversations for the current user
  fetchConversations: async (userId) => {
    if (!userId) return;
    set({ loadingConversations: true });

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant_1_profile:profiles!conversations_participant_1_fkey(id, full_name, avatar_url, persona),
        participant_2_profile:profiles!conversations_participant_2_fkey(id, full_name, avatar_url, persona)
      `)
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (!error && data) {
      // Attach the "other person" info to each conversation
      const convos = data.map(c => {
        const otherProfile = c.participant_1 === userId
          ? c.participant_2_profile
          : c.participant_1_profile;
        const otherId = c.participant_1 === userId ? c.participant_2 : c.participant_1;
        return { ...c, otherProfile, otherId };
      });

      // Get last message for each conversation
      const convoIds = convos.map(c => c.id);
      if (convoIds.length > 0) {
        const { data: lastMsgs } = await supabase
          .from('messages')
          .select('*')
          .in('conversation_id', convoIds)
          .order('created_at', { ascending: false });

        // Group by conversation and pick the latest
        const lastMsgMap = {};
        lastMsgs?.forEach(m => {
          if (!lastMsgMap[m.conversation_id]) {
            lastMsgMap[m.conversation_id] = m;
          }
        });

        convos.forEach(c => {
          c.lastMessage = lastMsgMap[c.id] || null;
        });
      }

      set({ conversations: convos });
    }
    set({ loadingConversations: false });
  },

  // Fetch unread message count
  fetchUnreadCount: async (userId) => {
    if (!userId) return;
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .neq('sender_id', userId)
      .eq('is_read', false)
      .in('conversation_id', 
        (await supabase
          .from('conversations')
          .select('id')
          .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
        ).data?.map(c => c.id) || []
      );
    set({ unreadCount: count || 0 });
  },

  // Fetch messages for a conversation
  fetchMessages: async (conversationId) => {
    set({ loadingMessages: true });
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      set({ messages: data });
    }
    set({ loadingMessages: false });
  },

  // Send a message
  sendMessage: async (conversationId, senderId, content) => {
    const { error } = await supabase
      .from('messages')
      .insert({ conversation_id: conversationId, sender_id: senderId, content });

    if (!error) {
      // Update conversation last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);
    }
    return { error };
  },

  // Mark messages as read
  markAsRead: async (conversationId, userId) => {
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('is_read', false);
  },

  // Get or create a conversation with another user
  startConversation: async (currentUserId, otherUserId) => {
    const { data, error } = await supabase.rpc('get_or_create_conversation', {
      user_a: currentUserId,
      user_b: otherUserId,
    });

    if (error) {
      console.error('Error starting conversation:', error);
      return null;
    }
    // Refresh conversations
    await get().fetchConversations(currentUserId);
    return data; // Returns conversation ID
  },

  // Set active conversation
  setActiveConversation: (conv) => set({ activeConversation: conv }),

  // Subscribe to realtime messages for a conversation
  subscribeToMessages: (conversationId, userId) => {
    // Clean up previous subscription
    const prev = get().realtimeChannel;
    if (prev) {
      supabase.removeChannel(prev);
    }

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const newMsg = payload.new;
          // Fetch sender profile
          const { data: sender } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', newMsg.sender_id)
            .single();

          const msgWithSender = { ...newMsg, sender };

          set(state => ({
            messages: [...state.messages, msgWithSender],
          }));

          // Auto-mark as read if we're viewing this conversation
          if (newMsg.sender_id !== userId) {
            await get().markAsRead(conversationId, userId);
          }
        }
      )
      .subscribe();

    set({ realtimeChannel: channel });
  },

  // Subscribe to global messages (for unread count in header)
  subscribeToGlobalMessages: (userId) => {
    const channel = supabase
      .channel('global-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          if (payload.new.sender_id !== userId) {
            // Refresh unread count and conversations
            get().fetchUnreadCount(userId);
            get().fetchConversations(userId);
          }
        }
      )
      .subscribe();

    return channel;
  },

  // Update user presence
  updatePresence: async (userId, isOnline) => {
    if (!userId) return;
    await supabase
      .from('user_presence')
      .upsert({ user_id: userId, is_online: isOnline, last_seen: new Date().toISOString() }, { onConflict: 'user_id' });
  },

  // Fetch presence for a list of user IDs
  fetchPresence: async (userIds) => {
    if (!userIds || userIds.length === 0) return;
    const { data } = await supabase
      .from('user_presence')
      .select('*')
      .in('user_id', userIds);

    if (data) {
      const map = {};
      data.forEach(p => { map[p.user_id] = p; });
      set({ onlineUsers: map });
    }
  },

  // Broadcast typing indicator
  broadcastTyping: (conversationId, userId, isTyping) => {
    supabase.channel(`typing:${conversationId}`).send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId, isTyping },
    });
  },

  // Subscribe to typing events
  subscribeToTyping: (conversationId, onTyping) => {
    const channel = supabase
      .channel(`typing:${conversationId}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        onTyping(payload.payload);
      })
      .subscribe();
    return channel;
  },

  // Cleanup
  cleanup: () => {
    const { realtimeChannel, presenceChannel } = get();
    if (realtimeChannel) supabase.removeChannel(realtimeChannel);
    if (presenceChannel) supabase.removeChannel(presenceChannel);
    set({ realtimeChannel: null, presenceChannel: null, messages: [], activeConversation: null });
  },
}));
