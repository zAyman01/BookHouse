import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNotification } from '../context/NotificationContext';
import styles from './ContactPage.module.css';

export default function ContactPage() {
  const { success } = useNotification();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      success('Message sent! We\'ll get back to you within 24 hours.');
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 800);
  };

  return (
    <>
      <Header />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroBg} />
          <h1 className={styles.title}>Contact Us</h1>
          <p className={styles.subtitle}>Have a question or feedback? We'd love to hear from you.</p>
        </section>
        <div className={styles.container}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="name">Name</label>
                <input id="name" type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="Your name" />
              </div>
              <div className={styles.field}>
                <label htmlFor="email">Email</label>
                <input id="email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required placeholder="you@example.com" />
              </div>
            </div>
            <div className={styles.field}>
              <label htmlFor="subject">Subject</label>
              <input id="subject" type="text" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} required placeholder="How can we help?" />
            </div>
            <div className={styles.field}>
              <label htmlFor="message">Message</label>
              <textarea id="message" rows={5} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} required placeholder="Tell us more about your inquiry..." />
            </div>
            <button type="submit" className={styles.submit} disabled={sending}>
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </form>
          <div className={styles.sidebar}>
            <div className={styles.infoCard}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <h4>Email</h4>
              <p>hello@bookhouse.com</p>
            </div>
            <div className={styles.infoCard}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <h4>Location</h4>
              <p>Cairo, Egypt</p>
            </div>
            <div className={styles.infoCard}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <h4>Response Time</h4>
              <p>Within 24 hours</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
