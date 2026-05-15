import styles from './Spinner.module.css';

export default function Spinner({ size = 20, className = '' }) {
  return (
    <span className={`${styles.spinner} ${className}`} style={{ width: size, height: size }} role="status" aria-label="Loading">
      <svg viewBox="0 0 24 24" fill="none" width={size} height={size}>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.15" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </span>
  );
}
