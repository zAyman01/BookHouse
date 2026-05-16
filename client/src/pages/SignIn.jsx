import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Spinner from '../components/Spinner';
import useAuth from '../hooks/useAuth';
import { useNotification } from '../context/NotificationContext';
import { fadeUp, staggerContainer, staggerItem, pageTransition } from '../utils/animations';
import styles from './SignIn.module.css';

function EyeIcon({ off }) {
  return off ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { success, error } = useNotification();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = (d) => {
    const errs = {};
    if (!d.email.trim()) errs.email = 'Required';
    if (!d.password) errs.password = 'Required';
    else if (d.password.length < 6) errs.password = 'Min 6 characters';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...form, [name]: value };
    setForm(next);
    if (touched[name]) setErrors(validate(next));
  };

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
    setErrors(validate(form));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitting(true);
    setApiError('');
    try {
      const data = await login(form.email, form.password);
      success(`Welcome back, ${data.user?.name || 'reader'}!`);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      setApiError(msg);
      error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const fieldError = (name) => touched[name] && errors[name];

  return (
    <>
      <Header />
      <motion.main className={styles.main} variants={pageTransition} initial="initial" animate="animate" exit="exit">
        <motion.div className={styles.card} variants={fadeUp}>
          <div className={styles.header}>
            <motion.h1 className={styles.title} variants={fadeUp}>Welcome Back</motion.h1>
            <motion.p className={styles.subtitle} variants={fadeUp}>Sign in to continue your reading journey</motion.p>
          </div>
          <motion.form onSubmit={handleSubmit} className={styles.form} noValidate variants={staggerContainer} initial="initial" animate="animate">
            <motion.div className={styles.field} variants={staggerItem}>
              <label htmlFor="email">Email</label>
              <input id="email" type="email" name="email" value={form.email} onChange={handleChange} onBlur={handleBlur}
                className={fieldError('email') ? styles.error : ''} autoComplete="email" placeholder="you@example.com" />
              {fieldError('email') && <span className={styles.err}>{errors.email}</span>}
            </motion.div>
            <motion.div className={styles.field} variants={staggerItem}>
              <label htmlFor="password">Password</label>
              <div className={styles.inputWrap}>
                <input id="password" type={showPassword ? 'text' : 'password'} name="password" value={form.password}
                  onChange={handleChange} onBlur={handleBlur} className={fieldError('password') ? styles.error : ''} autoComplete="current-password" placeholder="Enter your password" />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'} tabIndex={-1}><EyeIcon off={showPassword} /></button>
              </div>
              {fieldError('password') && <span className={styles.err}>{errors.password}</span>}
            </motion.div>
            {apiError && (
              <div className={styles.apiError}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                {apiError}
              </div>
            )}
            <motion.button type="submit" className={styles.submit} disabled={submitting} variants={staggerItem}>
              {submitting ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Spinner size={16} /> Signing in...</span> : 'Sign In'}
            </motion.button>
          </motion.form>
          <motion.p className={styles.switch} variants={fadeUp}>Don&apos;t have an account? <Link to="/signup">Sign up</Link> &middot; <Link to="/forgot-password">Forgot password?</Link></motion.p>
        </motion.div>
      </motion.main>
      <Footer />
    </>
  );
}
