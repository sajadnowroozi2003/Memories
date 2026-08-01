/**
 * timeline.js — loads content/timeline.json and renders it.
 * No hardcoded events: editing the story = editing the JSON file.
 */

const TimelineModule = (() => {

  async function load() {
    const container = document.getElementById('timeline-container');
    if (!container) return;
    try {
      const res = await fetch('content/timeline.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('timeline fetch failed');
      const events = await res.json();
      render(container, events);
    } catch (err) {
      console.warn('Timeline could not be loaded:', err);
      container.innerHTML = `<p class="section-desc">Our timeline is being written...</p>`;
    }
  }

  function render(container, events) {
    if (!Array.isArray(events) || !events.length) {
      container.innerHTML = `<p class="section-desc">Our timeline is just beginning.</p>`;
      return;
    }
    container.innerHTML = events.map(ev => `
      <div class="timeline-item glass-card">
        <div class="t-date">${escapeHtml(ev.date || '')}</div>
        <div class="t-title heading">${escapeHtml(ev.title || '')}</div>
        <div class="t-desc">${escapeHtml(ev.description || '')}</div>
        ${ev.image ? `<img src="assets/images/gallery/${escapeHtml(ev.image)}" alt="${escapeHtml(ev.title || '')}" loading="lazy" onerror="this.style.display='none'">` : ''}
      </div>
    `).join('');
    Effects.initScrollReveal('.timeline-item');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return { load };
})();
