import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './SignIn.module.css';

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

const INITIAL = { username: '', password: '' };

function validate(data) {
  const errs = {};
  if (!data.username.trim()) {
    errs.username = 'Username is required.';
  }
  if (!data.password) {
    errs.password = 'Password is required.';
  } else if (data.password.length < 6) {
    errs.password = 'Password must be at least 6 characters.';
  }
  return errs;
}

export default function SignIn() {
  const [formData, setFormData] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);

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
    setTouched({ username: true, password: true });
    const errs = validate(formData);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    // TODO: connect to auth service
    console.log('Sign in:', formData);
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
              <h1 className={styles.title}>Welcome Back</h1>
              <p className={styles.subtitle}>
                Sign in to continue your reading journey
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
                    id="signin-username"
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
                    htmlFor="signin-username"
                    className={styles.floatLabel}
                  >
                    Username
                  </label>
                </div>
                {fieldError('username') && (
                  <span className={styles.errorMsg}>{errors.username}</span>
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
                    id="signin-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder=" "
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={styles.input}
                    autoComplete="current-password"
                  />
                  <label
                    htmlFor="signin-password"
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

              <button type="submit" className={styles.submitBtn}>
                <span>Log in</span>
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
              Don&apos;t have an account?{' '}
              <Link to="/signup" className={styles.switchLink}>
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
