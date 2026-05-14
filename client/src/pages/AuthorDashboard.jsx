import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/bookhouse-logo.png';
import book1 from '../assets/dashboard-book1.jpg';
import book2 from '../assets/dashboard-book2.jpg';
import styles from './AuthorDashboard.module.css';

/* ─── Inline SVG Icons ─────────────────────────────────────────────── */
const DashboardIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </svg>
);
const BooksIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);
const UploadIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);
const ReviewsIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const EarningsIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const TrendUpIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);
const SalesIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
const StarIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="0"
    aria-hidden="true"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const RevenueIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    <line x1="12" y1="12" x2="12" y2="16" />
    <line x1="10" y1="14" x2="14" y2="14" />
  </svg>
);
const HeartIcon = ({ filled }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
const InfoIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);
const ImageUploadIcon = () => (
  <svg
    width="36"
    height="36"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);
const FacebookIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const TwitterIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);
const InstagramIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const LinkedinIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

/* ─── Data ──────────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', Icon: DashboardIcon },
  { id: 'books', label: 'My Books', Icon: BooksIcon },
  { id: 'upload', label: 'Upload', Icon: UploadIcon },
  { id: 'reviews', label: 'Reviews', Icon: ReviewsIcon },
  { id: 'earnings', label: 'Earnings', Icon: EarningsIcon },
];

const STATS = [
  {
    id: 'sales',
    label: 'Total Sales',
    value: '26,650',
    change: '+14%',
    Icon: SalesIcon,
    iconClass: 'iconBlue',
  },
  {
    id: 'rating',
    label: 'Avg. Rating',
    value: '4.9/5.0',
    change: '+0.1',
    Icon: StarIcon,
    iconClass: 'iconYellow',
  },
  {
    id: 'revenue',
    label: 'Monthly Revenue',
    value: '$8,240.00',
    change: '+$1.2k',
    Icon: RevenueIcon,
    iconClass: 'iconGreen',
  },
];

const PUBLISHED_BOOKS = [
  {
    id: 1,
    title: 'Read People Like a Book',
    image: book1,
    author: 'LEARNTYSELF',
    genre: 'Fantasy',
    sales: '12,504',
    status: 'Published',
    coverBg: '#1a3a5c',
    coverColor: '#a8d5f5',
  },
  {
    id: 2,
    title: 'How to Stop Worrying and Stop Living',
    image: book2,
    author: 'Dale Carnegie',
    genre: 'Mystery',
    sales: '0',
    status: 'In-Review',
    coverBg: '#2d1a4a',
    coverColor: '#d4a8f5',
  },
];

const GENRES = [
  'Fantasy',
  'Mystery',
  'Romance',
  'Science Fiction',
  'Thriller',
  'Historical Fiction',
  'Non-Fiction',
  'Biography',
  'Horror',
  'Young Adult',
];

/* ─── Sub-components ────────────────────────────────────────────────── */
function StatCard(props) {
  const { label, value, change, Icon, iconClass } = props;
  return (
    <article className={styles.statCard} aria-label={`${label}: ${value}`}>
      <div className={`${styles.statIcon} ${styles[iconClass]}`}>
        <Icon />
      </div>
      <div className={styles.statBody}>
        <p className={styles.statLabel}>{label}</p>
        <p className={styles.statValue}>{value}</p>
        <span className={styles.statChange}>
          <TrendUpIcon />
          {change}
        </span>
      </div>
    </article>
  );
}

