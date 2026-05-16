import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Spinner from '../components/Spinner';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import useAuth from '../hooks/useAuth';
import * as bookService from '../services/book.service';
import * as reviewService from '../services/review.service';
import * as userService from '../services/user.service';
import styles from './Book-Detail.module.css';

const API = (import.meta.env.VITE_API_URL || '/api').replace('/api', '');
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
  const { success, error } = useNotification();
  const { user, isAuthenticated } = useAuth();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [similarBooks, setSimilarBooks] = useState([]);
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('About');
  const [hasPurchased, setHasPurchased] = useState(false);
  const [myReview, setMyReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewHover, setReviewHover] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [reviewError, setReviewError] = useState('');

  const loadReviews = useCallback(() => {
    if (!id) return;
    reviewService.getReviews(id).then((data) => {
      const all = data.reviews || [];
      setReviews(all);
      if (user) {
        const mine = all.find((r) => r.userId?._id === user._id);
        setMyReview(mine || null);
        setHasPurchased(user.library?.some((lid) => lid === id) || false);
      }
    }).catch(() => {});
  }, [id, user]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      bookService.getBook(id).catch(() => null),
      reviewService.getReviews(id).catch(() => ({ reviews: [] })),
      isAuthenticated ? userService.getFavorites().catch(() => ({ books: [] })) : Promise.resolve({ books: [] }),
    ])
      .then(([b, r, fav]) => {
        if (b) {
          setBook(b.book);
          setFavorited((fav.books || []).some(f => f._id === id));
          bookService.getBooks({ genre: b.book.genre, limit: 5 }).then(d => {
            setSimilarBooks((d.books || []).filter(s => s._id !== id));
          }).catch(() => {});
        }
        const all = r.reviews || [];
        setReviews(all);
        if (user) {
          const mine = all.find((rev) => rev.userId?._id === user._id);
          setMyReview(mine || null);
        }
      })
      .finally(() => setLoading(false));
  }, [id, isAuthenticated, user]);

  useEffect(() => { if (tab === 'Reviews') loadReviews(); }, [tab, loadReviews]);

  const handleCart = useCallback(() => {
    if (!book) return;
    addItem({ _id: book._id, title: book.title, price: book.price, authorName: book.authorName }, qty);
    success(`"${book.title}" added to cart`);
  }, [book, qty, addItem, success]);

  const handleFavorite = useCallback(async () => {
    if (!book || !isAuthenticated) { navigate('/signin'); return; }
    try {
      if (favorited) { await userService.removeFavorite(book._id); setFavorited(false); success('Removed from favorites'); }
      else { await userService.addFavorite(book._id); setFavorited(true); success('Added to favorites'); }
    } catch (err) { error(err.response?.data?.message || 'Action failed'); }
  }, [book, favorited, isAuthenticated, navigate, success, error]);

  const handleShare = useCallback(() => {
    const url = window.location.href;
    if (navigator.share) { navigator.share({ title: book?.title || 'BookHouse', url }).catch(() => {}); }
    else { navigator.clipboard.writeText(url).then(() => success('Link copied!')).catch(() => error('Could not copy link')); }
  }, [book, success, error]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    if (!isAuthenticated) { navigate('/signin'); return; }
    if (!hasPurchased) { setReviewError('You must purchase this book before reviewing it.'); return; }
    setSubmitting(true);
    try {
      if (editingReviewId) {
        await reviewService.updateReview(editingReviewId, { rating: reviewRating, comment: reviewComment });
        success('Review updated');
      } else {
        await reviewService.createReview(id, { rating: reviewRating, comment: reviewComment });
        success('Review submitted');
      }
      setReviewRating(5); setReviewComment(''); setEditingReviewId(null);
      loadReviews();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit review';
      setReviewError(msg); error(msg);
    } finally { setSubmitting(false); }
  };

  const handleEditReview = (rev) => {
    setReviewRating(rev.rating);
    setReviewComment(rev.comment || '');
    setEditingReviewId(rev._id);
    setReviewHover(0);
    setReviewError('');
  };

  const handleDeleteReview = async (revId) => {
    try {
      await reviewService.deleteReview(revId);
      success('Review deleted');
      setMyReview(null);
      loadReviews();
    } catch (err) { error(err.response?.data?.message || 'Failed to delete'); }
  };

  const handleCancelEdit = () => {
    setReviewRating(5); setReviewComment(''); setEditingReviewId(null); setReviewError('');
  };

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
              <button className={`${styles.iconBtn} ${favorited ? styles.iconActive : ''}`} onClick={handleFavorite} aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill={favorited ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              </button>
              <button className={styles.iconBtn} onClick={handleShare} aria-label="Share">
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
                  {isAuthenticated && hasPurchased && (
                    <form onSubmit={handleReviewSubmit} className={styles.reviewForm}>
                      <p className={styles.reviewFormTitle}>{editingReviewId ? 'Edit Your Review' : 'Write a Review'}</p>
                      <div className={styles.starInput}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button key={s} type="button" className={s <= (reviewHover || reviewRating) ? styles.starF : styles.starE}
                            onClick={() => setReviewRating(s)} onMouseEnter={() => setReviewHover(s)} onMouseLeave={() => setReviewHover(0)}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                          </button>
                        ))}
                      </div>
                      <textarea className={styles.reviewTextarea} value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="Share your thoughts..." rows={3} />
                      {reviewError && <p className={styles.reviewFormError}>{reviewError}</p>}
                      <div className={styles.reviewFormActions}>
                        {editingReviewId && <button type="button" className={styles.reviewCancelBtn} onClick={handleCancelEdit}>Cancel</button>}
                        <button type="submit" className={styles.reviewSubmitBtn} disabled={submitting}>
                          {submitting ? 'Saving...' : editingReviewId ? 'Update Review' : 'Submit Review'}
                        </button>
                      </div>
                    </form>
                  )}
                  {isAuthenticated && !hasPurchased && !myReview && (
                    <p className={styles.reviewGate}>Purchase this book to leave a review.</p>
                  )}
                  {!isAuthenticated && (
                    <p className={styles.reviewGate}><Link to="/signin">Sign in</Link> and purchase this book to leave a review.</p>
                  )}
                  {reviews.length === 0 ? (
                    <p className={styles.noReviews}>No reviews yet.</p>
                  ) : (
                    reviews.map(r => (
                      <div key={r._id} className={styles.review}>
                        <div className={styles.reviewHead}>
                          <div className={styles.reviewAvatar}>{r.userId?.name?.charAt(0) || 'A'}</div>
                          <div>
                            <div className={styles.reviewName}>{r.userId?.name || 'Anonymous'}</div>
                            <div className={styles.reviewStars}>
                              {[1, 2, 3, 4, 5].map(i => <span key={i} className={i <= (r.rating || 0) ? styles.starF : styles.starE}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                              </span>)}
                              {r.edited && <span className={styles.editedBadge}>(edited)</span>}
                            </div>
                          </div>
                          {user && r.userId?._id === user._id && (
                            <div className={styles.reviewOwnActions}>
                              <button className={styles.reviewActionBtn} onClick={() => handleEditReview(r)} aria-label="Edit">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                              </button>
                              <button className={styles.reviewActionBtn} onClick={() => handleDeleteReview(r._id)} aria-label="Delete">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                              </button>
                            </div>
                          )}
                        </div>
                        {r.comment && <p className={styles.reviewText}>{r.comment}</p>}
                      </div>
                    ))
                  )}
                </div>
              )}

              {tab === 'Author Bio' && (
                <div className={styles.tabContent}>
                  <p>Books by <strong>{book.authorName}</strong>. Visit their <Link to={`/author/${book.author?._id || book.author}`} className={styles.authorLink}>author profile</Link> to see all works.</p>
                </div>
              )}
              {tab === 'Similar Books' && (
                <div className={styles.tabContent}>
                  {similarBooks.length === 0 ? (
                    <p className={styles.noReviews}>No similar books found.</p>
                  ) : (
                    <div className={styles.similarGrid}>
                      {similarBooks.map(sb => (
                        <div key={sb._id} className={styles.similarCard} onClick={() => navigate(`/book-detail/${sb._id}`)}>
                          <div className={styles.similarCover}>
                            {sb.coverImage ? <img src={img(sb.coverImage)} alt={sb.title} /> : <div className={styles.similarPlaceholder}>{sb.title?.charAt(0)}</div>}
                          </div>
                          <div className={styles.similarInfo}>
                            <h4 className={styles.similarTitle}>{sb.title}</h4>
                            <p className={styles.similarAuthor}>{sb.authorName}</p>
                            <span className={styles.similarPrice}>${Number(sb.price).toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
