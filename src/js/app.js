/**
 * app.js — main application orchestrator.
 * Wires together the preloader, password gate, cinematic intro,
 * and every content section. All personal data comes from CONFIG
 * and the /content JSON + markdown files — nothing is hardcoded here.
 */

document.addEventListener('DOMContentLoaded', () => {
  applyConfigToDOM();
  runPreloader();
  initPasswordGate();
  initIntro();
  initChildhood();
  initLetter();
  initOurPlace();
  initMemoryJar();
  initAnniversaryCounter();
  initYearMessage();
  initFutureLetter();
  initEasterEggs();
  Effects.initScrollReveal();
  MusicModule.init();
  TimelineModule.load();
  GalleryModule.load();
  PWAModule.init();
});

/* ---------- Apply config values to static DOM text ---------- */
function applyConfigToDOM() {
  document.title = CONFIG.site.title;
  document.documentElement.lang = CONFIG.site.language || 'en';

  document.querySelectorAll('[data-config]').forEach(el => {
    const path = el.dataset.config.split('.');
    let val = CONFIG;
    for (const key of path) val = val?.[key];
    if (val !== undefined) el.textContent = val;
  });

  document.querySelectorAll('[data-config-src]').forEach(el => {
    const path = el.dataset.configSrc.split('.');
    let val = CONFIG;
    for (const key of path) val = val?.[key];
    if (val) el.src = val;
  });
}

/* ---------- Preloader ---------- */
function runPreloader() {
  const preloader = document.getElementById('preloader');
  const canvas = preloader?.querySelector('canvas');
  if (canvas) Effects.goldParticles(canvas, { count: 30 });

  const textEl = document.getElementById('preloader-text');
  if (textEl) {
    const text = textEl.dataset.text || '';
    textEl.innerHTML = text.split('').map((ch, i) =>
      `<span class="letter" style="animation-delay:${i * 0.045}s">${ch === ' ' ? '&nbsp;' : ch}</span>`
    ).join('');
  }

  window.addEventListener('load', () => {
    setTimeout(() => preloader?.classList.add('hidden'), 1600);
  });
  // fallback in case 'load' already fired
  setTimeout(() => preloader?.classList.add('hidden'), 3200);
}

/* ---------- Password gate ---------- */
function initPasswordGate() {
  const screen = document.getElementById('password-screen');
  const canvas = screen?.querySelector('canvas');
  if (canvas) Effects.goldParticles(canvas, { count: 24 });

  const input = document.getElementById('memory-password');
  const btn = document.getElementById('unlock-btn');
  const errorEl = document.querySelector('.password-error');

  if (Auth.isUnlocked()) {
    screen?.classList.add('hidden');
    return;
  }

  async function attempt() {
    const val = input.value;
    if (!val) return;
    const ok = await Auth.checkMemoryPassword(val);
    if (ok) {
      Auth.setUnlocked();
      screen.classList.add('unlocking');
      Effects.goldBurst();
      setTimeout(() => screen.classList.add('hidden'), 1400);
    } else {
      input.classList.add('shake');
      errorEl.textContent = 'This memory is protected ❤️  Try again.';
      errorEl.classList.add('show');
      setTimeout(() => input.classList.remove('shake'), 500);
    }
  }

  btn?.addEventListener('click', attempt);
  input?.addEventListener('keydown', (e) => { if (e.key === 'Enter') attempt(); });
}

/* ---------- Cinematic intro ---------- */
function initIntro() {
  const intro = document.getElementById('intro-screen');
  const lines = intro?.querySelectorAll('.intro-line');
  const startBtn = document.getElementById('intro-start-btn');
  if (!intro) return;

  // watch for password screen becoming hidden -> trigger intro
  const passwordScreen = document.getElementById('password-screen');
  const observer = new MutationObserver(() => {
    if (passwordScreen.classList.contains('hidden')) {
      intro.classList.add('active');
      lines.forEach((line, i) => setTimeout(() => line.classList.add('show'), 600 + i * 1600));
      setTimeout(() => startBtn?.classList.add('show'), 600 + lines.length * 1600);
      observer.disconnect();
    }
  });
  observer.observe(passwordScreen, { attributes: true, attributeFilter: ['class'] });

  // if already unlocked on load (returning visitor), skip straight to content but still show a light intro
  if (Auth.isUnlocked()) {
    intro.classList.add('active');
    lines.forEach((line, i) => setTimeout(() => line.classList.add('show'), 300 + i * 900));
    setTimeout(() => startBtn?.classList.add('show'), 300 + lines.length * 900);
  }

  startBtn?.addEventListener('click', () => {
    intro.classList.add('hidden');
    document.body.classList.remove('no-scroll');
    document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' });
  });
}

/* ---------- Childhood section modal ---------- */
function initChildhood() {
  document.querySelectorAll('.childhood-photo').forEach(photo => {
    photo.addEventListener('click', () => {
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay active';
      overlay.innerHTML = `
        <div class="modal-box glass-card">
          <img src="${photo.dataset.full || photo.querySelector('img').src}" alt="">
          <div class="heading" style="font-size:1.3rem;">${photo.dataset.label || ''}</div>
          <div class="modal-close">Tap to close</div>
        </div>`;
      overlay.addEventListener('click', () => overlay.remove());
      document.body.appendChild(overlay);
    });
  });
}

