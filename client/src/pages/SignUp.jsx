import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Spinner from '../components/Spinner';
import useAuth from '../hooks/useAuth';
import { useNotification } from '../context/NotificationContext';
import { fadeUp, staggerContainer, staggerItem, pageTransition } from '../utils/animations';
import styles from './SignUp.module.css';

const INITIAL = { name: '', email: '', password: '', confirmPassword: '', role: 'user' };

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

function validate(data) {
  const errs = {};
  if (!data.name.trim()) errs.name = 'Required';
  else if (data.name.trim().length < 2) errs.name = 'Min 2 characters';
  if (!data.email.trim()) errs.email = 'Required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errs.email = 'Invalid email';
  if (!data.password) errs.password = 'Required';
  else if (data.password.length < 8) errs.password = 'Min 8 characters';
  if (!data.confirmPassword) errs.confirmPassword = 'Required';
  else if (data.password !== data.confirmPassword) errs.confirmPassword = 'Passwords do not match';
  return errs;
}

export default function SignUp() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { success, error } = useNotification();
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

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
    setTouched({ name: true, email: true, password: true, confirmPassword: true });
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitting(true);
    setApiError('');
    try {
      await register(form.name, form.email, form.password, form.role);
      success('Account created! Welcome to BookHouse.');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
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
            <motion.h1 className={styles.title} variants={fadeUp}>Create Account</motion.h1>
            <motion.p className={styles.subtitle} variants={fadeUp}>Join BookHouse and start your journey</motion.p>
          </div>
          <motion.form onSubmit={handleSubmit} className={styles.form} noValidate variants={staggerContainer} initial="initial" animate="animate">
            <motion.div className={styles.field} variants={staggerItem}>
              <label htmlFor="name">Full Name</label>
              <input id="name" type="text" name="name" value={form.name} onChange={handleChange} onBlur={handleBlur}
                className={fieldError('name') ? styles.error : ''} autoComplete="name" placeholder="John Doe" />
              {fieldError('name') && <span className={styles.err}>{errors.name}</span>}
            </motion.div>
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
                  onChange={handleChange} onBlur={handleBlur} className={fieldError('password') ? styles.error : ''} autoComplete="new-password" placeholder="Min 8 characters" />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'} tabIndex={-1}><EyeIcon off={showPassword} /></button>
              </div>
              {fieldError('password') && <span className={styles.err}>{errors.password}</span>}
            </motion.div>
            <motion.div className={styles.field} variants={staggerItem}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className={styles.inputWrap}>
                <input id="confirmPassword" type={showConfirm ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword}
                  onChange={handleChange} onBlur={handleBlur} className={fieldError('confirmPassword') ? styles.error : ''} autoComplete="new-password" placeholder="Repeat password" />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirm(v => !v)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'} tabIndex={-1}><EyeIcon off={showConfirm} /></button>
              </div>
              {fieldError('confirmPassword') && <span className={styles.err}>{errors.confirmPassword}</span>}
            </motion.div>
            <motion.div className={styles.field} variants={staggerItem}>
              <label>Account Type</label>
              <div className={styles.roleGroup}>
                <label className={`${styles.roleOption} ${form.role === 'user' ? styles.roleActive : ''}`}>
                  <input type="radio" name="role" value="user" checked={form.role === 'user'} onChange={handleChange} />
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                  <span>Reader</span>
                </label>
                <label className={`${styles.roleOption} ${form.role === 'author' ? styles.roleActive : ''}`}>
                  <input type="radio" name="role" value="author" checked={form.role === 'author'} onChange={handleChange} />
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                  <span>Author</span>
                </label>
              </div>
            </motion.div>
            {apiError && <motion.p className={styles.apiError} variants={staggerItem}>{apiError}</motion.p>}
            <motion.button type="submit" className={styles.submit} disabled={submitting} variants={staggerItem} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              {submitting ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Spinner size={16} /> Creating...</span> : 'Create Account'}
            </motion.button>
          </motion.form>
          <motion.p className={styles.switch} variants={fadeUp}>Already have an account? <Link to="/signin">Sign in</Link></motion.p>
        </motion.div>
      </motion.main>
      <Footer />
    </>
  );
}
