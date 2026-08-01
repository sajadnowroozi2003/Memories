/**
 * pwa.js — service worker registration + install support.
 */

const PWAModule = (() => {
  function init() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js').catch(err => {
          console.warn('Service worker registration failed:', err);
        });
      });
    }

    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      const btn = document.getElementById('install-btn');
      if (btn) {
        btn.style.display = 'inline-flex';
        btn.addEventListener('click', async () => {
          btn.style.display = 'none';
          if (deferredPrompt) {
            deferredPrompt.prompt();
            await deferredPrompt.userChoice;
            deferredPrompt = null;
          }
        });
      }
    });
  }

  return { init };
})();
