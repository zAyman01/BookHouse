import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './SignUp.module.css';

const IconUser = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

const IconMail = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M2 7l10 7 10-7" />
  </svg>
);

const IconLock = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconEye = ({ off }) =>
  off ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

const INITIAL = { username: '', email: '', password: '', confirmPassword: '' };

function validate(data) {
  const errs = {};
  if (!data.username.trim()) {
    errs.username = 'Username is required.';
  } else if (data.username.trim().length < 3) {
    errs.username = 'Username must be at least 3 characters.';
  }
  if (!data.email.trim()) {
    errs.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errs.email = 'Enter a valid email address.';
  }
  if (!data.password) {
    errs.password = 'Password is required.';
  } else if (data.password.length < 8) {
    errs.password = 'Password must be at least 8 characters.';
  }
  if (!data.confirmPassword) {
    errs.confirmPassword = 'Please confirm your password.';
  } else if (data.password !== data.confirmPassword) {
    errs.confirmPassword = 'Passwords do not match.';
  }
  return errs;
}

export default function SignUp() {
  const [formData, setFormData] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...formData, [name]: value };
    setFormData(next);
    if (touched[name]) setErrors(validate(next));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors(validate(formData));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({
      username: true,
      email: true,
      password: true,
      confirmPassword: true,
    });
    const errs = validate(formData);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    // TODO: connect to auth service
    console.log('Sign up:', formData);
  };

  const fieldError = (name) => touched[name] && errors[name];

  return (
    <>
      <Header />

      <main className={styles.main}>
        {/* Left — decorative book image with overlay */}
        <div className={styles.imagePanel}>
          <div className={styles.imageOverlay}>
            <div className={styles.brandOverlay}>
              <h2 className={styles.brandName}>BookHouse</h2>
              <p className={styles.brandTag}>
                Your world of stories begins here
              </p>
            </div>
          </div>
        </div>

        {/* Right — form panel */}
        <div className={styles.formPanel}>
          <div className={styles.formCard}>
            <div className={styles.cardHeader}>
              <h1 className={styles.title}>Create Account</h1>
              <p className={styles.subtitle}>
                Join BookHouse and start your journey
              </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form} noValidate>
              {/* Username */}
              <div className={styles.fieldGroup}>
                <div
                  className={`${styles.inputWrapper} ${fieldError('username') ? styles.hasError : ''}`}
                >
                  <span className={styles.inputIcon}>
                    <IconUser />
                  </span>
                  <input
                    id="signup-username"
                    type="text"
                    name="username"
                    placeholder=" "
                    value={formData.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={styles.input}
                    autoComplete="username"
                  />
                  <label
                    htmlFor="signup-username"
                    className={styles.floatLabel}
                  >
                    Username
                  </label>
                </div>
                {fieldError('username') && (
                  <span className={styles.errorMsg}>{errors.username}</span>
                )}
              </div>

              {/* Email */}
              <div className={styles.fieldGroup}>
                <div
                  className={`${styles.inputWrapper} ${fieldError('email') ? styles.hasError : ''}`}
                >
                  <span className={styles.inputIcon}>
                    <IconMail />
                  </span>
                  <input
                    id="signup-email"
                    type="email"
                    name="email"
                    placeholder=" "
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={styles.input}
                    autoComplete="email"
                  />
                  <label htmlFor="signup-email" className={styles.floatLabel}>
                    Email address
                  </label>
                </div>
                {fieldError('email') && (
                  <span className={styles.errorMsg}>{errors.email}</span>
                )}
              </div>

              {/* Password */}
              <div className={styles.fieldGroup}>
                <div
                  className={`${styles.inputWrapper} ${fieldError('password') ? styles.hasError : ''}`}
                >
                  <span className={styles.inputIcon}>
                    <IconLock />
                  </span>
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder=" "
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={styles.input}
                    autoComplete="new-password"
                  />
                  <label
                    htmlFor="signup-password"
                    className={styles.floatLabel}
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    <IconEye off={showPassword} />
                  </button>
                </div>
                {fieldError('password') && (
                  <span className={styles.errorMsg}>{errors.password}</span>
                )}
              </div>

              {/* Confirm Password */}
              <div className={styles.fieldGroup}>
                <div
                  className={`${styles.inputWrapper} ${fieldError('confirmPassword') ? styles.hasError : ''}`}
                >
                  <span className={styles.inputIcon}>
                    <IconLock />
                  </span>
                  <input
                    id="signup-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder=" "
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={styles.input}
                    autoComplete="new-password"
                  />
                  <label htmlFor="signup-confirm" className={styles.floatLabel}>
                    Confirm Password
                  </label>
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    <IconEye off={showConfirm} />
                  </button>
                </div>
                {fieldError('confirmPassword') && (
                  <span className={styles.errorMsg}>
                    {errors.confirmPassword}
                  </span>
                )}
              </div>

              <button type="submit" className={styles.submitBtn}>
                <span>Create Account</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </form>

            <p className={styles.switchText}>
              Already have an account?{' '}
              <Link to="/signin" className={styles.switchLink}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
