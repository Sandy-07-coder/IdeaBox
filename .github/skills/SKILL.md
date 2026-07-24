---
name: supabase-zustand-data-layer
description: >
  Use this skill when adding a new data feature that reads from or writes to
  Supabase — including creating a Zustand store slice, writing typed queries
  with joins or filters, setting up a Realtime subscription, or sending
  in-app notifications. Triggers on tasks like "add a store for X", "subscribe
  to Y table changes", "send a notification when Z happens", or "fetch data
  with a join".
---

## Overview

This skill covers how data flows in IdeaBox: **Supabase JS v2** is the
database/auth/realtime layer; **Zustand v5** is the client-side state manager.
All server interactions live inside Zustand store files under `src/store/`.
Components never import `supabase` directly for data fetching — they call store
actions and read state via hooks.

Use this skill whenever you need to:
- Add or extend a Zustand store that talks to Supabase
- Write a query with foreign-key joins or row-level filters
- Subscribe to `postgres_changes` or Broadcast events in real time
- Send or broadcast in-app notifications via `useNotificationStore`

---

## 1 · Project Conventions

| Concern | Convention |
|---|---|
| Supabase client | Singleton exported from `src/supabaseClient.jsx` |
| Stores | One file per domain in `src/store/`; named `use<Domain>Store` |
| Auth store | `useUserStore` from `src/store/index.js` — always the source of `currentUser` |
| Env vars | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` in `.env` |
| Primary color | `#4F46E5` (indigo) — used in all UI feedback elements |

---

## 2 · Adding a New Zustand Store

**If the data domain doesn't have a store yet**, create `src/store/<domain>Store.js`:

```js
// src/store/widgetStore.js
import { create } from 'zustand';
import { supabase } from '../supabaseClient';

export const useWidgetStore = create((set, get) => ({
  widgets: [],
  loading: false,

  fetchWidgets: async (userId) => {
    if (!userId) return;
    set({ loading: true });
    const { data, error } = await supabase
      .from('widgets')
      .select('*, creator:profiles!widgets_creator_id_fkey(full_name, avatar_url)')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) set({ widgets: data });
    set({ loading: false });
  },

  addWidget: async (payload) => {
    const { error } = await supabase.from('widgets').insert(payload);
    if (!error) get().fetchWidgets(payload.owner_id);
    return { error };
  },

  refreshWidgets: () => get().fetchWidgets(/* pass userId */),
}));
```

**Rules:**
- Always guard early with `if (!userId) return;`
- Always toggle `loading` before and after the async call
- Expose a `refresh<Domain>` alias that re-calls the fetch — consumers use this after mutations
- Use `get()` inside actions to call sibling actions (avoids stale closure issues)

---

## 3 · Writing Supabase Queries

### Simple filter + ordering
```js
await supabase
  .from('ideas')
  .select('*')
  .eq('status', 'approved')
  .order('created_at', { ascending: false });
```

### Foreign-key join (named alias pattern)
Name the join with `!<fkey_name>` so Supabase resolves the correct FK when a
table has multiple FK references to the same target:

```js
// From src/store/index.js — ideas with author + admin profiles
await supabase
  .from('ideas')
  .select(`
    *,
    profiles!ideas_author_id_fkey(full_name, email, mobile_number, persona, avatar_url),
    admin_profile:profiles!ideas_approved_by_fkey(full_name),
    team_requests(*, profiles!team_requests_user_id_fkey(full_name, mobile_number, email))
  `)
  .order('created_at', { ascending: false });
```

### Upsert (presence / idempotent writes)
```js
await supabase
  .from('user_presence')
  .upsert(
    { user_id: userId, is_online: true, last_seen: new Date().toISOString() },
    { onConflict: 'user_id' }
  );
```

### Count-only query (avoid fetching rows)
```js
const { count } = await supabase
  .from('messages')
  .select('*', { count: 'exact', head: true })
  .eq('is_read', false);
```

### Call a Postgres RPC
```js
// From chatStore.js — get or create a conversation atomically
const { data, error } = await supabase.rpc('get_or_create_conversation', {
  user_a: currentUserId,
  user_b: otherUserId,
});
```

---

## 4 · Realtime Subscriptions

### `postgres_changes` — listen for new rows
Use a row-level filter so only relevant events arrive:

```js
// From notificationStore.js
subscribeToNotifications: (userId) => {
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
        const updated = [payload.new, ...notifications];
        set({
          notifications: updated,
          unreadCount: updated.filter(n => !n.is_read).length,
        });
      }
    )
    .subscribe();
  return channel; // store it so you can call supabase.removeChannel(channel) on cleanup
},
```

