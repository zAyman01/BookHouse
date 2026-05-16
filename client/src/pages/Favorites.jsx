import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import useAuth from '../hooks/useAuth';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import * as userService from '../services/user.service';
import { staggerContainer, staggerItem, pageTransition } from '../utils/animations';
import heroImg from '../assets/favorites-page-hero-img.png';
import styles from './Favorites.module.css';

const API = (import.meta.env.VITE_API_URL || '/api').replace('/api', '');

export default function Favorites() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { success } = useNotification();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    userService.getFavorites()
      .then((data) => setFavorites(data.books || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const img = (c) => c ? (c.startsWith('http') ? c : `${API}/${c.replace(/\\/g, '/')}`) : '';

  return (
    <>
      <Header />
      <motion.main className={styles.main} variants={pageTransition} initial="initial" animate="animate" exit="exit">
        <section className={styles.hero}>
          <img src={heroImg} alt="" className={styles.heroImg} />
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Your <em>Curated</em> Collection</h1>
            <p className={styles.heroText}>Books you&rsquo;ve saved as favorites.</p>
            <button type="button" className={styles.heroBtn} onClick={() => navigate('/library')}>Browse Library</button>
          </div>
        </section>
        {loading ? (
          <p className={styles.loadingText}>Loading favorites...</p>
        ) : favorites.length === 0 ? (
          <div className={styles.empty}>
            <p>No favorites yet.</p>
            <button className={styles.browseBtn} onClick={() => navigate('/library')}>Discover Books</button>
          </div>
        ) : (
          <motion.div className={styles.grid} variants={staggerContainer} initial="initial" animate="animate">
            {favorites.map((book) => (
              <motion.div key={book._id} className={styles.card} variants={staggerItem}>
                <div className={styles.cardCover} onClick={() => navigate(`/book-detail/${book._id}`)}>
                  {book.coverImage ? (
                    <img src={img(book.coverImage)} alt={book.title} loading="lazy" />
                  ) : (
                    <div className={styles.cardPlaceholder}>{book.title?.charAt(0)}</div>
                  )}
                  {book.ratingsAverage > 0 && (
                    <span className={styles.ratingBadge}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                      {book.ratingsAverage.toFixed(1)}
                    </span>
                  )}
                  {book.genre && <span className={styles.genrePill}>{book.genre}</span>}
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{book.title}</h3>
                  <p className={styles.cardAuthor}>{book.authorName}</p>
                  <div className={styles.cardFooter}>
                    <span className={styles.cardPrice}>${Number(book.price).toFixed(2)}</span>
                    <button
                      type="button"
                      className={styles.addBtn}
                      onClick={() => { addItem(book); success(`"${book.title}" added to cart`); }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                      </svg>
                      Add to Cart
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.main>
      <Footer />
    </>
  );
}
