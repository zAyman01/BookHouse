import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from 'recharts';
import logo from '../assets/bookhouse-logo.png';
import useAuth from '../hooks/useAuth';
import * as bookService from '../services/book.service';
import { useNotification } from '../context/NotificationContext';
import styles from './AuthorDashboard.module.css';

const API = (import.meta.env.VITE_API_URL || '/api').replace('/api', '');
const COLORS = ['#1B3A6B', '#C9A84C', '#3A7D5A', '#4A8FD4', '#B33A3A', '#7C5C8A', '#2D6A4F', '#D4724A'];

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
  { id: 'books', label: 'My Books', icon: 'book' },
  { id: 'upload', label: 'Upload', icon: 'upload' },
  { id: 'earnings', label: 'Earnings', icon: 'dollar' },
];

function NavIcon({ type }) {
  const p = { stroke: 'currentColor', strokeWidth: '2', fill: 'none' };
  if (type === 'grid') return <svg width="18" height="18" viewBox="0 0 24 24" {...p}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>;
  if (type === 'book') return <svg width="18" height="18" viewBox="0 0 24 24" {...p}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>;
  if (type === 'upload') return <svg width="18" height="18" viewBox="0 0 24 24" {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>;
  return <svg width="18" height="18" viewBox="0 0 24 24" {...p}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>;
}

function UploadForm({ onSuccess }) {
  const ref = useRef(null);
  const { success, error } = useNotification();
  const [form, setForm] = useState({ title: '', genre: '', description: '', price: '' });
  const [cover, setCover] = useState(null);
  const [preview, setPreview] = useState(null);
  const [drag, setDrag] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) { error('Image must be under 5 MB'); return; }
    setCover(file);
    const r = new FileReader(); r.onload = (e) => setPreview(e.target.result); r.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadError('');
    if (!form.title) { error('Title is required'); return; }
    if ((form.description || '').length < 10) { error('Description must be at least 10 characters'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('genre', form.genre || 'Fiction');
      fd.append('description', form.description || 'A fascinating book that will captivate readers from start to finish.');
      fd.append('price', form.price || '9.99');
      if (cover) fd.append('coverImage', cover);
      await bookService.createBook(fd);
      success('Book published successfully!');
      setForm({ title: '', genre: '', description: '', price: '' });
      setCover(null); setPreview(null);
      onSuccess?.();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create book';
      setUploadError(msg);
      error(msg);
    } finally { setSaving(false); }
  };

  const COLORS = ['#1B3A6B', '#C9A84C', '#3A7D5A', '#4A8FD4', '#B33A3A', '#7C5C8A', '#2D6A4F', '#D4724A'];
  const colorIdx = ['Fiction','Fantasy','Science Fiction','Mystery','Classic','History','Romance','Philosophy','Biography','Technology','Horror','Self-Help'].indexOf(form.genre);
  const cardColor = COLORS[Math.max(0, colorIdx) % COLORS.length];

  return (
    <section className={styles.uploadLayout}>
      <div className={styles.uploadFormCol}>
        <div className={styles.uploadHead}>
          <h2 className={styles.uploadTitle}>Publish New Book</h2>
          <p className={styles.uploadSub}>Share your next masterpiece with the world</p>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label>Book Title</label>
            <input type="text" placeholder="e.g. The Dragon Kingdom" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
          </div>
          <div className={styles.fieldRow}>
            <div className={styles.field}><label>Genre</label>
              <select value={form.genre} onChange={e => setForm(p => ({ ...p, genre: e.target.value }))} required>
                <option value="">Select genre</option>
                {['Fiction','Fantasy','Science Fiction','Mystery','Classic','History','Romance','Philosophy','Biography','Technology','Horror','Self-Help'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className={styles.field}><label>Price ($)</label>
              <input type="number" step="0.01" min="0" placeholder="9.99" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
            </div>
          </div>
          <div className={styles.field}>
            <label>Description</label>
            <textarea placeholder="Write a short summary (min 10 characters)..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} />
          </div>
          <div className={styles.field}>
            <label>Cover Image</label>
            <div className={`${styles.dropZone} ${drag ? styles.dragging : ''}`}
              onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
              onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
              onClick={() => ref.current?.click()} role="button" tabIndex={0}>
              {preview ? <img src={preview} alt="" className={styles.previewImg} /> : <><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg><p>Drop cover or click to browse</p></>}
              <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" className={styles.hidden} onChange={e => handleFile(e.target.files[0])} />
            </div>
          </div>
          {uploadError && <div className={styles.uploadError}>{uploadError}</div>}
          <button type="submit" className={styles.submit} disabled={saving}>{saving ? 'Publishing...' : 'Publish Book'}</button>
        </form>
      </div>

      <div className={styles.uploadPreviewCol}>
        <p className={styles.previewLabel}>Preview</p>
        <div className={styles.previewCard}>
          <div className={styles.previewCover} style={{ background: cardColor }}>
            {preview ? (
              <img src={preview} alt="" className={styles.previewCoverImg} />
            ) : (
              <div className={styles.previewCoverPlaceholder}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                <span>Cover</span>
              </div>
            )}
          </div>
          <div className={styles.previewBody}>
            {form.genre && <span className={styles.previewGenre}>{form.genre}</span>}
            <h3 className={styles.previewTitle}>{form.title || 'Book Title'}</h3>
            <p className={styles.previewPrice}>${form.price || '9.99'}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function AuthorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error } = useNotification();
  const [nav, setNav] = useState('dashboard');
  const [analytics, setAnalytics] = useState(null);
  const [myBooks, setMyBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBook, setEditingBook] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', genre: '', price: '', description: '' });
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadData = () => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      bookService.getBookAnalytics().catch(() => null),
      bookService.getMyBooks().catch(() => ({ books: [] })),
    ])
      .then(([a, b]) => {
        if (a) setAnalytics(a);
        setMyBooks(b.books || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const img = (c) => c ? (c.startsWith('http') ? c : `${API}/${c.replace(/\\/g, '/')}`) : '';

  const handleEditBook = (book) => {
    setEditingBook(book._id);
    setEditForm({ title: book.title, genre: book.genre || '', price: String(book.price || ''), description: book.description || '' });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const fd = new FormData();
      fd.append('title', editForm.title);
      fd.append('genre', editForm.genre);
      fd.append('description', editForm.description || 'No description');
      fd.append('price', editForm.price || '9.99');
      await bookService.updateBook(editingBook, fd);
      success('Book updated');
      setEditingBook(null);
      loadData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update');
    } finally { setSavingEdit(false); }
  };

  const handleDeleteBook = async (bookId) => {
    if (deletingId === bookId) {
      try {
        await bookService.deleteBook(bookId);
        success('Book deleted');
        setDeletingId(null);
        loadData();
      } catch (err) {
        error(err.response?.data?.message || 'Failed to delete');
      }
    } else {
      setDeletingId(bookId);
      setTimeout(() => setDeletingId((id) => id === bookId ? null : id), 3000);
    }
  };

  const handlePublishBook = async (bookId) => {
    try {
      await bookService.publishBook(bookId);
      success('Book published!');
      loadData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to publish');
    }
  };

  const a = analytics || { totalBooks: 0, totalSales: 0, totalRevenue: 0, averageRating: 0, thisMonthSales: 0, thisMonthRevenue: 0, monthlyRevenue: [], genreBreakdown: [], topBook: null, books: [] };

  const TooltipCard = ({ active, payload, label }) => {
    if (active && payload?.length) return (
      <div className={styles.tooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        {payload.map((p, i) => <p key={i} className={styles.tooltipVal} style={{ color: p.color }}>{p.name}: ${p.value.toFixed(2)}</p>)}
      </div>
    );
    return null;
  };

  const renderDashboard = () => {
    if (loading) return (
      <div className={styles.loadingGrid}>
        {[1,2,3,4,5,6].map(i => <div key={i} className={styles.skeleton}><div className={styles.skelBar} /></div>)}
      </div>
    );

    const months = a.monthlyRevenue;
    const genreData = a.genreBreakdown;

    return (
      <>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{a.totalBooks}</span>
            <span className={styles.statLabel}>Published</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{a.averageRating.toFixed(1)}</span>
            <span className={styles.statLabel}>Avg Rating</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{a.totalSales}</span>
            <span className={styles.statLabel}>Total Sales</span>
            <span className={styles.statDelta}>+{a.thisMonthSales} this month</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNum}>${a.totalRevenue.toFixed(0)}</span>
            <span className={styles.statLabel}>Total Revenue</span>
            <span className={styles.statDelta}>+${a.thisMonthRevenue.toFixed(0)} this month</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNum}>${a.thisMonthRevenue.toFixed(0)}</span>
            <span className={styles.statLabel}>Revenue (30d)</span>
            {a.totalBooks > 0 && <span className={styles.statDelta}>${(a.thisMonthRevenue / a.totalBooks).toFixed(2)} / book</span>}
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{a.thisMonthSales}</span>
            <span className={styles.statLabel}>Sales (30d)</span>
            {a.thisMonthSales > 0 && <span className={styles.statDelta}>{(a.thisMonthSales / (a.books.length || 1)).toFixed(1)} / book</span>}
          </div>
        </div>

        <div className={styles.chartsRow}>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Monthly Revenue</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={months}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} tickFormatter={v => v.slice(5)} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} tickFormatter={v => `$${v}`} />
                <Tooltip content={<TooltipCard />} />
                <Bar dataKey="revenue" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {months.map((_, i) => <Cell key={i} fill={i === months.length - 1 ? 'var(--color-primary)' : 'var(--color-blue)'} fillOpacity={i === months.length - 1 ? 1 : 0.5} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Sales by Genre</h3>
            <div className={styles.pieWrap}>
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie data={genreData} dataKey="sales" nameKey="genre" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {genreData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className={styles.legendCol}>
                {genreData.map((g, i) => (
                  <div key={i} className={styles.legendRow}>
                    <span className={styles.legendDot} style={{ background: COLORS[i % COLORS.length] }} />
                    <span className={styles.legendName}>{g.genre}</span>
                    <span className={styles.legendVal}>{g.sales}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.bottomRow}>
          <section className={styles.worksSection}>
            <div className={styles.worksHead}>
              <h2>Published Works</h2>
              <button className={styles.viewAllBtn} onClick={() => setNav('books')}>View All →</button>
            </div>
            {a.books.length === 0 ? (
              <p className={styles.emptyText}>No books published yet.</p>
            ) : (
              <div className={styles.worksGrid}>
                {a.books.slice(0, 6).map((book) => (
                  <div key={book._id} className={styles.miniCard} onClick={() => navigate(`/book-detail/${book._id}`)}>
                    <div className={styles.miniCover}>
                      {book.coverImage ? <img src={img(book.coverImage)} alt={book.title} /> : <div className={styles.miniPlaceholder}>{book.title?.charAt(0)}</div>}
                    </div>
                    <div className={styles.miniInfo}>
                      <p className={styles.miniTitle}>{book.title}</p>
                      <p className={styles.miniStats}>{book.sales} sales · ${book.revenue.toFixed(0)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
          <div className={styles.sidePanel}>
            {a.topBook && (
              <div className={styles.topCard} onClick={() => navigate(`/book-detail/${a.topBook._id}`)}>
                <h3 className={styles.chartTitle}>Top Seller</h3>
                <div className={styles.topInner}>
                  <div className={styles.topCover}>
                    {a.topBook.coverImage ? <img src={img(a.topBook.coverImage)} alt={a.topBook.title} /> : <div className={styles.miniPlaceholder}>{a.topBook.title?.charAt(0)}</div>}
                  </div>
                  <div>
                    <p className={styles.topTitle}>{a.topBook.title}</p>
                    <p className={styles.topStat}>{a.topBook.sales} sales</p>
                    <p className={styles.topStat}>${a.topBook.revenue.toFixed(0)} revenue</p>
                  </div>
                </div>
              </div>
            )}
            <div className={styles.quickCard}>
              <h3 className={styles.chartTitle}>Quick Action</h3>
              <p className={styles.quickText}>Publish a new book to reach more readers.</p>
              <button className={styles.quickBtn} onClick={() => setNav('upload')}>+ New Book</button>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderBooks = () => {
    if (loading) return <div className={styles.loadingGrid}>{[1,2,3,4,5,6].map(i => <div key={i} className={styles.skeleton}><div className={styles.skelCover} /><div className={styles.skelBar} /></div>)}</div>;
    if (myBooks.length === 0) return <p className={styles.emptyText}>No books yet. Upload your first book!</p>;
    return (
      <>
      <div className={styles.booksGrid}>
        {myBooks.map((book) => (
          <div key={book._id} className={styles.bookCard}>
            <div className={styles.bookCardCover} onClick={() => navigate(`/book-detail/${book._id}`)}>
              {book.coverImage ? <img src={img(book.coverImage)} alt={book.title} /> : <div className={styles.cPlaceholder}>{book.title?.charAt(0)}</div>}
            </div>
            <div className={styles.bookCardBody}>
              <h3 className={styles.bookCardTitle}>{book.title}</h3>
              <p className={styles.bookCardGenre}>{book.genre}</p>
              <div className={styles.bookCardFooter}>
                <span className={styles.bookCardPrice}>${Number(book.price).toFixed(2)}</span>
                <span className={styles.bookCardRating}>★ {book.ratingsAverage?.toFixed(1) || '0.0'}</span>
              </div>
              <div className={styles.bookActions}>
                {!book.isPublished && (
                  <button className={styles.publishBtn} onClick={() => handlePublishBook(book._id)}>Publish</button>
                )}
                {book.isPublished && <span className={styles.publishedBadge}>Published</span>}
                <button className={styles.editBtn} onClick={() => handleEditBook(book)}>Edit</button>
                <button className={`${styles.delBtn} ${deletingId === book._id ? styles.confirmBtn : ''}`} onClick={() => handleDeleteBook(book._id)}>
                  {deletingId === book._id ? 'Confirm?' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingBook && (
        <div className={styles.modalOverlay} onClick={() => setEditingBook(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Edit Book</h3>
            <form onSubmit={handleSaveEdit} className={styles.modalForm}>
              <div className={styles.field}><label>Title</label><input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} required /></div>
              <div className={styles.fieldRow}>
                <div className={styles.field}><label>Genre</label><select value={editForm.genre} onChange={e => setEditForm(f => ({ ...f, genre: e.target.value }))}>
                  {['Fiction','Fantasy','Science Fiction','Mystery','Classic','History','Romance','Philosophy','Biography','Technology','Horror','Self-Help'].map(g => <option key={g} value={g}>{g}</option>)}
                </select></div>
                <div className={styles.field}><label>Price</label><input type="number" step="0.01" value={editForm.price} onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))} /></div>
              </div>
              <div className={styles.field}><label>Description</label><textarea rows={3} value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setEditingBook(null)}>Cancel</button>
                <button type="submit" className={styles.submit} disabled={savingEdit}>{savingEdit ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      </>
    );
  };

  const renderEarnings = () => {
    const months = a.monthlyRevenue;
    return (
      <div>
        <h2 className={styles.sectionTitle}>Earnings</h2>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}><span className={styles.statNum}>${a.totalRevenue.toFixed(0)}</span><span className={styles.statLabel}>Total Revenue</span></div>
          <div className={styles.statCard}><span className={styles.statNum}>${a.thisMonthRevenue.toFixed(0)}</span><span className={styles.statLabel}>This Month</span></div>
          <div className={styles.statCard}><span className={styles.statNum}>{a.totalSales}</span><span className={styles.statLabel}>Total Sales</span></div>
          <div className={styles.statCard}><span className={styles.statNum}>{a.totalBooks}</span><span className={styles.statLabel}>Books</span></div>
        </div>
        <div className={styles.chartsRow}>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Revenue Trend (6 Months)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={months}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} tickFormatter={v => v.slice(5)} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} tickFormatter={v => `$${v}`} />
                <Tooltip content={<TooltipCard />} />
                <Line type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2} dot={{ fill: 'var(--color-primary)', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Revenue by Genre</h3>
            <div className={styles.pieWrap}>
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie data={a.genreBreakdown} dataKey="revenue" nameKey="genre" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {a.genreBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `$${v.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className={styles.legendCol}>
                {a.genreBreakdown.map((g, i) => (
                  <div key={i} className={styles.legendRow}>
                    <span className={styles.legendDot} style={{ background: COLORS[i % COLORS.length] }} />
                    <span className={styles.legendName}>{g.genre}</span>
                    <span className={styles.legendVal}>${g.revenue.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (nav) {
      case 'dashboard': return renderDashboard();
      case 'books': return renderBooks();
      case 'upload': return <UploadForm onSuccess={loadData} />;
      case 'earnings': return renderEarnings();
      default: return renderDashboard();
    }
  };

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
          <Link to="/account" className={styles.sideUserLink}>
            <div className={styles.userAvatar}>{user?.name?.charAt(0)?.toUpperCase() || 'A'}</div>
            <span className={styles.userName}>{user?.name || 'Author'}</span>
          </Link>
        </div>
      </aside>
      <div className={styles.mainArea}>
        <div className={styles.topBar}>
          <h1 className={styles.pageTitle}>
            {nav === 'dashboard' && 'Dashboard'}
            {nav === 'books' && 'My Books'}
            {nav === 'upload' && 'Publish Book'}
            {nav === 'earnings' && 'Earnings'}
          </h1>
          <p className={styles.pageSub}>Welcome back, {user?.name?.split(' ')[0] || 'Author'}</p>
        </div>
        {renderContent()}
      </div>
    </div>
  );
}
