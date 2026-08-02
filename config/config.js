/**
 * ============================================================
 *  MEMORIES OF SAJJAD AND NAZANIN — CENTRAL CONFIGURATION
 * ============================================================
 *  This is the ONLY file you should need to edit to personalize
 *  the whole experience (besides dropping files into /content
 *  and /assets). Nothing here is read by the JavaScript logic
 *  directly with hardcoded values — every module reads from
 *  the global CONFIG object below.
 *
 *  IMPORTANT ABOUT THE PASSWORD:
 *  This site is 100% static (GitHub Pages has no backend/server,
 *  no database). That means a truly unbreakable password is not
 *  possible — anyone who downloads the source could technically
 *  find it. What we do instead is store a SHA-256 HASH of the
 *  password rather than the plain text, so it isn't visible at
 *  a glance in the page source or dev tools "Sources" tab.
 *  This is "lock the front door" security, not a bank vault —
 *  good enough to keep the memory private from casual visitors,
 *  not sufficient against a determined attacker with the source code.
 *
 *  HOW TO GENERATE A HASH:
 *  Open admin/index.html → Settings → "Generate Password Hash"
 *  paste your password, copy the hash it gives you, paste it below.
 * ============================================================
 */

const CONFIG = {
  site: {
    title: "Memories of Sajjad and Nazanin",
    shortTitle: "Our Memories",
    language: "en", // "en" or "fa"
    themeColor: "#050505",
  },

  security: {
    memoryPasswordHash:
      "ef30be78f3dc23d8e73df0804eba9db21865a7ecb38a255d9f105f7c39193f55",
    adminPasswordHash:
      "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918",
    sessionMinutes: 30,
  },

  people: {
    firstName: "Sajjad",
    secondName: "Nazanin",
  },

  childhood: {
    sajjadPhoto: "assets/images/childhood/sajjad.jpg",
    nazaninPhoto: "assets/images/childhood/nazanin.jpg",
  },

  music: {
    file: "assets/music/our-song.mp3",
    title: "Fraqat Song",
  },

  location: {
    name: "Where our story began",
    latitude: 34.31716,
    longitude: 62.03586,
  },

dates: {
  firstMeeting: "2026-08-02",
  anniversary: "2021-10-09",
},
  futureLetter: {
    enabled: true,
    unlockDate: "2026-01-01",
    teaser: "Some memories are meant to wait. Come back someday...",
    message:
      "If you are reading this, it means years have passed and we are still writing our story together. I loved you then. I love you now. I will love you when this letter finally opens.",
  },

  // Easter egg secret image, shown after 5 logo clicks
  secretImage: "assets/images/secret/secret.MP4",
};

// Freeze so no runtime code can accidentally mutate the source of truth
Object.freeze(CONFIG);
secret.MP4;
