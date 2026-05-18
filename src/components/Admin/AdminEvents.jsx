import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';

const emptyForm = {
  title: '',
  description: '',
  event_date: '',
  location: '',
  registration_link: '',
  thumbnail_url: '',
};

function EventForm({ initial = emptyForm, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
      <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.05rem', fontWeight: '700', color: '#111827' }}>
        {initial?.id ? 'Edit Event' : 'Create New Event'}
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#374151', marginBottom: '0.35rem' }}>Event Title *</label>
          <input value={form.title} onChange={e => set('title', e.target.value)} required placeholder="e.g. IdeaLab Pitch Day 2025" style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.9rem', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }} />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#374151', marginBottom: '0.35rem' }}>Description *</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} required placeholder="Describe the event..." rows={3} style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.9rem', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#374151', marginBottom: '0.35rem' }}>Date & Time *</label>
          <input type="datetime-local" value={form.event_date} onChange={e => set('event_date', e.target.value)} required style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.9rem', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#374151', marginBottom: '0.35rem' }}>Location</label>
          <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Main Hall / Online" style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.9rem', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#374151', marginBottom: '0.35rem' }}>Registration Link</label>
          <input type="url" value={form.registration_link} onChange={e => set('registration_link', e.target.value)} placeholder="https://..." style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.9rem', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#374151', marginBottom: '0.35rem' }}>Thumbnail URL</label>
          <input type="url" value={form.thumbnail_url} onChange={e => set('thumbnail_url', e.target.value)} placeholder="https://... (optional)" style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.9rem', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
        <button type="button" onClick={onCancel} style={{ padding: '0.6rem 1.25rem', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
          Cancel
        </button>
        <button
          type="button"
          disabled={saving || !form.title || !form.description || !form.event_date}
          onClick={() => onSave(form)}
          style={{ padding: '0.6rem 1.25rem', background: '#4F46E5', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>{initial?.id ? 'save' : 'add_circle'}</span>
          {saving ? 'Saving...' : (initial?.id ? 'Save Changes' : 'Create Event')}
        </button>
      </div>
    </div>
  );
}

export default function AdminEvents({ events, refreshEvents, currentUser }) {
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [copyMsg, setCopyMsg] = useState(null);

  const handleSave = async (form) => {
    setSaving(true);
    const payload = {
      title: form.title,
      description: form.description,
      event_date: form.event_date,
      location: form.location || null,
      registration_link: form.registration_link || null,
      thumbnail_url: form.thumbnail_url || null,
    };

    let error;
    if (form.id) {
      // Update
      ({ error } = await supabase.from('events').update(payload).eq('id', form.id));
    } else {
      // Insert
      const res = await supabase.from('events').insert({ ...payload, created_by: currentUser?.id }).select('id').single();
      error = res.error;
      
      if (!error && res.data) {
        // Broadcast notification
        const { data: profiles } = await supabase.from('profiles').select('id');
        if (profiles) {
          const { sendBroadcast } = await import('../../store/notificationStore').then(m => m.useNotificationStore.getState());
          await sendBroadcast({
            userIds: profiles.map(p => p.id),
            title: 'New Event Launched! 📅',
            message: `Check out our new event: "${form.title}".`,
            type: 'event',
            link: `/dashboard/events/${res.data.id}`
          });
        }
      }
    }

    setSaving(false);
    if (error) {
      alert('Error: ' + error.message);
    } else {
      setShowForm(false);
      setEditingEvent(null);
      refreshEvents();
    }
  };

  const handleDelete = async (event) => {
    if (!window.confirm(`Delete "${event.title}"? This cannot be undone.`)) return;
    setDeletingId(event.id);
    const { error } = await supabase.from('events').delete().eq('id', event.id);
    setDeletingId(null);
    if (error) alert('Error: ' + error.message);
    else refreshEvents();
  };

  const handleCopyLink = (event) => {
    const url = `${window.location.origin}/dashboard/events/${event.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopyMsg(event.id);
      setTimeout(() => setCopyMsg(null), 2000);
    });
  };

  const now = new Date();
  const upcoming = events.filter(e => new Date(e.event_date) >= now);
  const past = events.filter(e => new Date(e.event_date) < now);

  return (
    <section>
      <div className="fd-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="fd-section-title">Events Management</h2>
        {!showForm && !editingEvent && (
          <button
            onClick={() => setShowForm(true)}
            style={{ padding: '0.6rem 1.25rem', background: '#4F46E5', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>add</span>
            Create Event
          </button>
        )}
      </div>

      {/* Create form */}
      {showForm && !editingEvent && (
        <EventForm
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
          saving={saving}
        />
      )}

      {/* Edit form */}
      {editingEvent && (
        <EventForm
          initial={editingEvent}
          onSave={handleSave}
          onCancel={() => setEditingEvent(null)}
          saving={saving}
        />
      )}

      {/* Upcoming Events */}
      <div style={{ marginTop: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#111827', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: '#4F46E5' }}>upcoming</span>
          Upcoming ({upcoming.length})
        </h3>
        {upcoming.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', background: '#fff', borderRadius: '8px', border: '1px dashed #e5e7eb', color: '#9ca3af' }}>
            No upcoming events. Create one above!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {upcoming.map(ev => (
              <EventRow
                key={ev.id}
                event={ev}
                onEdit={() => { setEditingEvent({ ...ev, event_date: ev.event_date?.slice(0, 16) }); setShowForm(false); }}
                onDelete={() => handleDelete(ev)}
                onCopy={() => handleCopyLink(ev)}
                deleting={deletingId === ev.id}
                copied={copyMsg === ev.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Past Events */}
      {past.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#6b7280', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: '#9ca3af' }}>history</span>
            Past Events ({past.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', opacity: 0.75 }}>
            {past.map(ev => (
              <EventRow
                key={ev.id}
                event={ev}
                onEdit={() => { setEditingEvent({ ...ev, event_date: ev.event_date?.slice(0, 16) }); setShowForm(false); }}
                onDelete={() => handleDelete(ev)}
                onCopy={() => handleCopyLink(ev)}
                deleting={deletingId === ev.id}
                copied={copyMsg === ev.id}
                isPast
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function EventRow({ event, onEdit, onDelete, onCopy, deleting, copied, isPast }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '200px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: isPast ? '#f3f4f6' : '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', color: isPast ? '#9ca3af' : '#4F46E5' }}>event</span>
        </div>
        <div style={{ minWidth: 0 }}>
          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.title}</h4>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '0.85rem' }}>calendar_today</span>
              {new Date(event.event_date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
            {event.location && (
              <span style={{ fontSize: '0.78rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '0.85rem' }}>location_on</span>
                {event.location}
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, flexWrap: 'wrap', flex: '1 1 auto', justifyContent: 'flex-end', minWidth: '240px' }}>
        {/* Copy public link — uses /dashboard/events/:id (no /admin) */}
        <button
          onClick={onCopy}
          title={copied ? 'Copied!' : 'Copy shareable link (public URL)'}
          style={{ padding: '0.6rem 0.8rem', flex: 1, justifyContent: 'center', background: copied ? '#d1fae5' : '#f3f4f6', color: copied ? '#065f46' : '#6b7280', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', fontWeight: '600', transition: 'background 0.2s' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>{copied ? 'check' : 'link'}</span>
          {copied ? 'Copied!' : 'Share'}
        </button>
        <button
          onClick={onEdit}
          title="Edit event"
          style={{ padding: '0.6rem 0.8rem', flex: 1, justifyContent: 'center', background: '#e0e7ff', color: '#4F46E5', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', fontWeight: '600' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>edit</span>
          Edit
        </button>
        <button
          onClick={onDelete}
          disabled={deleting}
          title="Delete event"
          style={{ padding: '0.6rem 0.8rem', flex: 1, justifyContent: 'center', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: deleting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', fontWeight: '600', opacity: deleting ? 0.6 : 1 }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>delete</span>
          {deleting ? '...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}
