import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import useAuth from '../hooks/useAuth';
import styles from './Header.module.css';

const NAV = [
  { to: '/', label: 'Home', page: 'home' },
  { to: '/library', label: 'Library', page: 'library' },
  { to: '/favorites', label: 'Favorites', page: 'favorites' },
  { to: '/orders', label: 'Orders', page: 'orders' },
];

function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <line x1="8" y1="7" x2="16" y2="7" /><line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const active = pathname === '/' ? 'home' : pathname.slice(1).split('/')[0] || 'home';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => { logout(); setOpen(false); };

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          <BookIcon />
          <span className={styles.logoText}>book<span className={styles.logoBold}>House</span></span>
        </Link>

        <button className={`${styles.hamburger} ${open ? styles.open : ''}`} onClick={() => setOpen(v => !v)} aria-label="Menu">
          <span /><span /><span />
        </button>

        <nav className={`${styles.nav} ${open ? styles.navVisible : ''}`}>
          <ul className={styles.navList}>
            {NAV.map(n => (
              <li key={n.page}>
                <Link to={n.to} className={`${styles.navLink} ${active === n.page ? styles.active : ''}`} onClick={() => setOpen(false)}>{n.label}</Link>
              </li>
            ))}
          </ul>
          <div className={styles.actions}>
            <button className={styles.searchBtn} onClick={() => setSearchOpen(v => !v)} aria-label="Search"><SearchIcon /></button>
            <button className={styles.themeBtn} onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
            {isAuthenticated ? (
              <div className={styles.profileGroup}>
                <Link to="/account" className={styles.profileBtn} aria-label="My Account">
                  <span className={styles.avatar}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                </Link>
                <button onClick={handleLogout} className={styles.logoutBtn} aria-label="Log out">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </div>
            ) : (
              <>
                <Link to="/signin" className={styles.signIn}>Sign In</Link>
                <Link to="/signup" className={styles.signUp}>Sign Up</Link>
              </>
            )}
          </div>
        </nav>
      </div>

      {searchOpen && (
        <div className={styles.searchBar}>
          <div className={styles.searchInner}>
            <SearchIcon />
            <input type="text" placeholder="Search books..." autoFocus />
            <button className={styles.searchClose} onClick={() => setSearchOpen(false)} aria-label="Close">✕</button>
          </div>
        </div>
      )}

      {open && <div className={styles.overlay} onClick={() => setOpen(false)} />}
    </header>
  );
}
