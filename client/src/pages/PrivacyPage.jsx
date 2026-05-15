import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './PrivacyPage.module.css';

const SECTIONS = [
  { title: '1. Information We Collect', text: 'We collect information you provide when creating an account, including your name, email address, and profile details. We also collect data about your reading activity and purchases to improve our recommendations.' },
  { title: '2. How We Use Your Information', text: 'Your information is used to provide and improve our services, process transactions, send relevant recommendations, and communicate with you about your account.' },
  { title: '3. Data Sharing', text: 'We do not sell your personal data. We may share anonymized data with partners for analytics. Payment information is processed securely by third-party providers and never stored on our servers.' },
  { title: '4. Cookies', text: 'We use essential cookies for authentication and functionality. Analytics cookies help us understand platform usage. You can control cookie preferences in your browser settings.' },
  { title: '5. Data Security', text: 'We implement industry-standard encryption and security measures to protect your data. However, no method of transmission over the internet is 100% secure.' },
  { title: '6. Your Rights', text: 'You have the right to access, correct, or delete your personal data at any time through your account settings. You can also request a copy of your data by contacting us.' },
  { title: '7. Third-Party Services', text: 'Our platform may contain links to third-party websites. We are not responsible for their privacy practices. We encourage you to review their policies.' },
  { title: '8. Changes to This Policy', text: 'We may update this policy periodically. We will notify you of material changes via email or through the platform.' },
  { title: '9. Contact', text: 'For privacy-related inquiries, contact us at privacy@bookhouse.com.' },
];

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroBg} />
          <h1 className={styles.title}>Privacy Policy</h1>
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
