import { Link } from 'react-router-dom';
import styles from './BookCard.module.css';

function StarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

export default function BookCard({ book, onAddToCart }) {
  const rating = Number(book.rating || book.ratingsAverage) || 0;
  const full = Math.floor(rating);
  const img = book.image || book.coverImage;
  const title = book.title || '';
  const author = book.author || book.authorName || '';

  return (
    <article className={styles.card}>
      <Link to={book._id ? `/book-detail/${book._id}` : '#'} className={styles.cover}>
        {img ? (
          <img src={img} alt={title} loading="lazy" />
        ) : (
          <div className={styles.placeholder}>{title.charAt(0)}</div>
        )}
        {book.genre && <span className={styles.genre}>{book.genre}</span>}
      </Link>
      <div className={styles.body}>
        <div className={styles.stars}>
          {[1, 2, 3, 4, 5].map(i => (
            <span key={i} className={i <= full ? styles.starFilled : styles.starEmpty}><StarIcon /></span>
          ))}
          <span className={styles.rating}>{rating.toFixed(1)}</span>
        </div>
        <Link to={book._id ? `/book-detail/${book._id}` : '#'} className={styles.title}>{title}</Link>
        <p className={styles.author}>{author}</p>
        {book.price && (
          <div className={styles.footer}>
            <span className={styles.price}>${Number(book.price).toFixed(2)}</span>
            {onAddToCart && (
              <button className={styles.cartBtn} onClick={() => onAddToCart(book)} aria-label="Add to cart">
                <CartIcon />
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
