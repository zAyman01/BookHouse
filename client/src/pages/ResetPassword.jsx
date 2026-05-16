import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Spinner from '../components/Spinner';
import * as authService from '../services/auth.service';
import { useNotification } from '../context/NotificationContext';
import styles from './SignIn.module.css';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { success, error } = useNotification();
  const email = params.get('email') || '';

  useEffect(() => {
    if (!email) navigate('/forgot-password', { replace: true });
  }, [email, navigate]);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [step, setStep] = useState('otp');
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) { setApiError('Enter the OTP'); return; }
    setSubmitting(true); setApiError('');
    try {
      await authService.verifyOtp(email, otp);
      setStep('reset');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid OTP';
      setApiError(msg); error(msg);
    } finally { setSubmitting(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirm) { setApiError('Passwords do not match'); return; }
    if (newPassword.length < 8) { setApiError('Min 8 characters'); return; }
    setSubmitting(true); setApiError('');
    try {
      await authService.resetPassword(email, otp, newPassword);
      success('Password reset! Sign in with your new password.');
      navigate('/signin');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset';
      setApiError(msg); error(msg);
    } finally { setSubmitting(false); }
  };

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>{step === 'otp' ? 'Enter Reset Code' : 'New Password'}</h1>
            <p className={styles.subtitle}>{step === 'otp' ? `Check ${email} for your code` : 'Choose a new password'}</p>
          </div>
          {step === 'otp' ? (
            <form onSubmit={handleVerifyOtp} className={styles.form} noValidate>
              <div className={styles.field}>
                <label>Reset Code</label>
                <input type="text" value={otp} onChange={e => setOtp(e.target.value)} required placeholder="000000" maxLength={6} />
              </div>
              {apiError && <div className={styles.apiError}>{apiError}</div>}
              <button type="submit" className={styles.submit} disabled={submitting}>
                {submitting ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Spinner size={16} /> Verifying...</span> : 'Verify Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} className={styles.form} noValidate>
              <div className={styles.field}>
                <label>New Password</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={8} placeholder="Min 8 characters" />
              </div>
              <div className={styles.field}>
                <label>Confirm Password</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required minLength={8} placeholder="Repeat password" />
              </div>
              {apiError && <div className={styles.apiError}>{apiError}</div>}
              <button type="submit" className={styles.submit} disabled={submitting}>
                {submitting ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Spinner size={16} /> Resetting...</span> : 'Reset Password'}
              </button>
            </form>
          )}
          <p className={styles.switch}><Link to="/signin">Back to sign in</Link></p>
        </div>
      </main>
      <Footer />
    </>
  );
}
