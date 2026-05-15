import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './FaqsPage.module.css';

const FAQS = [
  { q: 'How do I create an account?', a: 'Click "Sign Up" in the top navigation, fill in your details, and you\'ll be reading in minutes.' },
  { q: 'Is BookHouse free to use?', a: 'Browsing and reading previews is free. Full books require purchase or a membership subscription.' },
  { q: 'How do I purchase a book?', a: 'Add books to your cart, proceed to checkout, and complete payment. Your library will update instantly.' },
  { q: 'Can I read books offline?', a: 'Yes. Purchased books can be downloaded to the BookHouse reader app for offline access.' },
  { q: 'How do I become an author?', a: 'Navigate to your dashboard after signing up and select "Upload" to submit your manuscript for review.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, PayPal, and regional payment methods depending on your location.' },
  { q: 'How do refunds work?', a: 'You can request a refund within 14 days of purchase if you haven\'t read more than 10% of the book.' },
  { q: 'Can I gift books to others?', a: 'Yes. Select "Gift this book" at checkout to send a book to another BookHouse user.' },
];

export default function FaqsPage() {
  const [open, setOpen] = useState(null);

  return (
    <>
      <Header />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroBg} />
          <h1 className={styles.title}>Frequently Asked Questions</h1>
          <p className={styles.subtitle}>Everything you need to know about BookHouse.</p>
        </section>
        <div className={styles.container}>
          <div className={styles.list}>
            {FAQS.map((faq, i) => {
              const isOpen = open === i;
              return (
                <div key={i} className={`${styles.item} ${isOpen ? styles.open : ''}`}>
                  <button className={styles.question} onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen}>
                    <span>{faq.q}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.chevron}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  <div className={styles.answer} style={{ maxHeight: isOpen ? '300px' : '0' }}>
                    <p>{faq.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className={styles.sidebar}>
            <div className={styles.sideCard}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <h3>Still have questions?</h3>
              <p>We're here to help. Reach out to our support team.</p>
              <a href="mailto:hello@bookhouse.com">Contact Support &rarr;</a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