### Broadcast — ephemeral events (e.g., typing indicators)
```js
// Send
supabase.channel(`typing:${conversationId}`).send({
  type: 'broadcast',
  event: 'typing',
  payload: { userId, isTyping },
});

// Receive
const channel = supabase
  .channel(`typing:${conversationId}`)
  .on('broadcast', { event: 'typing' }, (payload) => {
    onTyping(payload.payload);
  })
  .subscribe();
```

**Always clean up channels** when the component unmounts or the conversation changes:
```js
// From chatStore.js cleanup action
cleanup: () => {
  const { realtimeChannel } = get();
  if (realtimeChannel) supabase.removeChannel(realtimeChannel);
  set({ realtimeChannel: null, messages: [], activeConversation: null });
},
```

---

## 5 · Sending In-App Notifications

All notification writes go through `useNotificationStore` — never call
`supabase.from('notifications').insert(...)` directly in a component.

### Single user
```js
const { sendNotification } = useNotificationStore.getState();
await sendNotification({
  userId: applicantId,
  title: 'Application Accepted 🎉',
  message: `You've been accepted to "${idea.title}".`,
  type: 'application',        // 'application' | 'idea' | 'event' | 'admin'
  link: `/dashboard/marketplace/${idea.id}`,
});
```

### Broadcast to all users (admin operations)
```js
// From AdminEvents.jsx — called after a new event is created
const { sendBroadcast } = useNotificationStore.getState();
const { data: profiles } = await supabase.from('profiles').select('id');
await sendBroadcast({
  userIds: profiles.map(p => p.id),
  title: 'New Event Launched! 📅',
  message: `Check out our new event: "${form.title}".`,
  type: 'event',
  link: `/dashboard/events/${newEventId}`,
});
```

> **Import pattern inside async action:** use `await import('../../store/notificationStore').then(m => m.useNotificationStore.getState())` when calling from a non-hook context (e.g., inside another store action).

---

## 6 · Auth & User State in Components

Always read `currentUser` from `useUserStore`, never from `supabase.auth` directly:

```js
import { useUserStore } from '../../store';

const { currentUser, currentUserProfile } = useUserStore();
// currentUser  → Supabase Auth user object (has .id, .email)
// currentUserProfile → row from public.profiles (has full_name, persona, avatar_url, …)
```

`fetchUser(silent = false)` is called automatically on `SIGNED_IN`, `TOKEN_REFRESHED`, tab focus, and visibility change — no need to call it manually inside feature components.

---

## 7 · Common Mistakes & Anti-Patterns

| ❌ Don't | ✅ Do instead |
|---|---|
| Import `supabase` in a component for data fetching | Put the query in a store action; call the action from the component |
| Forget `if (!userId) return` at the top of fetch actions | Guard every user-scoped fetch |
| Store the channel in component state | Store `realtimeChannel` inside the Zustand store and remove it in a `cleanup` action |
| Call `supabase.from('notifications').insert(...)` inline | Use `sendNotification` / `sendBroadcast` from `useNotificationStore` |
| Use `.select('*')` for joins with ambiguous FKs | Always name joins with the `!fkey_name` or `alias:table!fkey` syntax |
| Subscribe to `postgres_changes` without a `filter` | Always add `filter: \`column=eq.${value}\`` to scope the subscription |

---

## 8 · Edge Cases & Gotchas

- **Multiple FK references to the same table** (e.g., `ideas` has `author_id` and `approved_by` both pointing to `profiles`) — Supabase will error on an ambiguous `.select('*, profiles(*)')`. Always use the named FK alias: `profiles!ideas_author_id_fkey(...)`.

- **`fetchUser(true)`** — pass `silent = true` to skip setting `loadingAuth: true` during background refreshes; otherwise the whole app shows a spinner on tab focus.

- **Channel naming collisions** — each channel name must be unique per browser tab. Scope channel names with user/entity IDs (e.g., `notifications:${userId}`, `messages:${conversationId}`) not generic strings.

- **`useNotificationStore.getState()` inside store actions** — Zustand stores can't use `useXxxStore()` hooks (hooks-only rule). Call `.getState()` on the store reference or use `await import(...)` for cross-store calls as seen in `AdminEvents.jsx`.

- **Optimistic updates before the DB call** — `markAsRead` and `markAllAsRead` update local state first, then fire the Supabase update. Follow this pattern for all user-facing "instant" state changes to avoid UI lag.
