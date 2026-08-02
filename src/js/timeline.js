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
    container.innerHTML = events.map((ev, i) => `
      <div class="timeline-item glass-card">
        <div class="t-date">${escapeHtml(ev.date || '')}</div>
        <div class="t-title heading">${escapeHtml(ev.title || '')}</div>
        <div class="t-desc">${escapeHtml(ev.description || '')}</div>
        ${ev.image ? mediaTag(ev.image, ev.title, i) : ''}
      </div>
    `).join('');
    Effects.initScrollReveal('.timeline-item');
    initVideoPlayButtons(container);
  }

  function mediaTag(filename, title, index) {
    const src = `assets/images/gallery/${escapeHtml(filename)}`;
    const isVideo = /\.(mp4|webm|mov|m4v)$/i.test(filename);
    if (isVideo) {
      return `
        <div class="timeline-video-wrap" data-video-id="tl-video-${index}">
          <video id="tl-video-${index}" src="${src}" playsinline preload="metadata" onerror="this.closest('.timeline-video-wrap').style.display='none'"></video>
          <button class="tl-play-btn" type="button" aria-label="Play video">▶</button>
        </div>`;
    }
    return `<img src="${src}" alt="${escapeHtml(title || '')}" loading="lazy" onerror="this.style.display='none'">`;
  }

  function initVideoPlayButtons(container) {
    container.querySelectorAll('.timeline-video-wrap').forEach(wrap => {
      const video = wrap.querySelector('video');
      const btn = wrap.querySelector('.tl-play-btn');

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (video.paused) {
          video.setAttribute('controls', '');
          video.play();
          wrap.classList.add('playing');
        } else {
          video.pause();
        }
      });

      video.addEventListener('play', () => wrap.classList.add('playing'));
      video.addEventListener('pause', () => wrap.classList.remove('playing'));
      video.addEventListener('ended', () => {
        wrap.classList.remove('playing');
        video.removeAttribute('controls');
      });
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return { load };
})();
