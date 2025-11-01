import React, { useMemo, useState } from 'react';
import { useTelegram } from '@/hooks/useTelegram';
import { useAuthStore } from '@/store/authStore';

export const DebugPanel: React.FC = () => {
  const { webApp, user: tgUser, isReady, isTelegram, platform, colorScheme } = useTelegram();
  const { user, isAuthenticated, isLoading, login, logout } = useAuthStore();
  const [open, setOpen] = useState<boolean>(() => {
    const qp = new URLSearchParams(window.location.search);
    return qp.get('debug') === '1' || import.meta.env.DEV;
  });

  const boot = useMemo(() => (window as any).__tgBoot || {}, []);
  const debug = useMemo(() => (window as any).__tgDebug || {}, [isReady, webApp]);

  const sectionStyle: React.CSSProperties = {
    marginBottom: 8,
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    paddingBottom: 8,
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          top: 8,
          left: 8,
          zIndex: 9999,
          background: '#333',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 8,
          padding: '6px 10px',
          fontSize: 12,
          cursor: 'pointer',
        }}
      >
        🔧 Debug
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 8,
        left: 8,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.85)',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: 12,
        padding: 12,
        width: 320,
        fontFamily: 'monospace',
        fontSize: 12,
        maxHeight: '80vh',
        overflow: 'auto',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <strong>Debug Panel</strong>
        <button
          onClick={() => setOpen(false)}
          style={{
            background: 'transparent',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 6,
            padding: '2px 6px',
            cursor: 'pointer',
          }}
        >
          ✖
        </button>
      </div>

      <div style={sectionStyle}>
        <div>isReady: {String(isReady)}</div>
        <div>isTelegram: {String(isTelegram)}</div>
        <div>platform: {platform}</div>
        <div>colorScheme: {colorScheme}</div>
      </div>

      <div style={sectionStyle}>
        <div>hasWebApp: {String(!!webApp)}</div>
        <div>hasTGUser: {String(!!webApp?.initDataUnsafe?.user)}</div>
        <div>UA has "Telegram": {String(/Telegram/i.test(navigator.userAgent))}</div>
        <div>Referrer: {(document.referrer || '').slice(0, 80)}</div>
        <div>Search: {window.location.search.slice(0, 80)}</div>
        <div>Hash: {window.location.hash.slice(0, 80)}</div>
      </div>

      <div style={sectionStyle}>
        <div>tgUser: {tgUser ? `${tgUser.id} @${tgUser.username || ''}` : '[null]'}</div>
        <div>authUser: {user ? `${user.id} tg:${user.telegram_id}` : '[null]'}</div>
        <div>isAuthenticated: {String(isAuthenticated)}</div>
        <div>isLoading: {String(isLoading)}</div>
      </div>

      <div style={sectionStyle}>
        <div>__tgBoot (public/telegram-web-app.js):</div>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(boot, null, 2)}</pre>
      </div>

      <div style={sectionStyle}>
        <div>__tgDebug (useTelegram):</div>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(debug, null, 2)}</pre>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => {
            if (tgUser) login(tgUser);
          }}
          style={{
            background: '#2b6cb0',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '6px 8px',
            cursor: 'pointer',
          }}
        >
          🔑 Try login()
        </button>
        <button
          onClick={() => logout()}
          style={{
            background: '#9b2c2c',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '6px 8px',
            cursor: 'pointer',
          }}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
};