(function () {
  const UA = navigator.userAgent || '';
  const REF = document.referrer || '';
  const Q = window.location.search + window.location.hash;

  const state = {
    time: new Date().toISOString(),
    ua: UA,
    referrer: REF,
    query: Q,
    attempts: 0,
    foundWebApp: false,
    initDataPresent: false,
  };

  function log(...args) {
    try {
      console.log('[TG-BOOT]', ...args);
    } catch {}
  }

  // Безопасно прячем любые старые оверлеи "доступ только в телеграм"
  function killAccessOverlays() {
    try {
      const textSnippets = [
        'доступ запрещен',
        'доступно только через telegram',
        'откройте приложение в telegram',
        'open in telegram',
        'telegram mini app only',
      ];

      const nodes = document.querySelectorAll('div,section,main,article,aside,header,footer');
      nodes.forEach((el) => {
        const txt = ((el.innerText || el.textContent || '') + '').toLowerCase();
        const id = (el.id || '').toLowerCase();
        const cls = (el.className || '').toString().toLowerCase();

        const hasText = textSnippets.some((s) => txt.includes(s));
        const hasKnownId = /tg[-_]?guard|telegram[-_]?only|open[-_]?in[-_]?telegram|access[-_]?denied/.test(id);
        const hasKnownCls = /tg[-_]?guard|telegram[-_]?only|open[-_]?in[-_]?telegram|access[-_]?denied/.test(cls);

        if (hasText || hasKnownId || hasKnownCls) {
          el.style.display = 'none';
          el.setAttribute('data-tg-boot-hidden', '1');
        }
      });
    } catch (e) {
      // ignore
    }
  }

  function tick() {
    state.attempts += 1;
    const app = window.Telegram && window.Telegram.WebApp;

    killAccessOverlays();

    if (app) {
      state.foundWebApp = true;
      state.initDataPresent = !!(app.initDataUnsafe && app.initDataUnsafe.user);
      try { app.ready(); } catch (e) {}
      try { app.expand(); } catch (e) {}
      log('WebApp detected', {
        platform: app.platform,
        colorScheme: app.colorScheme,
        hasUser: state.initDataPresent,
      });
      window.__tgBoot = state;
      return; // stop loop
    }

    if (state.attempts < 200) {
      setTimeout(tick, 100);
    } else {
      log('WebApp not detected after attempts', state.attempts);
      window.__tgBoot = state;
    }
  }

  setTimeout(tick, 0);
  setInterval(killAccessOverlays, 300);

  window.__tgBoot = state;
  log('Bootstrap started', { ua: UA, referrer: REF, query: Q });
})();