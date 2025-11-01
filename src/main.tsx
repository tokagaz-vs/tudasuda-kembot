// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';

// Полностью очищаем #root на случай, если кто-то уже что-то вставил
const rootEl = document.getElementById('root');
if (rootEl) rootEl.innerHTML = '';

function Test() {
  return (
    <div style={{ padding: 24, minHeight: '100vh', background: '#0F1115', color: '#fff' }}>
      <h1>✅ React работает</h1>
      <p>Этот тест рендерится напрямую из main.tsx (App.tsx не используется)</p>
      <pre>{JSON.stringify({
        href: window.location.href,
        ua: navigator.userAgent,
        hasTelegram: !!(window as any).Telegram,
        time: new Date().toISOString(),
      }, null, 2)}</pre>
    </div>
  );
}

ReactDOM.createRoot(rootEl!).render(
  <React.StrictMode>
    <Test />
  </React.StrictMode>
);