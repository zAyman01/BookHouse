import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './TermsPage.module.css';

const SECTIONS = [
  { title: '1. Acceptance of Terms', text: 'By accessing or using BookHouse, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.' },
  { title: '2. Accounts', text: 'You are responsible for maintaining the confidentiality of your account credentials. You must notify us immediately of any unauthorized use. You must be at least 13 years of age to create an account.' },
  { title: '3. Purchases & Payments', text: 'All purchases are final unless otherwise stated. Prices are listed in the currency specified at checkout. We reserve the right to change prices at any time.' },
  { title: '4. Refund Policy', text: 'You may request a refund within 14 days of purchase if you have not read more than 10% of the book. Refunds are processed within 5–10 business days.' },
  { title: '5. Content & Copyright', text: 'All content on BookHouse is protected by copyright. You may not reproduce, distribute, or create derivative works without explicit permission from the rights holder.' },
  { title: '6. User Conduct', text: 'You agree not to use BookHouse for any unlawful purpose, to harass others, or to distribute malicious content. We reserve the right to terminate accounts that violate these rules.' },
  { title: '7. Limitation of Liability', text: 'BookHouse is provided "as is" without warranties of any kind. We are not liable for damages arising from your use of the platform.' },
  { title: '8. Changes to Terms', text: 'We may update these terms at any time. Continued use after changes constitutes acceptance of the new terms.' },
  { title: '9. Contact', text: 'For questions about these terms, contact us at hello@bookhouse.com.' },
];

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroBg} />
          <h1 className={styles.title}>Terms of Service</h1>
          <p className={styles.date}>Last updated: January 2025</p>
        </section>
        <div className={styles.container}>
          {SECTIONS.map((s, i) => (
            <section key={i} className={styles.section}>
              <h2>{s.title}</h2>
              <p>{s.text}</p>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
