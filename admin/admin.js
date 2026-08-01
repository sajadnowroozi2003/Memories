/**
 * admin.js — powers the admin panel.
 * Static hosting has no server, so this panel edits content in memory
 * and lets you copy/paste the result back into the JSON/MD files —
 * it does not write to disk or a database.
 */

document.addEventListener('DOMContentLoaded', () => {
  initLogin();
  document.getElementById('hash-btn').addEventListener('click', async () => {
    const val = document.getElementById('hash-input').value;
    if (!val) return;
    const hash = await Auth.sha256(val);
    document.getElementById('hash-output').value = hash;
  });
});

function initLogin() {
  const loginScreen = document.getElementById('login-screen');
  const app = document.getElementById('admin-app');
  const input = document.getElementById('admin-password');
  const btn = document.getElementById('admin-login-btn');
  const err = document.getElementById('admin-error');

  if (Auth.isAdminSessionValid()) {
    enter();
  }

  async function attempt() {
    const ok = await Auth.checkAdminPassword(input.value);
    if (ok) {
      Auth.setAdminSession();
      enter();
    } else {
      err.textContent = 'Incorrect admin password.';
      err.classList.add('show');
    }
  }

  function enter() {
    loginScreen.style.display = 'none';
    app.style.display = 'block';
    document.body.classList.remove('no-scroll');
    loadDashboard();
    initGalleryEditor();
    initTimelineEditor();
    initLetterEditor();
  }

  btn.addEventListener('click', attempt);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') attempt(); });
}

async function fetchJSON(path, fallback) {
  try {
    const res = await fetch('../' + path, { cache: 'no-store' });
    return res.ok ? await res.json() : fallback;
  } catch (e) { return fallback; }
}

async function loadDashboard() {
  const [gallery, timeline, memories] = await Promise.all([
    fetchJSON('content/gallery.json', []),
    fetchJSON('content/timeline.json', []),
    fetchJSON('content/memories.json', [])
  ]);
  const stats = document.getElementById('stats');
  stats.innerHTML = `
    <div class="stat-card glass-card"><div class="stat-num">${gallery.length}</div><div class="stat-label">Photos</div></div>
    <div class="stat-card glass-card"><div class="stat-num">${timeline.length}</div><div class="stat-label">Timeline Items</div></div>
    <div class="stat-card glass-card"><div class="stat-num">${memories.length}</div><div class="stat-label">Memories</div></div>
    <div class="stat-card glass-card"><div class="stat-num" style="font-size:1rem;">${new Date().toLocaleDateString()}</div><div class="stat-label">Last Checked</div></div>
  `;
}

/* ---------- Gallery editor ---------- */
async function initGalleryEditor() {
  let items = await fetchJSON('content/gallery.json', []);
  const editor = document.getElementById('gallery-editor');
  const output = document.getElementById('gallery-output');

  function render() {
    editor.innerHTML = items.map((item, i) => `
      <div class="row" data-index="${i}" style="margin-bottom:10px;">
        <input type="text" class="g-image" placeholder="filename.jpg" value="${item.image || ''}" style="flex:1;">
        <input type="text" class="g-caption" placeholder="caption" value="${item.caption || ''}" style="flex:2;">
        <button class="btn-gold btn-small g-remove">✕</button>
      </div>
    `).join('');
    editor.querySelectorAll('.row').forEach(row => {
      const idx = Number(row.dataset.index);
      row.querySelector('.g-image').addEventListener('input', (e) => { items[idx].image = e.target.value; sync(); });
      row.querySelector('.g-caption').addEventListener('input', (e) => { items[idx].caption = e.target.value; sync(); });
      row.querySelector('.g-remove').addEventListener('click', () => { items.splice(idx, 1); render(); sync(); });
    });
    sync();
  }

  function sync() { output.value = JSON.stringify(items, null, 2); }

  document.getElementById('gallery-add-row').addEventListener('click', () => {
    items.push({ image: '', caption: '' });
    render();
  });

  render();
}

/* ---------- Timeline editor ---------- */
async function initTimelineEditor() {
  let items = await fetchJSON('content/timeline.json', []);
  const editor = document.getElementById('timeline-editor');
  const output = document.getElementById('timeline-output');

  function render() {
    editor.innerHTML = items.map((item, i) => `
      <div data-index="${i}" style="margin-bottom:18px; padding-bottom:14px; border-bottom:1px solid var(--glass-border);">
        <input type="text" class="tl-date" placeholder="Date, e.g. 01 January 2026" value="${item.date || ''}">
        <input type="text" class="tl-title" placeholder="Title" value="${item.title || ''}">
        <textarea class="tl-desc" placeholder="Description" style="min-height:70px;">${item.description || ''}</textarea>
        <input type="text" class="tl-image" placeholder="image filename (optional)" value="${item.image || ''}">
        <button class="btn-gold btn-small tl-remove">Remove Event</button>
      </div>
    `).join('');
    editor.querySelectorAll('[data-index]').forEach(row => {
      const idx = Number(row.dataset.index);
      row.querySelector('.tl-date').addEventListener('input', (e) => { items[idx].date = e.target.value; sync(); });
      row.querySelector('.tl-title').addEventListener('input', (e) => { items[idx].title = e.target.value; sync(); });
      row.querySelector('.tl-desc').addEventListener('input', (e) => { items[idx].description = e.target.value; sync(); });
      row.querySelector('.tl-image').addEventListener('input', (e) => { items[idx].image = e.target.value; sync(); });
      row.querySelector('.tl-remove').addEventListener('click', () => { items.splice(idx, 1); render(); sync(); });
    });
    sync();
  }

  function sync() { output.value = JSON.stringify(items, null, 2); }

  document.getElementById('timeline-add-row').addEventListener('click', () => {
    items.push({ date: '', title: '', description: '', image: '' });
    render();
  });

  render();
}

/* ---------- Letter editor ---------- */
async function initLetterEditor() {
  try {
    const res = await fetch('../content/letter.md', { cache: 'no-store' });
    const text = res.ok ? await res.text() : '';
    document.getElementById('letter-editor').value = text;
  } catch (e) {
    document.getElementById('letter-editor').value = '';
  }
}