function BookCard({ book }) {
  const [liked, setLiked] = useState(false);

  return (
    <article className={styles.bookCard}>
      {/* Cover */}
      <div
        className={styles.bookCoverWrapper}
        style={{ backgroundColor: book.coverBg }}
      >
        <span
          className={`${styles.bookStatusBadge} ${styles[book.status.toLowerCase()]}`}
        >
          {book.status}
        </span>
        <button
          className={`${styles.bookLikeBtn} ${liked ? styles.liked : ''}`}
          onClick={() => setLiked((v) => !v)}
          aria-label={liked ? 'Remove from favorites' : 'Add to favorites'}
        >
          <HeartIcon filled={liked} />
        </button>

        <img
          src={book.image}
          alt={`${book.title} cover`}
          className={styles.bookCoverImg}
        />
      </div>

      {/* Info */}
      <div className={styles.bookInfo}>
        <p className={styles.bookAuthor}>{book.author}</p>
        <h3 className={styles.bookTitle}>{book.title.toUpperCase()}</h3>
        <div className={styles.bookMeta}>
          <span className={styles.bookGenre}>{book.genre}</span>
          <span className={styles.bookSales}>{book.sales} Sales</span>
        </div>
        <button
          className={styles.bookInfoBtn}
          aria-label={`More info about ${book.title}`}
        >
          <InfoIcon />
          <span>Details</span>
        </button>
      </div>
    </article>
  );
}

