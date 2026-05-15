import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/bookhouse-logo.png';
import book1 from '../assets/dashboard-book1.jpg';
import book2 from '../assets/dashboard-book2.jpg';
import styles from './AuthorDashboard.module.css';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
  { id: 'books', label: 'My Books', icon: 'book' },
  { id: 'upload', label: 'Upload', icon: 'upload' },
  { id: 'reviews', label: 'Reviews', icon: 'star' },
  { id: 'earnings', label: 'Earnings', icon: 'dollar' },
];

const STATS = [
  { id: 'sales', label: 'Total Sales', value: '26,650', change: '+14%', color: 'blue' },
  { id: 'rating', label: 'Avg. Rating', value: '4.9/5.0', change: '+0.1', color: 'gold' },
  { id: 'revenue', label: 'Monthly Revenue', value: '$8,240', change: '+$1.2k', color: 'green' },
];

const PUBLISHED = [
  { id: 1, title: 'Read People Like a Book', image: book1, author: 'LEARNTYSELF', genre: 'Fantasy', sales: '12,504', status: 'Published', coverBg: '#1a3a5c' },
  { id: 2, title: 'How to Stop Worrying', image: book2, author: 'Dale Carnegie', genre: 'Mystery', sales: '0', status: 'In-Review', coverBg: '#2d1a4a' },
];

const GENRES = ['Fantasy', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'Historical', 'Non-Fiction', 'Biography', 'Horror', 'YA'];

function NavIcon({ type }) {
  const p = { stroke: 'currentColor', strokeWidth: '2', fill: 'none' };
  if (type === 'grid') return <svg width="18" height="18" viewBox="0 0 24 24" {...p}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>;
  if (type === 'book') return <svg width="18" height="18" viewBox="0 0 24 24" {...p}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>;
  if (type === 'upload') return <svg width="18" height="18" viewBox="0 0 24 24" {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>;
  if (type === 'star') return <svg width="18" height="18" viewBox="0 0 24 24" {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
  return <svg width="18" height="18" viewBox="0 0 24 24" {...p}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>;
}

function TrendIcon() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>; }

function HeartIcon({ filled }) {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>;
}

function StatCard({ label, value, change, color }) {
  const c = color === 'blue' ? styles.iconBlue : color === 'gold' ? styles.iconGold : styles.iconGreen;
  return (
    <article className={styles.statCard}>
      <div className={`${styles.statIcon} ${c}`}>
        {color === 'blue' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>}
        {color === 'gold' && <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>}
        {color === 'green' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>}
      </div>
      <div>
        <p className={styles.statLabel}>{label}</p>
        <p className={styles.statValue}>{value}</p>
        <span className={styles.statChange}><TrendIcon />{change}</span>
      </div>
    </article>
  );
}

function BookCard({ book }) {
  const [liked, setLiked] = useState(false);
  return (
    <article className={styles.bookCard}>
      <div className={styles.bookCover} style={{ backgroundColor: book.coverBg }}>
        <span className={`${styles.bookStatus} ${book.status === 'Published' ? styles.published : styles.review}`}>{book.status}</span>
        <button className={`${styles.likeBtn} ${liked ? styles.liked : ''}`} onClick={() => setLiked(v => !v)} aria-label="Like"><HeartIcon filled={liked} /></button>
        <img src={book.image} alt={book.title} className={styles.bookImg} />
      </div>
      <div className={styles.bookBody}>
        <p className={styles.bookAuthor}>{book.author}</p>
        <h3 className={styles.bookTitle}>{book.title}</h3>
        <div className={styles.bookMeta}><span>{book.genre}</span><span>{book.sales} Sales</span></div>
      </div>
    </article>
  );
}

function UploadForm() {
  const ref = useRef(null);
  const [form, setForm] = useState({ title: '', genre: '', description: '', about: '', cover: null });
  const [preview, setPreview] = useState(null);
  const [drag, setDrag] = useState(false);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setForm(p => ({ ...p, cover: file }));
    const r = new FileReader(); r.onload = (e) => setPreview(e.target.result); r.readAsDataURL(file);
  };

  return (
    <section className={styles.upload}>
      <div className={styles.uploadHead}>
        <h2 className={styles.uploadTitle}>Upload Manuscript</h2>
        <p className={styles.uploadSub}>Ready to share your next masterpiece?</p>
      </div>
      <form className={styles.form} onSubmit={e => { e.preventDefault(); alert('Submitted!'); }}>
        <div className={styles.field}>
          <label>Book Title</label>
          <input type="text" placeholder="e.g. The Dragon Kingdom" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
        </div>
        <div className={styles.field}>
          <label>Genre</label>
          <select value={form.genre} onChange={e => setForm(p => ({ ...p, genre: e.target.value }))} required>
            <option value="">Select genre</option>
            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <label>Description</label>
          <textarea placeholder="Short summary..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} />
        </div>
        <div className={styles.field}>
          <label>Cover Image</label>
          <div className={`${styles.dropZone} ${drag ? styles.dragging : ''}`}
            onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => ref.current?.click()} role="button" tabIndex={0}>
            {preview ? <img src={preview} alt="" className={styles.previewImg} /> : <><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg><p>Drop or click to browse</p></>}
            <input ref={ref} type="file" accept="image/*" className={styles.hidden} onChange={e => handleFile(e.target.files[0])} />
          </div>
        </div>
        <button type="submit" className={styles.submit}>Submit for Review</button>
      </form>
    </section>
  );
}

export default function AuthorDashboard() {
  const [nav, setNav] = useState('dashboard');
  const author = { name: 'Elena Vance', initials: 'EV', storage: 80 };

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sideLogo}>
          <Link to="/">
            <img src={logo} alt="" className={styles.logoImg} />
            <span className={styles.logoText}>Book<strong>House</strong></span>
          </Link>
        </div>
        <nav className={styles.sideNav}>
          {NAV_ITEMS.map(({ id, label, icon }) => (
            <button key={id} className={`${styles.navItem} ${nav === id ? styles.navActive : ''}`} onClick={() => setNav(id)}>
              <NavIcon type={icon} /><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className={styles.sideFoot}>
          <div className={styles.storageLabel}>Pro Plan</div>
          <div className={styles.storageBar}><div className={styles.storageFill} style={{ width: `${author.storage}%` }} /></div>
          <p className={styles.storageText}>{author.storage}% storage used</p>
          <div className={styles.sideUser}>
            <div className={styles.userAvatar}>{author.initials}</div>
            <span>{author.name}</span>
          </div>
        </div>
      </aside>
      <div className={styles.main}>
        <div className={styles.top}>
          <div>
            <h1 className={styles.pageTitle}>Creative Sanctuary</h1>
            <p className={styles.pageSub}>Good morning, Clara. Your stories are inviting readers.</p>
          </div>
          <button className={styles.newBtn}>+ New Manuscript</button>
        </div>
        <div className={styles.statsRow}>{STATS.map(s => <StatCard key={s.id} {...s} />)}</div>
        <div className={styles.contentGrid}>
          <section className={styles.works}>
            <div className={styles.worksHead}>
              <h2>Published Works</h2>
              <Link to="/library">View All Library</Link>
            </div>
            <div className={styles.worksGrid}>{PUBLISHED.map(b => <BookCard key={b.id} book={b} />)}</div>
          </section>
          <UploadForm />
        </div>
      </div>
    </div>
  );
}
