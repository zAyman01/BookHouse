import { createContext, useContext, useState, useCallback, useRef } from 'react';

const NotificationContext = createContext();

let idCounter = 0;

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const timers = useRef({});

  const remove = useCallback((id) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const notify = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++idCounter;
    setNotifications(prev => [...prev, { id, message, type }]);
    timers.current[id] = setTimeout(() => remove(id), duration);
    return id;
  }, [remove]);

  const success = useCallback((msg, dur) => notify(msg, 'success', dur), [notify]);
  const error = useCallback((msg, dur) => notify(msg, 'error', dur), [notify]);
  const info = useCallback((msg, dur) => notify(msg, 'info', dur), [notify]);

  return (
    <NotificationContext.Provider value={{ notify, success, error, info, remove }}>
      {children}
      <div style={{
        position: 'fixed', top: 84, right: 20, zIndex: 10000,
        display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none'
      }}>
        {notifications.map(n => (
          <ToastItem key={n.id} notification={n} onDismiss={() => remove(n.id)} />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

function ToastItem({ notification, onDismiss }) {
  const { message, type } = notification;

  const iconMap = {
    success: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    error: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
    info: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  };

  const colorMap = {
    success: 'var(--color-green)',
    error: 'var(--color-red)',
    info: 'var(--color-primary)',
  };

  return (
    <div
      onClick={onDismiss}
      role="alert"
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 16px',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border-light)',
        borderRadius: 'var(--radius-sm)',
        boxShadow: 'var(--shadow-md)',
        pointerEvents: 'auto',
        cursor: 'pointer',
        minWidth: 280,
        maxWidth: 400,
        animation: 'toastSlideIn 0.25s ease',
        fontFamily: 'var(--font-ui)',
        fontSize: 13,
        color: 'var(--color-text)',
      }}
    >
      <span style={{ color: colorMap[type], flexShrink: 0, display: 'flex' }}>{iconMap[type]}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={(e) => { e.stopPropagation(); onDismiss(); }}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--color-text-muted)', padding: 2, display: 'flex',
          fontSize: 16, lineHeight: 1,
        }}
        aria-label="Dismiss"
      >
        &times;
      </button>
    </div>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}
