import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import * as authService from '../services/auth.service';
import { useNotification } from '../context/NotificationContext';
import styles from './SignIn.module.css';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { success, error } = useNotification();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setApiError('Email is required'); return; }
    setSubmitting(true); setApiError('');
    try {
      await authService.forgotPassword(email);
      success('If that email exists, a reset code has been sent.');
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP';
      setApiError(msg); error(msg);
    } finally { setSubmitting(false); }
  };

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>Forgot Password</h1>
            <p className={styles.subtitle}>Enter your email to receive a reset code</p>
          </div>
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
            </div>
            {apiError && <div className={styles.apiError}>{apiError}</div>}
            <button type="submit" className={styles.submit} disabled={submitting}>
              {submitting ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
          <p className={styles.switch}><Link to="/signin">Back to sign in</Link></p>
        </div>
      </main>
      <Footer />
    </>
  );
}
