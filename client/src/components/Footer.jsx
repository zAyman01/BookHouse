import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <line x1="8" y1="7" x2="16" y2="7" /><line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

export default function Footer() {
  const y = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <BookIcon />
            <span className={styles.logoText}>book<span className={styles.logoBold}>House</span></span>
          </div>
          <p>Where literature meets technology. Discover, read, and share stories that matter.</p>
        </div>
        <div className={styles.cols}>
          <div className={styles.col}>
            <h4>Browse</h4>
            <Link to="/library">Library</Link>
            <Link to="/favorites">Favorites</Link>
            <Link to="/cart">Cart</Link>
          </div>
          <div className={styles.col}>
            <h4>Account</h4>
            <Link to="/signin">Sign In</Link>
            <Link to="/signup">Sign Up</Link>
            <Link to="/orders">Orders</Link>
          </div>
          <div className={styles.col}>
            <h4>About</h4>
            <Link to="/faqs">FAQs</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <p>&copy; {y} BookHouse</p>
        <div className={styles.policy}>
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}
