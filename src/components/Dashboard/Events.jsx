import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function Events({ events, loadingEvents }) {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    if (itemId && events.length > 0) {
      const event = events.find(e => e.id === itemId);
      setSelectedEvent(event || null);
    } else {
      setSelectedEvent(null);
    }
  }, [itemId, events]);

  const handleSelectEvent = (event) => {
    if (event) {
      navigate(`/dashboard/events/${event.id}`);
    } else {
      navigate('/dashboard/events');
    }
  };

  const now = new Date();
  const upcomingEvents = events.filter(e => new Date(e.event_date) >= now);
  const pastEvents = events.filter(e => new Date(e.event_date) < now);

  return (
    <section>

      {loadingEvents ? (
        <p style={{ marginTop: '2rem' }}>Loading events...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', marginTop: '1rem' }}>
          {/* Upcoming Events */}
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>Upcoming Events</h3>
            {upcomingEvents.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '1.5rem' }}>
                {upcomingEvents.map(event => (
                  <div key={event.id} style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#111827', fontSize: '1.25rem', fontWeight: 'bold' }}>{event.title}</h3>
                    <p style={{ margin: '0 0 1rem 0', color: '#4b5563', fontSize: '0.9rem', flex: 1 }}>{event.description}</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#6b7280' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>calendar_today</span>
                        {new Date(event.event_date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>location_on</span>
                        {event.location}
                      </span>
                    </div>

                    <div style={{ width: '100%' }}>
                      <button
                        onClick={() => handleSelectEvent(event)}
                        style={{ display: 'block', width: '100%', border: 'none', cursor: 'pointer', textAlign: 'center', padding: '0.75rem', background: '#4F46E5', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontWeight: '600', transition: 'background 0.2s', boxShadow: '0 1px 2px rgba(79, 70, 229, 0.3)' }}
                        onMouseOver={e => e.currentTarget.style.background = '#4338ca'}
                        onMouseOut={e => e.currentTarget.style.background = '#4F46E5'}
                      >
                        View info
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '3rem 2rem', textAlign: 'center', background: '#fff', borderRadius: '8px', border: '1px dashed #e5e7eb', color: '#6b7280', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#d1d5db' }}>event_busy</span>
                <p style={{ margin: 0 }}>No upcoming events scheduled right now.</p>
              </div>
            )}
          </div>

          {/* Past Events */}
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>Past Events</h3>
            {pastEvents.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '1.5rem' }}>
                {pastEvents.map(event => (
                  <div key={event.id} style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', opacity: 0.8 }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#374151', fontSize: '1.15rem', fontWeight: 'bold' }}>{event.title}</h3>
                    <p style={{ margin: '0 0 1rem 0', color: '#6b7280', fontSize: '0.9rem', flex: 1 }}>{event.description}</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#6b7280' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>calendar_today</span>
                        {new Date(event.event_date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>location_on</span>
                        {event.location}
                      </span>
                    </div>

                    <div style={{ width: '100%' }}>
                      <button
                        onClick={() => handleSelectEvent(event)}
                        style={{ display: 'block', width: '100%', border: 'none', cursor: 'pointer', textAlign: 'center', padding: '0.75rem', background: '#e5e7eb', color: '#4b5563', textDecoration: 'none', borderRadius: '8px', fontWeight: '600' }}
                      >
                        View info
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#6b7280' }}>No past events yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => handleSelectEvent(null)}>
          <div style={{ background: '#fff', color: '#1f2937', padding: '2rem', borderRadius: '8px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => {
                  const url = `${window.location.origin}/dashboard/events/${selectedEvent.id}`;
                  navigator.clipboard.writeText(url);
                  alert('Event link copied to clipboard!');
                }} 
                style={{ background: '#e0e7ff', border: 'none', cursor: 'pointer', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.4rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', gap: '0.25rem' }}
                title="Copy event link"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>link</span>
                Copy Link
              </button>
              <button onClick={() => handleSelectEvent(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', padding: '0.2rem' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <h2 style={{ margin: '0 0 1rem 0', color: '#111827', fontSize: '1.75rem', fontWeight: 'bold', paddingRight: '8rem' }}>{selectedEvent.title}</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', color: '#4b5563', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: '#4F46E5' }}>calendar_today</span>
                <span>{new Date(selectedEvent.event_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: '#4F46E5' }}>location_on</span>
                <span>{selectedEvent.location}</span>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#111827', fontSize: '1.1rem' }}>About this event</h4>
              <p style={{ color: '#4b5563', lineHeight: '1.6' }}>{selectedEvent.description}</p>
            </div>

            {selectedEvent.requirements && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', color: '#111827', fontSize: '1.1rem' }}>Requirements</h4>
                <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <p style={{ margin: 0, color: '#4b5563', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{selectedEvent.requirements}</p>
                </div>
              </div>
            )}

            {selectedEvent.coordinators && selectedEvent.coordinators.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', color: '#111827', fontSize: '1.1rem' }}>Coordinators</h4>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {selectedEvent.coordinators.map((coordinator, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '36px', height: '36px', background: '#e0e7ff', color: '#4F46E5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                          {coordinator.name ? coordinator.name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div>
                          <p style={{ margin: '0 0 0.15rem 0', fontWeight: '600', color: '#111827', fontSize: '0.95rem' }}>{coordinator.name}</p>
                          <p style={{ margin: 0, color: '#6b7280', fontSize: '0.8rem' }}>{coordinator.role}</p>
                        </div>
                      </div>
                      {coordinator.linkedin_url && (
                        <a href={coordinator.linkedin_url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#4F46E5', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '500', padding: '0.35rem 0.75rem', background: '#fff', border: '1px solid #e0e7ff', borderRadius: '6px' }} onMouseOver={e => e.currentTarget.style.background = '#e0e7ff'} onMouseOut={e => e.currentTarget.style.background = '#fff'}>
                          LinkedIn
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
              {new Date(selectedEvent.event_date) > new Date() ? (
                selectedEvent.registration_link ? (
                  <a href={selectedEvent.registration_link} target="_blank" rel="noreferrer" style={{ display: 'block', width: '100%', textAlign: 'center', padding: '0.75rem', background: '#4F46E5', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold' }}>
                    Register now
                  </a>
                ) : (
                  <div style={{ display: 'block', width: '100%', textAlign: 'center', padding: '0.75rem', background: '#f3f4f6', color: '#6b7280', borderRadius: '6px', fontWeight: '500' }}>
                    Registration will open soon
                  </div>
                )
              ) : (
                <div style={{ display: 'block', width: '100%', textAlign: 'center', padding: '0.75rem', background: '#e5e7eb', color: '#6b7280', borderRadius: '6px', fontWeight: '500' }}>
                  Event Ended
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
