import { useState, useCallback } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './Book-Detail.module.css';

export default function BookDetails({ book, onBack }) {
 
  const DEFAULT_BOOK = {
    id: 1,
    title: "Harry Potter : Half Blood Prince",
    author: "JK Rowling",
    price: 14.36,
    rating: 3.5,
    reviews: "12.4k",
    language: "English (UK & USA)",
    genre: "Fantasy",
    cover: {
      bg: "linear-gradient(135deg,#1a472a,#2d6a4f,#1b4332)",
      emoji: "🧙",
      subtitle: "Harry Potter",
      and: "AND THE",
      title: "HALF-BLOOD\nPRINCE",
      color: "#86efac",
    },
    description: "Harry Potter and the Half-Blood Prince is the sixth novel...",
  };

  const currentBook = book || DEFAULT_BOOK;

  return (
    <>
      <Header activePage="books" />
      <main className={styles.bookDetailPage}>
        {onBack && (
          <button className={styles.backBtn} onClick={onBack}>
            ← Back to Library
          </button>
        )}

        <BookItem book={currentBook} />
      </main>
      <Footer />
    </>
  );
}

function BookItem({ book }) {
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);

  const handleAddToCart = useCallback(() => {
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 2000);
  }, []);

  const coverTitleLines = book.cover.title.split('\n');

  return (
    <section className={styles.bookSection}>
      <div className={styles.coverWrapper}>
        <div className={styles.cover} style={{ background: book.cover.bg }}>
          <div className={styles.coverSubtitle} style={{ color: book.cover.color }}>
            {book.cover.subtitle}
          </div>
          <div className={styles.coverAnd}>{book.cover.and}</div>
          <div className={styles.coverTitle}>
            {coverTitleLines.map((line, i) => (
              <span key={i}>{line}{i < coverTitleLines.length - 1 && <br />}</span>
            ))}
          </div>
          <div className={styles.coverIcon}>{book.cover.emoji}</div>
          <div className={styles.coverAuthor}>{book.author.toUpperCase()}</div>
        </div>
      </div>

      <div className={styles.info}>
        <h1 className={styles.title}>{book.title}</h1>
        <p className={styles.author}>Author : <span className={styles.authorName}>{book.author}</span></p>

        <div className={styles.ratingRow}>
          <StarRating rating={book.rating} />
          <span className={styles.reviewCount}>{book.reviews} Customer Reviews</span>
        </div>

        <div className={styles.price}>$ {book.price.toFixed(2)}</div>

        <div className={styles.qtyRow}>
          <span className={styles.qtyLabel}>Quantity</span>
          <div className={styles.qtyControl}>
            <button className={styles.qtyBtn} onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
            <span className={styles.qtyValue}>{qty}</span>
            <button className={styles.qtyBtn} onClick={() => setQty(q => q + 1)}>+</button>
          </div>
        </div>

        <div className={styles.ctaRow}>
          <button className={`${styles.btnCart} ${cartAdded ? styles.btnCartAdded : ""}`} onClick={handleAddToCart}>
            {cartAdded ? "✓ ADDED!" : "ADD TO CART"}
          </button>
          <button
            className={`${styles.btnWish} ${wishlisted ? styles.btnWishActive : ""}`}
            onClick={() => setWishlisted(w => !w)}
          >
            {wishlisted ? "WISHLISTED" : "ADD TO WISH LIST"}
          </button>
        </div>

        <div className={styles.metaSection}>
          <div className={styles.description}>
            <h3 className={styles.metaTitle}>Description</h3>
            <p className={styles.metaText}>{book.description}</p>
          </div>
          <div className={styles.language}>
            <h3 className={styles.metaTitle}>Language</h3>
            <p className={styles.metaTextMuted}>{book.language}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function StarRating({ rating, total = 5 }) {
  return (
    <div className={styles.stars}>
      {Array.from({ length: total }).map((_, i) => {
        const filled = i < Math.floor(rating);
        const half = !filled && i < rating;
        return (
          <svg key={i} width="16" height="16" viewBox="0 0 24 24"
            fill={filled ? "#f59e0b" : half ? "url(#half)" : "none"}
            stroke="#f59e0b" strokeWidth="2"
          >
            <defs>
              <linearGradient id="half">
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      })}
    </div>
  );
}