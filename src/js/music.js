/**
 * music.js — vinyl-style music player.
 * IMPORTANT: never autoplay. Browsers block it, and it also
 * respects the visitor pressing play on their own terms.
 */

const MusicModule = (() => {

  function init() {
    const audio = document.getElementById('our-song-audio');
    const toggle = document.getElementById('music-toggle');
    const vinyl = document.getElementById('vinyl');
    const progress = document.querySelector('.music-progress');
    const progressBar = document.querySelector('.music-progress-bar');
    const titleEl = document.querySelector('.music-title');
    if (!audio || !toggle) return;

    audio.src = CONFIG.music.file;
    if (titleEl) titleEl.textContent = CONFIG.music.title || 'Our Song';

    toggle.addEventListener('click', () => {
      if (audio.paused) {
        audio.play().catch(() => Effects.toast('Tap play again — your browser needs one more tap 🎵'));
      } else {
        audio.pause();
      }
    });

    audio.addEventListener('play', () => { toggle.textContent = '❚❚'; vinyl.classList.add('playing'); });
    audio.addEventListener('pause', () => { toggle.textContent = '▶'; vinyl.classList.remove('playing'); });
    audio.addEventListener('ended', () => { toggle.textContent = '▶'; vinyl.classList.remove('playing'); });
    audio.addEventListener('error', () => Effects.toast('Song file not found — add it in assets/music/'));

    audio.addEventListener('timeupdate', () => {
      if (audio.duration) progressBar.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
    });

    progress.addEventListener('click', (e) => {
      const rect = progress.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      if (audio.duration) audio.currentTime = pct * audio.duration;
    });
  }

  return { init };
})();
