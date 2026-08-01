/**
 * auth.js — password gate logic
 * Uses SubtleCrypto SHA-256 so the raw password never sits
 * in plain text in the source (only the hash does).
 * NOTE: for a fully static site this is "keep casual visitors
 * out", not military-grade security — see config.js comments.
 */

const Auth = (() => {

  async function sha256(text) {
    const enc = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async function checkMemoryPassword(input) {
    const hash = await sha256(input.trim());
    return hash === CONFIG.security.memoryPasswordHash;
  }

  async function checkAdminPassword(input) {
    const hash = await sha256(input.trim());
    return hash === CONFIG.security.adminPasswordHash;
  }

  function setUnlocked() {
    sessionStorage.setItem('memories_unlocked', '1');
  }

  function isUnlocked() {
    return sessionStorage.getItem('memories_unlocked') === '1';
  }

  function setAdminSession() {
    const expiry = Date.now() + (CONFIG.security.sessionMinutes * 60 * 1000);
    sessionStorage.setItem('admin_session_expiry', String(expiry));
  }

  function isAdminSessionValid() {
    const expiry = Number(sessionStorage.getItem('admin_session_expiry') || 0);
    return Date.now() < expiry;
  }

  return { sha256, checkMemoryPassword, checkAdminPassword, setUnlocked, isUnlocked, setAdminSession, isAdminSessionValid };
})();
