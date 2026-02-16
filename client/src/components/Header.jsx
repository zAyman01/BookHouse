import { useState } from 'react';
import logo from '../assets/bookhouse-logo.png';
import styles from './Header.module.css';

export default function Header({ activePage = 'home' }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const getLinkClassName = (page) => {
    return `${styles.navLink} ${activePage === page ? styles.active : ''}`;
  };

  return (
    <header className={styles.header}>
      <div className={styles.logoWrapper}>
        <a href="/" className={styles.logoLink} aria-label="BookHouse Home">
          <img src={logo} alt="BookHouse Logo" className={styles.logoImage} />
          <h1 className={styles.logoTitle}>
            Book<span>House</span>
          </h1>
        </a>
      </div>

      {/* Mobile Menu Toggle */}
      <button
        className={styles.menuToggle}
        onClick={toggleMenu}
        aria-label="Toggle navigation menu"
        aria-expanded={isMenuOpen}
      >
        <span className={styles.hamburger}></span>
        <span className={styles.hamburger}></span>
        <span className={styles.hamburger}></span>
      </button>

      {/* Navigation */}
      <nav className={`${styles.navLinks} ${isMenuOpen ? styles.open : ''}`}>
        <ul className={styles.navList}>
          <li className={styles.navItem}>
            <a
              href="/"
              className={getLinkClassName('home')}
              onClick={closeMenu}
            >
              Home
            </a>
          </li>
          <li className={styles.navItem}>
            <a
              href="/library"
              className={getLinkClassName('library')}
              onClick={closeMenu}
            >
              Library
            </a>
          </li>
          <li className={styles.navItem}>
            <a
              href="/favorites"
              className={getLinkClassName('favorites')}
              onClick={closeMenu}
            >
              Favorites
            </a>
          </li>
          <li className={styles.navItem}>
            <a
              href="/orders"
              className={getLinkClassName('orders')}
              onClick={closeMenu}
            >
              My Orders
            </a>
          </li>
          <li className={styles.navItem}>
            <a
              href="/account"
              className={getLinkClassName('account')}
              onClick={closeMenu}
            >
              Account
            </a>
          </li>
        </ul>

        {/* Mobile Auth Buttons */}
        <div className={styles.mobileAuth}>
          <a href="/signin" className={styles.signInLink} onClick={closeMenu}>
            Sign In
          </a>
          <a href="/signup" className={styles.signUpLink} onClick={closeMenu}>
            Sign Up
          </a>
        </div>
      </nav>

      {/* Desktop Auth Buttons */}
      <div className={styles.navAuth}>
        <a href="/signin" className={styles.signInLink}>
          Sign In
        </a>
        <a href="/signup" className={styles.signUpLink}>
          Sign Up
        </a>
      </div>

      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <div
          className={styles.overlay}
          onClick={closeMenu}
          aria-hidden="true"
        ></div>
      )}
    </header>
  );
}
