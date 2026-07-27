import React from 'react';

export default function Settings() {
  return (
    <section>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: '12px', border: '1px dashed #e5e7eb', marginTop: '1rem' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: '#d1d5db', marginBottom: '1rem' }}>tune</span>
        <h3 style={{ color: '#111827', margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: '600' }}>Settings</h3>
        <p style={{ color: '#6b7280', margin: 0, textAlign: 'center', maxWidth: '400px', lineHeight: '1.5' }}>
          Account preferences, notification settings, and profile customization options are coming soon.
        </p>
      </div>
    </section>
  );
}
