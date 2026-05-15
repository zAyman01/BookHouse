import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Spinner from '../components/Spinner';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import * as bookService from '../services/book.service';
import * as reviewService from '../services/review.service';
import styles from './Book-Detail.module.css';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

const TABS = ['About', 'Reviews', 'Author Bio', 'Similar Books'];

function StarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function StarEmptyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { success } = useNotification();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('About');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      bookService.getBook(id).catch(() => null),
      reviewService.getReviews(id).catch(() => ({ reviews: [] })),
    ])
      .then(([b, r]) => {
        if (b) setBook(b.book);
        setReviews(r.reviews || []);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleCart = useCallback(() => {
    if (!book) return;
    addItem({ _id: book._id, title: book.title, price: book.price, authorName: book.authorName }, qty);
    success(`"${book.title}" added to cart`);
  }, [book, qty, addItem, success]);

  const img = (c) => c ? (c.startsWith('http') ? c : `${API}/${c.replace(/\\/g, '/')}`) : '';

  if (loading) return <><Header /><main className={styles.main}><div className={styles.loading}><Spinner size={28} /><p>Loading book...</p></div></main><Footer /></>;
  if (!book) return <><Header /><main className={styles.main}><div className={styles.notFound}><h1>Not Found</h1><button onClick={() => navigate('/library')}>Browse Library</button></div></main><Footer /></>;

  const rt = Number(book.ratingsAverage) || 0;
  const fs = Math.floor(rt);

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.layout}>
          <div className={styles.coverCol}>
            <div className={styles.coverWrap}>
              {book.coverImage ? <img src={img(book.coverImage)} alt={book.title} /> : <div className={styles.coverPlaceholder}>{book.title?.charAt(0)}</div>}
            </div>
          </div>
          <div className={styles.infoCol}>
            <div className={styles.breadcrumb}>
              <button onClick={() => navigate('/library')} className={styles.breadLink}>Library</button>
              <span className={styles.breadSep}>/</span>
              <span className={styles.breadCurrent}>{book.title}</span>
            </div>
            <h1 className={styles.title}>{book.title}</h1>
            <p className={styles.author}>by <strong>{book.authorName}</strong></p>
            {book.genre && (
              <div className={styles.tags}>
                <span className={styles.tag}>{book.genre}</span>
                {book.format && <span className={styles.tag}>{book.format}</span>}
              </div>
            )}
            <div className={styles.ratingRow}>
              <div className={styles.stars}>
                {[1, 2, 3, 4, 5].map(i => <span key={i} className={i <= fs ? styles.starF : styles.starE}>{i <= fs ? <StarIcon /> : <StarEmptyIcon />}</span>)}
              </div>
              <span className={styles.ratingNum}>{rt.toFixed(1)}</span>
              <span className={styles.ratingCount}>({book.ratingsCount || 0} reviews)</span>
            </div>
            {book.price && (
              <div className={styles.priceRow}>
                <span className={styles.price}>${Number(book.price).toFixed(2)}</span>
              </div>
            )}
            <div className={styles.actions}>
              <div className={styles.qty}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))}>&minus;</button>
                <span>{qty}</span>
                <button onClick={() => setQty(q => q + 1)}>+</button>
              </div>
              <button className={styles.addBtn} onClick={handleCart}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                Add to Cart
              </button>
              <button className={styles.iconBtn} aria-label="Bookmark">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              </button>
              <button className={styles.iconBtn} aria-label="Share">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </button>
            </div>
            <div className={styles.tabs}>
              <div className={styles.tabNav}>
                {TABS.map(t => <button key={t} className={`${styles.tabBtn} ${tab === t ? styles.tabActive : ''}`} onClick={() => setTab(t)}>{t}</button>)}
              </div>
              {tab === 'About' && <div className={styles.tabContent}><p>{book.description || 'No description available.'}</p></div>}
              {tab === 'Reviews' && (
                <div className={styles.tabContent}>
                  {reviews.length === 0 ? <p className={styles.noReviews}>No reviews yet.</p> : reviews.map(r => (
                    <div key={r._id} className={styles.review}>
                      <div className={styles.reviewHead}>
                        <div className={styles.reviewAvatar}>{r.userId?.name?.charAt(0) || 'A'}</div>
                        <div>
                          <div className={styles.reviewName}>{r.userId?.name || 'Anonymous'}</div>
                          <div className={styles.reviewStars}>{[1, 2, 3, 4, 5].map(i => <span key={i} className={i <= (r.rating || 0) ? styles.starF : styles.starE}>{i <= (r.rating || 0) ? <StarIcon /> : <StarEmptyIcon />}</span>)}</div>
                        </div>
                      </div>
                      {r.comment && <p className={styles.reviewText}>{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
              {tab === 'Author Bio' && <div className={styles.tabContent}><p>Information about the author will appear here.</p></div>}
              {tab === 'Similar Books' && <div className={styles.tabContent}><p>Similar book recommendations will appear here.</p></div>}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