function UploadForm() {
  const coverInputRef = useRef(null);
  const [form, setForm] = useState({
    title: '',
    genre: '',
    shortDescription: '',
    about: '',
    cover: null,
  });
  const [coverPreview, setCoverPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCoverFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setForm((prev) => ({ ...prev, cover: file }));
    const reader = new FileReader();
    reader.onload = (e) => setCoverPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e) => handleCoverFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleCoverFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submission logic will be wired to API
    alert('Manuscript submitted for review!');
  };

  return (
    <section className={styles.uploadPanel} aria-label="Upload Manuscript">
      <div className={styles.uploadPanelHeader}>
        <h2 className={styles.uploadPanelTitle}>Upload Manuscript</h2>
        <p className={styles.uploadPanelSub}>
          Ready to share your next masterpiece?
        </p>
      </div>

      <form className={styles.uploadForm} onSubmit={handleSubmit} noValidate>
        <div className={styles.formGroup}>
          <label htmlFor="bookTitle" className={styles.formLabel}>
            Book Title
          </label>
          <input
            id="bookTitle"
            name="title"
            type="text"
            className={styles.formInput}
            placeholder="e.g. The Dragon Kingdom"
            value={form.title}
            onChange={handleChange}
            required
            maxLength={150}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="genre" className={styles.formLabel}>
            Genre
          </label>
          <select
            id="genre"
            name="genre"
            className={styles.formSelect}
            value={form.genre}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              Select a genre
            </option>
            {GENRES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="shortDescription" className={styles.formLabel}>
            Short Description
          </label>
          <textarea
            id="shortDescription"
            name="shortDescription"
            className={styles.formTextarea}
            placeholder="A short summary for your readers..."
            value={form.shortDescription}
            onChange={handleChange}
            rows={3}
            maxLength={300}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="about" className={styles.formLabel}>
            About
          </label>
          <textarea
            id="about"
            name="about"
            className={styles.formTextarea}
            placeholder="Tell readers about yourself..."
            value={form.about}
            onChange={handleChange}
            rows={3}
            maxLength={250}
          />
          <span className={styles.charCount}>{form.about.length} / 250</span>
        </div>

        {/* Cover Upload */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Cover Image</label>
          <div
            className={`${styles.coverUploadZone} ${dragOver ? styles.dragOver : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            aria-label="Upload cover image"
            onKeyDown={(e) =>
              e.key === 'Enter' && coverInputRef.current?.click()
            }
          >
            {coverPreview ? (
              <img
                src={coverPreview}
                alt="Cover preview"
                className={styles.coverPreview}
              />
            ) : (
              <>
                <ImageUploadIcon />
                <p className={styles.uploadZoneText}>
                  Drag &amp; drop or{' '}
                  <label
                    htmlFor="coverInput"
                    className={styles.uploadBrowseLink}
                  >
                    browse
                  </label>
                </p>
                <p className={styles.uploadZoneHint}>
                  PNG, JPG up to 5MB • 600×900px
                </p>
              </>
            )}
            <input
              ref={coverInputRef}
              id="coverInput"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className={styles.hiddenFileInput}
              onChange={handleFileInput}
            />
          </div>
        </div>

        <button type="submit" className={styles.submitBtn}>
          Submit for Review
        </button>
      </form>
    </section>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────── */
export default function AuthorDashboard() {
  const [activeNav, setActiveNav] = useState('dashboard');

  const author = {
    name: 'Elena Vance',
    initials: 'EV',
    plan: 'Pro Plan',
    storageUsed: 80,
  };

  return (
    <div className={styles.layout}>
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className={styles.sidebar} aria-label="Author navigation">
        {/* Logo */}
        <div className={styles.sidebarLogo}>
          <Link to="/" className={styles.logoLink} aria-label="BookHouse Home">
            <img src={logo} alt="BookHouse" className={styles.logoImg} />
            <span className={styles.logoText}>
              Book<strong>House</strong>
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className={styles.sidebarNav}>
          <ul className={styles.navList} role="list">
            {NAV_ITEMS.map((navItem) => {
              const { id, label, Icon } = navItem;
              return (
                <li key={id}>
                  <button
                    className={`${styles.navItem} ${activeNav === id ? styles.navItemActive : ''}`}
                    onClick={() => setActiveNav(id)}
                    aria-current={activeNav === id ? 'page' : undefined}
                  >
                    <Icon />
                    <span>{label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Pro Plan */}
        <div className={styles.proPlan}>
          <p className={styles.proPlanLabel}>{author.plan}</p>
          <div
            className={styles.storageBar}
            role="progressbar"
            aria-valuenow={author.storageUsed}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Storage: ${author.storageUsed}% used`}
          >
            <div
              className={styles.storageBarFill}
              style={{ width: `${author.storageUsed}%` }}
            />
          </div>
          <p className={styles.storageText}>
            You've reached {author.storageUsed}% of your storage
          </p>
        </div>

        {/* User */}
        <div className={styles.sidebarUser}>
          <div className={styles.userAvatar} aria-hidden="true">
            {author.initials}
          </div>
          <div className={styles.userInfo}>
            <p className={styles.userName}>{author.name}</p>
          </div>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────── */}
      <div className={styles.main}>
        {/* Top Bar */}
        <header className={styles.topBar}>
          <div>
            <h1 className={styles.pageTitle}>Creative Sanctuary</h1>
            <p className={styles.pageSubtitle}>
              Good morning, Clara. Your stories are inviting three readers.
            </p>
          </div>
          <button
            className={styles.newManuscriptBtn}
            aria-label="Create new manuscript"
          >
            + New Manuscript
          </button>
        </header>

        {/* Stats */}
        <section className={styles.statsRow} aria-label="Dashboard statistics">
          {STATS.map((stat) => (
            <StatCard key={stat.id} {...stat} />
          ))}
        </section>

        {/* Content Grid */}
        <div className={styles.contentGrid}>
          {/* Published Works */}
          <section
            className={styles.publishedSection}
            aria-label="Published works"
          >
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Published Works</h2>
              <Link to="/library" className={styles.viewAllLink}>
                View All Library
              </Link>
            </div>
            <div className={styles.booksGrid}>
              {PUBLISHED_BOOKS.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </section>

          {/* Upload Manuscript */}
          <UploadForm />
        </div>

        {/* Footer */}
        <footer className={styles.dashboardFooter}>
          <div className={styles.footerSocial} aria-label="Social media links">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="Facebook"
            >
              <FacebookIcon />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="Twitter"
            >
              <TwitterIcon />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="Instagram"
            >
              <InstagramIcon />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="LinkedIn"
            >
              <LinkedinIcon />
            </a>
          </div>
          <p className={styles.footerCopy}>
            &copy; {new Date().getFullYear()} BookHouse. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
