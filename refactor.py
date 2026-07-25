import re

with open('src/components/Dashboard/IdeaCard.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

old_card_div = '''    <div
      className="fd-card"
      onClick={() => onClick(project)}
      style={{ position: 'relative', cursor: 'pointer' }}
    >'''
new_card_div = '''    <div
      className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow border border-outline-variant/10 cursor-pointer group hover:-translate-y-1 transition-all duration-300 relative flex flex-col gap-4 overflow-hidden"
      onClick={() => onClick(project)}
    >
      {/* Featured top edge for Incubator style */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-primary sm:rounded-t-xl" />'''

text = text.replace(old_card_div, new_card_div)

text = text.replace('<div className="fd-card-topline" />', '')

text = text.replace('<div className="fd-card-header">', '<div className="flex flex-wrap items-start justify-between gap-2">')
text = text.replace('<h3 className="fd-card-title">', '<h3 className="font-headline font-black text-2xl tracking-tight text-on-surface leading-tight">')

text = text.replace('<p className="fd-card-desc" style={{ marginBottom: \'1.25rem\' }}>', '<p className="font-body text-sm text-on-surface-variant line-clamp-3 leading-relaxed mt-1">')

# Hiring Chips
old_hiring = '''          <span style={{
            fontSize: '0.75rem', fontWeight: '600',
            color: '#374151', background: '#f3f4f6',
            padding: '0.25rem 0.6rem', borderRadius: '4px',
          }}>
            {project.hiring_openings} opening{project.hiring_openings !== 1 ? 's' : ''}
          </span>
          {project.hiring_commitment && (
            <span style={{
              fontSize: '0.75rem', fontWeight: '600',
              color: '#374151', background: '#f3f4f6',
              padding: '0.25rem 0.6rem', borderRadius: '4px',
            }}>
              {project.hiring_commitment}
            </span>
          )}'''
new_hiring = '''          <span className="bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-md text-xs font-bold tracking-widest uppercase">
            {project.hiring_openings} opening{project.hiring_openings !== 1 ? 's' : ''}
          </span>
          {project.hiring_commitment && (
            <span className="bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-md text-xs font-bold tracking-widest uppercase">
              {project.hiring_commitment}
            </span>
          )}'''
text = text.replace(old_hiring, new_hiring)

btn_primary = '''<button
            className="fd-details-btn"
            style={{
              width: '100%', margin: 0,
              background: '#1d4ed8', color: '#ffffff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'background-color 0.15s ease',
            }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = '#1e40af'}
            onMouseOut={e  => e.currentTarget.style.backgroundColor = '#1d4ed8'}
          >'''
new_btn_primary = '''<button
            className="w-full flex items-center justify-center gap-2 primary-gradient text-on-primary py-3 rounded-xl font-bold hover:shadow-xl shadow-primary/20 transition-all active:scale-[0.98] mt-auto"
          >'''
text = text.replace(btn_primary, new_btn_primary)

btn_details_flex1 = '''<button
              className="fd-details-btn"
              style={{
                flex: 1, margin: 0,
                background: '#1d4ed8', color: '#ffffff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'background-color 0.15s ease',
              }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = '#1e40af'}
              onMouseOut={e  => e.currentTarget.style.backgroundColor = '#1d4ed8'}
            >'''
new_btn_flex1 = '''<button
              className="flex-1 flex items-center justify-center gap-2 primary-gradient text-on-primary py-3 rounded-xl font-bold hover:shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
            >'''
text = text.replace(btn_details_flex1, new_btn_flex1)

with open('src/components/Dashboard/IdeaCard.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

with open('src/components/Dashboard/Marketplace.jsx', 'r', encoding='utf-8') as f:
    mkt = f.read()

mkt = mkt.replace('<section>', '<section className="w-full max-w-7xl mx-auto py-8 font-body">')
mkt = mkt.replace('<div className="fd-section-header">', '<div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">')
mkt = mkt.replace('<h2 className="fd-section-title">', '<h2 className="text-3xl font-display font-black text-on-surface tracking-tight">')
mkt = mkt.replace('<div className="fd-filters">', '<div className="flex flex-wrap items-center gap-4">')
mkt = mkt.replace('<button className="fd-filter-btn">', '<button className="flex items-center gap-2 bg-surface-container-low hover:bg-surface-container px-5 py-2.5 rounded-xl text-on-surface font-medium transition-colors border border-outline-variant/20 shadow-sm shadow-primary/5">')
mkt = mkt.replace('<div className="fd-grid">', '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">')

with open('src/components/Dashboard/Marketplace.jsx', 'w', encoding='utf-8') as f:
    f.write(mkt)

