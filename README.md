# Memories of Sajjad and Nazanin

A private, cinematic digital memory box — built to be scanned from a QR code on
the back of a physical photo, password-protected, and installable as an app
(PWA) so it keeps working offline after the first visit.

This is a **100% static site** (plain HTML/CSS/JS). No build step, no backend,
no database. It runs perfectly on **GitHub Pages**.

---

## 1. Quick Start — Run It Locally

You can't just double-click `index.html`, because the site loads content with
`fetch()` (timeline.json, gallery.json, letter.md, etc.), and browsers block
`fetch()` on the `file://` protocol. You need a tiny local server:

```bash
# Option A — Python (already on most machines)
cd memories
python3 -m http.server 8080
# then open http://localhost:8080

# Option B — Node
npx serve memories
```

The **demo password is `0101`** (see `config/config.js`) and the **demo admin
password is `admin`** — change both before you share the real link (instructions
below).

---

## 2. Deploying to GitHub Pages

1. Create a new GitHub repository, e.g. `memories`.
2. Push the entire contents of this `memories/` folder to the repo root
   (so `index.html` sits at the repo root, not inside a subfolder).
3. In the repo: **Settings → Pages → Deploy from branch → `main` → `/ (root)`**.
4. Your site will be live at:
   `https://<your-username>.github.io/<repo-name>/`
5. Generate a QR code (any free QR generator) pointing at that URL, and print
   it on the back of your photo. `index.html` is already the QR target.

---

## 3. Updating Memories (No Coding Required)

You should **never need to touch the JavaScript** to change content. Everything
personal lives in two places:

### `config/config.js`
Names, dates, location, music filename, the future-letter unlock date, and the
password **hashes**. It's a plain JS file with comments explaining every field.

### `content/` folder
| File | What it controls |
|---|---|
| `letter.md` | The love letter (Markdown: `**bold**`, `*italic*`, `#` headings) |
| `timeline.json` | Your story's timeline events |
| `gallery.json` | Photo gallery captions + filenames |
| `memories.json` | The random notes inside the "Memory Jar" |
| `yearMessages.json` | A different message each anniversary year |
| `secrets.json` | Text shown by the hidden easter eggs |

### Adding Photos
- **Childhood photos:** replace `assets/images/childhood/sajjad.jpg` and
  `nazanin.jpg` (keep the same filenames, or update `config/config.js`).
- **Gallery photos:** drop new files into `assets/images/gallery/` (e.g.
  `004.jpg`), then either:
  - add a matching entry to `content/gallery.json` by hand, **or**
  - run the helper script locally: `node scripts/generate-gallery.js`
    (it scans the folder and rebuilds `gallery.json` automatically, keeping
    any captions you've already written).
- **Music:** replace `assets/music/our-song.mp3` with your song (same
  filename), or point `config.music.file` at a new filename.

### Setting Your Password
Never type a plain password into `config.js`. Instead:
1. Open `admin/index.html` → log in → scroll to **Password Hash Generator**.
2. Type your desired password, click **Generate SHA-256 Hash**.
3. Copy the resulting hash into `security.memoryPasswordHash` (or
   `adminPasswordHash`) in `config/config.js`.

---

## 4. The Admin Panel

Visit `/admin/` (e.g. `https://yourname.github.io/memories/admin/`).

**Important limitation to understand:** GitHub Pages has no server and no
database, so a real "Save" button that writes to your files isn't possible
here. The admin panel is a **content co-pilot**: it shows a dashboard of your
current content counts, gives you friendly forms for editing the gallery and
timeline, and generates the exact JSON text for you to copy and paste into the
matching file in `content/`. Photo/music files themselves must be uploaded to
the right `assets/` folder directly (e.g. via GitHub's web uploader or git).

What it can do:
- **Dashboard** — photo count, timeline count, memory count
- **Gallery Manager** — add/remove/edit captions, outputs ready-to-paste JSON
- **Timeline Manager** — add/remove events, outputs ready-to-paste JSON
- **Letter Editor** — loads and displays the current letter for editing
- **Password Hash Generator** — turns a plain password into a safe hash

---

## 5. Security Notes (Please Read)

Because this is a static site, there is no way to *truly* hide a secret from
someone who has access to the deployed source code — anyone determined enough
could read the hash out of `config.js`. What this project does instead:

- Stores a **SHA-256 hash**, not the plain password, so it isn't visible at a
  glance in dev tools.
- Uses a **separate** password for `/admin` vs. the main memory page.
- Is meant to keep the memory private from casual visitors (people who don't
  have the link, or who scan the QR code without knowing the shared date/word)
  — not to protect against a targeted, technical attacker.

If you need real per-user authentication or private storage, that requires a
backend server, which is outside the scope of a static GitHub Pages project.

---

## 6. Project Structure

```
memories/
├── index.html                 ← the whole experience
├── manifest.json               ← PWA manifest
├── service-worker.js           ← offline cache
├── config/
│   └── config.js               ← EDIT THIS: names, dates, passwords, location
├── content/                    ← EDIT THESE: your story's actual text/data
│   ├── letter.md
│   ├── timeline.json
│   ├── gallery.json
│   ├── memories.json
│   ├── yearMessages.json
│   └── secrets.json
├── assets/
│   ├── images/childhood/       ← 2 childhood photos
│   ├── images/gallery/         ← photo gallery
│   ├── images/secret/          ← easter egg image
│   └── music/                  ← our-song.mp3
├── icons/                      ← PWA app icons
├── admin/                      ← /admin content co-pilot
├── scripts/
│   └── generate-gallery.js     ← run locally to auto-build gallery.json
└── src/
    ├── css/                    ← style.css, animation.css, responsive.css
    └── js/                     ← app.js, auth.js, gallery.js, timeline.js,
                                    music.js, effects.js, pwa.js
```

---

## 7. Feature Checklist

- ✅ Premium dark, Apple-inspired luxury design (Deep Noir + Gold)
- ✅ Password-protected entry with shake/error + magical unlock animation
- ✅ Cinematic text intro
- ✅ Childhood section with modal reveal
- ✅ Config-driven timeline (`timeline.json`)
- ✅ Envelope-opening love letter loaded from Markdown
- ✅ Full-screen photo gallery with swipe/keyboard lightbox
- ✅ Vinyl-style music player (no autoplay, by design)
- ✅ "Our Place" map card
- ✅ Interactive Memory Jar
- ✅ Live anniversary counter (days/hours/min/sec)
- ✅ Yearly message system
- ✅ Future letter time-capsule (date-locked)
- ✅ Hidden easter eggs (logo x5, long-press, double-tap hearts)
- ✅ Admin content co-pilot at `/admin`
- ✅ PWA installable + offline caching
- ✅ Mobile-first responsive (320px and up)
- ✅ Reduced-motion support, semantic structure for accessibility

Enjoy building your memory box. 🤍