/* ---------- Love letter ---------- */
function initLetter() {
  const envelope = document.getElementById('envelope');
  const paper = document.getElementById('letter-paper');
  const openBtn = document.getElementById('open-letter-btn');
  if (!envelope || !paper) return;

  let loaded = false;
  async function openLetter() {
    envelope.classList.add('open');
    if (!loaded) {
      loaded = true;
      try {
        const res = await fetch('content/letter.md', { cache: 'no-store' });
        const md = await res.text();
        paper.innerHTML = renderMarkdown(md);
      } catch (err) {
        paper.innerHTML = '<p>Our letter is being written...</p>';
      }
    }
    setTimeout(() => paper.classList.add('open'), 400);
  }

  envelope.addEventListener('click', openLetter);
  openBtn?.addEventListener('click', openLetter);
}

// Minimal markdown -> HTML (headings, bold, italic, paragraphs) — no external dependency needed
function renderMarkdown(md) {
  const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const lines = escape(md).trim().split(/\n{2,}/);
  return lines.map(block => {
    if (/^###\s+/.test(block)) return `<h3>${block.replace(/^###\s+/, '')}</h3>`;
    if (/^##\s+/.test(block)) return `<h2>${block.replace(/^##\s+/, '')}</h2>`;
    if (/^#\s+/.test(block)) return `<h1>${block.replace(/^#\s+/, '')}</h1>`;
    let html = block
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
    return `<p>${html}</p>`;
  }).join('');
}

/* ---------- Our place ---------- */
function initOurPlace() {
  const btn = document.getElementById('open-map-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const { latitude, longitude } = CONFIG.location;
    window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank');
  });
}

/* ---------- Memory jar ---------- */
function initMemoryJar() {
  const jar = document.getElementById('memory-jar');
  const msgEl = document.getElementById('jar-message');
  if (!jar || !msgEl) return;

  let memories = [];
  fetch('content/memories.json', { cache: 'no-store' })
    .then(r => r.ok ? r.json() : [])
    .then(data => memories = data)
    .catch(() => memories = []);

  jar.addEventListener('click', () => {
    if (!memories.length) { Effects.toast('Our memory jar is still filling up...'); return; }
    const pick = memories[Math.floor(Math.random() * memories.length)];
    msgEl.textContent = pick;
    msgEl.classList.remove('show');
    void msgEl.offsetWidth; // restart transition
    msgEl.classList.add('show');
  });
}

/* ---------- Anniversary counter ---------- */
function initAnniversaryCounter() {
  const el = document.getElementById('anniversary-counter');
  if (!el) return;
  const start = new Date(CONFIG.dates.anniversary).getTime();
  if (isNaN(start)) return;

  const daysEl = el.querySelector('.c-days');
  const hoursEl = el.querySelector('.c-hours');
  const minsEl = el.querySelector('.c-mins');
  const secsEl = el.querySelector('.c-secs');

  function tick() {
    const diff = Math.max(Date.now() - start, 0);
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    if (daysEl) daysEl.textContent = String(days).padStart(3, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minsEl) minsEl.textContent = String(mins).padStart(2, '0');
    if (secsEl) secsEl.textContent = String(secs).padStart(2, '0');
  }
  tick();
  setInterval(tick, 1000);
}

/* ---------- Yearly message system ---------- */
async function initYearMessage() {
  const titleEl = document.getElementById('year-message-title');
  const textEl = document.getElementById('year-message-text');
  if (!titleEl || !textEl) return;

  const start = new Date(CONFIG.dates.anniversary).getTime();
  const years = Math.max(Math.floor((Date.now() - start) / (365.25 * 86400000)), 0);

  let messages = [];
  try {
    const res = await fetch('content/yearMessages.json', { cache: 'no-store' });
    messages = res.ok ? await res.json() : [];
  } catch (err) { messages = []; }

  const match = messages.find(m => m.year === years) || messages.find(m => m.year === Math.max(years, 1));
  if (match) {
    titleEl.textContent = match.title;
    textEl.textContent = match.text;
  } else {
    titleEl.textContent = `${years === 0 ? 'Our first year' : years + ' years later...'}`;
    textEl.textContent = 'Every year with you is a new chapter.';
  }
}

/* ---------- Future letter (time capsule) ---------- */
function initFutureLetter() {
  const box = document.getElementById('future-box');
  const msgEl = document.getElementById('future-message');
  const section = document.getElementById('future-letter-section');
  if (!box || !CONFIG.futureLetter?.enabled) {
    section?.remove();
    return;
  }

  const unlockDate = new Date(CONFIG.futureLetter.unlockDate).getTime();
  const isUnlockedByDate = Date.now() >= unlockDate;

  box.addEventListener('click', () => {
    if (isUnlockedByDate) {
      msgEl.textContent = CONFIG.futureLetter.message;
      msgEl.classList.add('show');
      Effects.goldBurst();
    } else {
      box.classList.add('shake');
      msgEl.textContent = CONFIG.futureLetter.teaser;
      msgEl.classList.add('show');
      setTimeout(() => box.classList.remove('shake'), 500);
    }
  });

  if (isUnlockedByDate) {
    box.querySelector('.lock-icon').textContent = '🔓';
  }
}

/* ---------- Easter eggs wiring ---------- */
async function initEasterEggs() {
  let secrets = {};
  try {
    const res = await fetch('content/secrets.json', { cache: 'no-store' });
    secrets = res.ok ? await res.json() : {};
  } catch (err) { secrets = {}; }

  Effects.initLogoEasterEgg(secrets);
  Effects.initLongPress('.childhood-photo, #main-photo', secrets);
  if (secrets.doubleTapEnabled !== false) {
    Effects.initDoubleTapHearts('.childhood-photo, #main-photo, .gallery-item');
  }
}
