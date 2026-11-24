// ===================== PWA: offline support + install prompt =====================
(() => {
  const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const btn = document.getElementById('installBtn');
  let deferred = null;

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(err => console.warn('Service worker registration failed', err));
    });
  }

  const showButton = () => { if (btn && !isStandalone()) btn.hidden = false; };
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; showButton(); });
  window.addEventListener('appinstalled', () => { deferred = null; if (btn) btn.hidden = true; });
  if (isIOS && !isStandalone()) showButton(); // iOS has no install prompt: show instructions instead

  btn && btn.addEventListener('click', async () => {
    if (deferred) {
      deferred.prompt();
      const choice = await deferred.userChoice.catch(() => null);
      deferred = null;
      if (choice && choice.outcome === 'accepted') btn.hidden = true;
      return;
    }
    UI.modal(`<h2>Install Hawker Crush</h2>
      <ol class="howto">
        <li>Open this page in <b>Safari</b>.</li>
        <li>Tap the <b>Share</b> button (the square with an arrow pointing up).</li>
        <li>Scroll down and tap <b>Add to Home Screen</b>, then <b>Add</b>.</li>
      </ol>
      <p class="tip">The game then opens full screen from its own icon and works offline.</p>
      <div class="row"><button class="btn" data-a="close">Got it</button></div>`);
  });
})();
