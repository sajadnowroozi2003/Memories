/**
 * gallery.js — photo gallery + fullscreen lightbox viewer.
 * Reads content/gallery.json. New photos = drop file in
 * assets/images/gallery/ + run scripts/generate-gallery.js
 * (or add an entry manually to gallery.json).
 */

const GalleryModule = (() => {
  let items = [];
  let currentIndex = 0;

  async function load() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;
    try {
      const res = await fetch('content/gallery.json', { cache: 'no-store' });
      items = res.ok ? await res.json() : [];
    } catch (err) {
      console.warn('Gallery could not be loaded:', err);
      items = [];
    }
    if (!items.length) {
      grid.innerHTML = `<p class="section-desc">Photos will appear here soon.</p>`;
      return;
    }
    grid.innerHTML = items.map((item, i) => `
      <div class="gallery-item reveal" data-index="${i}">
        <img src="assets/images/gallery/${item.image}" alt="${(item.caption || '').replace(/"/g,'')}" loading="lazy"
             onerror="this.closest('.gallery-item').style.display='none'">
      </div>
    `).join('');
    grid.querySelectorAll('.gallery-item').forEach(el => {
      el.addEventListener('click', () => openLightbox(Number(el.dataset.index)));
    });
    Effects.initScrollReveal('.gallery-item');
    buildLightbox();
  }

  function buildLightbox() {
    if (document.querySelector('.lightbox')) return;
    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML = `
      <span class="lb-close">✕</span>
      <span class="lb-nav lb-prev">‹</span>
      <div style="text-align:center;">
        <img src="" alt="">
        <div class="lb-caption"></div>
      </div>
      <span class="lb-nav lb-next">›</span>
    `;
    document.body.appendChild(lb);
    lb.querySelector('.lb-close').addEventListener('click', closeLightbox);
    lb.querySelector('.lb-prev').addEventListener('click', () => nav(-1));
    lb.querySelector('.lb-next').addEventListener('click', () => nav(1));
    lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });

    document.addEventListener('keydown', (e) => {
      if (!lb.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') nav(-1);
      if (e.key === 'ArrowRight') nav(1);
    });

    // swipe support
    let startX = 0;
    lb.addEventListener('touchstart', e => startX = e.touches[0].clientX, { passive: true });
    lb.addEventListener('touchend', e => {
      const diff = e.changedTouches[0].clientX - startX;
      if (Math.abs(diff) > 50) nav(diff > 0 ? -1 : 1);
    }, { passive: true });
  }

  function openLightbox(index) {
    currentIndex = index;
    updateLightbox();
    document.querySelector('.lightbox').classList.add('active');
    document.body.classList.add('no-scroll');
  }

  function closeLightbox() {
    document.querySelector('.lightbox').classList.remove('active');
    document.body.classList.remove('no-scroll');
  }

  function nav(dir) {
    currentIndex = (currentIndex + dir + items.length) % items.length;
    updateLightbox();
  }

  function updateLightbox() {
    const lb = document.querySelector('.lightbox');
    const item = items[currentIndex];
    lb.querySelector('img').src = `assets/images/gallery/${item.image}`;
    lb.querySelector('.lb-caption').textContent = item.caption || '';
  }

  return { load };
})();
