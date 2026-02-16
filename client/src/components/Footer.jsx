import styles from './Footer.module.css';
import logo from '../assets/bookhouse-logo.png';
import {
  FaFacebookF,
  FaXTwitter,
  FaInstagram,
  FaLinkedinIn,
} from 'react-icons/fa6';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        {/* Brand Section */}
        <section className={styles.footerBrand} aria-label="Brand Information">
          <a href="/" className={styles.logoLink} aria-label="BookHouse Home">
            <img src={logo} alt="BookHouse Logo" className={styles.logoImage} />
            <h2 className={styles.logoTitle}>
              Book<span>House</span>
            </h2>
          </a>
          <p className={styles.footerText}>
            Where literature meets technology. We provide high-quality books and
            precision printing services for the academic and creative community.
          </p>

          {/* Mobile Social Links */}
          <nav
            className={styles.socialLinksMobile}
            aria-label="Social Media Links"
          >
            <a
              href="https://www.facebook.com/BookHouse"
              className={styles.socialLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit our Facebook page"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://www.twitter.com/BookHouse"
              className={styles.socialLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit our Twitter page"
            >
              <FaXTwitter />
            </a>
            <a
              href="https://www.instagram.com/BookHouse"
              className={styles.socialLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit our Instagram page"
            >
              <FaInstagram />
            </a>
            <a
              href="https://www.linkedin.com/company/BookHouse"
              className={styles.socialLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit our LinkedIn page"
            >
              <FaLinkedinIn />
            </a>
          </nav>
        </section>

        {/* Links Section */}
        <nav className={styles.footerLinks} aria-label="Footer Navigation">
          <div className={styles.footerLinkColumn}>
            <h3 className={styles.linkTitle}>Important Links</h3>
            <ul className={styles.footerLinkList}>
              <li>
                <a href="/signin" className={styles.footerLink}>
                  Login
                </a>
              </li>
              <li>
                <a href="/signup" className={styles.footerLink}>
                  Sign Up
                </a>
              </li>
              <li>
                <a href="/categories" className={styles.footerLink}>
                  Categories
                </a>
              </li>
              <li>
                <a href="/orders" className={styles.footerLink}>
                  My Order
                </a>
              </li>
              <li>
                <a href="/cart" className={styles.footerLink}>
                  Cart
                </a>
              </li>
              <li>
                <a href="/account" className={styles.footerLink}>
                  Account
                </a>
              </li>
            </ul>
          </div>

          <div className={styles.footerLinkColumn}>
            <h3 className={styles.linkTitle}>About us</h3>
            <ul className={styles.footerLinkList}>
              <li>
                <a href="/benefits" className={styles.footerLink}>
                  Benefits
                </a>
              </li>
              <li>
                <a href="/team" className={styles.footerLink}>
                  Team
                </a>
              </li>
            </ul>
          </div>

          <div className={styles.footerLinkColumn}>
            <h3 className={styles.linkTitle}>Help</h3>
            <ul className={styles.footerLinkList}>
              <li>
                <a href="/faqs" className={styles.footerLink}>
                  FAQs
                </a>
              </li>
              <li>
                <a href="/contact" className={styles.footerLink}>
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      {/* Footer Bottom Section */}
      <div className={styles.footerBottom}>
        <nav
          className={styles.socialLinksDesktop}
          aria-label="Social Media Links"
        >
          <a
            href="https://www.facebook.com/BookHouse"
            className={styles.socialLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit our Facebook page"
          >
            <FaFacebookF />
          </a>
          <a
            href="https://www.twitter.com/BookHouse"
            className={styles.socialLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit our Twitter page"
          >
            <FaXTwitter />
          </a>
          <a
            href="https://www.instagram.com/BookHouse"
            className={styles.socialLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit our Instagram page"
          >
            <FaInstagram />
          </a>
          <a
            href="https://www.linkedin.com/company/BookHouse"
            className={styles.socialLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit our LinkedIn page"
          >
            <FaLinkedinIn />
          </a>
        </nav>

        <p className={styles.copyright}>
          &copy; {currentYear} BookHouse. All rights reserved.
        </p>

        <nav className={styles.policyLinks} aria-label="Legal Links">
          <a href="/terms" className={styles.policyLink}>
            Terms &amp; Conditions
          </a>
          <a href="/privacy" className={styles.policyLink}>
            Privacy Policy
          </a>
        </nav>
      </div>
    </footer>
  );
}
