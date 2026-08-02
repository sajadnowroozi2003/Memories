/**
 * effects.js — visual effects & easter eggs
 * (particles, floating hearts, toast messages, secret interactions)
 */

const Effects = (() => {

  function toast(message, duration = 2600) {
    let el = document.querySelector('.toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = message;
    requestAnimationFrame(() => el.classList.add('show'));
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), duration);
  }

  // Lightweight golden particle field for preloader / password screen
  function goldParticles(canvas, opts = {}) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let raf;

    function resize() {
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
    }

    function init() {
      resize();
      const count = opts.count || 40;
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.8 + 0.4,
        vy: (Math.random() * 0.15 + 0.03) * devicePixelRatio,
        vx: (Math.random() - 0.5) * 0.08 * devicePixelRatio,
        a: Math.random() * 0.6 + 0.2
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * devicePixelRatio, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,175,55,${p.a})`;
        ctx.fill();
        p.y -= p.vy;
        p.x += p.vx;
        if (p.y < 0) p.y = canvas.height;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
      });
      raf = requestAnimationFrame(draw);
    }

    init();
    draw();
    window.addEventListener('resize', () => { cancelAnimationFrame(raf); init(); draw(); });
    return () => cancelAnimationFrame(raf);
  }

  // One-shot burst of gold particles (used on correct password)
  function goldBurst() {
    const wrap = document.createElement('div');
    wrap.className = 'gold-particles-burst';
    document.body.appendChild(wrap);
    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    wrap.appendChild(canvas);
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2, cy = canvas.height / 2;
    const particles = Array.from({ length: 90 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 3 + 1) * devicePixelRatio;
      return { x: cx, y: cy, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, r: Math.random() * 2 + 1 };
    });
    let frame = 0;
    function anim() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.life -= 0.012;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,175,55,${Math.max(p.life, 0)})`;
        ctx.fill();
      });
      frame++;
      if (frame < 130) requestAnimationFrame(anim);
      else wrap.remove();
    }
    anim();
  }

  function floatingHeart(x, y) {
    const h = document.createElement('div');
    h.className = 'floating-heart';
    h.textContent = '❤';
    h.style.left = (x - 10) + 'px';
    h.style.top = (y - 10) + 'px';
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 1700);
  }

  function heartsBurst(x, y) {
    for (let i = 0; i < 6; i++) {
      setTimeout(() => floatingHeart(x + (Math.random() * 60 - 30), y + (Math.random() * 20 - 10)), i * 80);
    }
  }

  // IntersectionObserver-based scroll reveal (used across sections)
  function initScrollReveal(selector = '.reveal, .timeline-item, .childhood-photo') {
    const items = document.querySelectorAll(selector);
    if (!items.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -60px 0px' });
    items.forEach(el => io.observe(el));
  }

  // Easter egg: logo click x5
  function initLogoEasterEgg(secrets) {
    const logo = document.querySelector('.site-logo');
    if (!logo) return;
    let clicks = 0, timer;
    logo.addEventListener('click', () => {
      clicks++;
      clearTimeout(timer);
      timer = setTimeout(() => clicks = 0, 1200);
      if (clicks >= 5) {
        clicks = 0;
        toast(secrets?.logoClickMessage || 'You found a hidden memory ❤️');
        showSecretImage();
      }
    });
  }

  function showSecretImage() {
    const src = CONFIG.secretImage;
    const isVideo = /\.(mp4|webm|mov|m4v)$/i.test(src);
    const mediaHtml = isVideo
      ? `<video src="${src}" controls autoplay playsinline style="width:100%;border-radius:12px;margin-bottom:16px;" onerror="this.style.display='none'"></video>`
      : `<img src="${src}" alt="secret" onerror="this.style.display='none'">`;
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.innerHTML = `
      <div class="modal-box glass-card">
        ${mediaHtml}
        <div class="script" style="font-size:1.6rem;">A hidden memory, just for us</div>
        <div class="modal-close">Tap to close</div>
      </div>`;
    overlay.addEventListener('click', (e) => {
      // don't close when interacting with video controls (play/pause/seek)
      if (isVideo && e.target.tagName === 'VIDEO') return;
      overlay.remove();
      const video = overlay.querySelector('video');
      if (video) video.pause();
    });
    document.body.appendChild(overlay);
  }

  // Easter egg: long-press on main/childhood photos
  function initLongPress(selector, secrets) {
    document.querySelectorAll(selector).forEach(el => {
      let timer;
      const start = () => { timer = setTimeout(() => toast(secrets?.longPressMessage || 'Some memories are only for us.'), 650); };
      const cancel = () => clearTimeout(timer);
      el.addEventListener('touchstart', start, { passive: true });
      el.addEventListener('touchend', cancel);
      el.addEventListener('mousedown', start);
      el.addEventListener('mouseup', cancel);
      el.addEventListener('mouseleave', cancel);
    });
  }

  // Easter egg: double-tap for floating hearts
  function initDoubleTapHearts(selector) {
    document.querySelectorAll(selector).forEach(el => {
      let lastTap = 0;
      el.addEventListener('click', (e) => {
        const now = Date.now();
        if (now - lastTap < 350) heartsBurst(e.clientX || (el.getBoundingClientRect().left + el.offsetWidth/2), e.clientY || (el.getBoundingClientRect().top + el.offsetHeight/2));
        lastTap = now;
      });
    });
  }

  return { toast, goldParticles, goldBurst, heartsBurst, initScrollReveal, initLogoEasterEgg, initLongPress, initDoubleTapHearts, showSecretImage };
})();
