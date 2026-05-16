import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import useAuth from '../hooks/useAuth';
import { useNotification } from '../context/NotificationContext';
import * as bookService from '../services/book.service';
import * as followService from '../services/follow.service';
import { fadeUp, staggerContainer, staggerItem, pageTransition } from '../utils/animations';
import styles from './AuthorProfile.module.css';

const API = (import.meta.env.VITE_API_URL || '/api').replace('/api', '');

export default function AuthorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { success, error } = useNotification();

  const [author, setAuthor] = useState(null);
  const [books, setBooks] = useState([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      bookService.getBooks({ author: id, limit: 50 }),
      followService.getFollowStats(id),
      currentUser ? followService.checkFollow(id).catch(() => ({ following: false })) : Promise.resolve({ following: false }),
    ])
      .then(([bookData, stats, followCheck]) => {
        setBooks(bookData.books || []);
        setFollowers(stats.followers || 0);
        setFollowing(stats.following || 0);
        setIsFollowing(followCheck.following);
        if (bookData.books?.[0]?.author) setAuthor(bookData.books[0].author);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, currentUser]);

  const handleFollow = async () => {
    if (!currentUser) { navigate('/signin'); return; }
    if (followLoading) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await followService.unfollowUser(id);
        setIsFollowing(false);
        setFollowers((p) => Math.max(0, p - 1));
        success('Unfollowed');
      } else {
        await followService.followUser(id);
        setIsFollowing(true);
        setFollowers((p) => p + 1);
        success('Following');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Action failed');
    } finally {
      setFollowLoading(false);
    }
  };

  const img = (c) => c ? (c.startsWith('http') ? c : `${API}/${c.replace(/\\/g, '/')}`) : '';

  if (loading) {
    return (
      <>
        <Header />
        <main className={styles.main}><p className={styles.loadingText}>Loading author...</p></main>
        <Footer />
      </>
    );
  }

  const firstBook = books[0];

  return (
    <>
      <Header />
      <motion.main className={styles.main} variants={pageTransition} initial="initial" animate="animate" exit="exit">
        <motion.div className={styles.banner} variants={fadeUp}>
          <div className={styles.bannerInner}>
            {author?.avatar ? (
              <img src={author.avatar} alt="" className={styles.avatar} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {author?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
            )}
            <div className={styles.bannerInfo}>
              <h1 className={styles.name}>{firstBook?.authorName || 'Author'}</h1>
              <p className={styles.role}>Author</p>
              <div className={styles.statsRow}>
                <span><strong>{books.length}</strong> books</span>
                <span><strong>{followers}</strong> followers</span>
                <span><strong>{following}</strong> following</span>
              </div>
            </div>
            {currentUser?._id !== id && (
              <motion.button
                className={`${styles.followBtn} ${isFollowing ? styles.following : ''}`}
                onClick={handleFollow}
                disabled={followLoading}
                whileTap={{ scale: 0.95 }}
              >
                {followLoading ? '...' : isFollowing ? (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg> Following</>
                ) : (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg> Follow</>
                )}
              </motion.button>
            )}
          </div>
        </motion.div>

        <motion.section className={styles.booksSection} variants={fadeUp}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Books by {firstBook?.authorName || 'this author'}</h2>
            <span className={styles.count}>{books.length} titles</span>
          </div>
          {books.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No books published yet.</p>
            </div>
          ) : (
            <motion.div className={styles.grid} variants={staggerContainer} initial="initial" animate="animate">
              {books.map((book) => (
                <motion.div key={book._id} className={styles.bookCard} variants={staggerItem} whileHover={{ y: -4 }} onClick={() => navigate(`/book-detail/${book._id}`)}>
                  <div className={styles.bookCover}>
                    {book.coverImage ? (
                      <img src={img(book.coverImage)} alt={book.title} loading="lazy" />
                    ) : (
                      <div className={styles.coverPlaceholder}>{book.title?.charAt(0)}</div>
                    )}
                    {book.genre && <span className={styles.genrePill}>{book.genre}</span>}
                  </div>
                  <div className={styles.bookInfo}>
                    <h3 className={styles.bookTitle}>{book.title}</h3>
                    <p className={styles.bookPrice}>${Number(book.price).toFixed(2)}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.section>
      </motion.main>
      <Footer />
    </>
  );
}
