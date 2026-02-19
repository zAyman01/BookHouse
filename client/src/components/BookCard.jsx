import { FaCartShopping } from 'react-icons/fa6';
import styles from './BookCard.module.css';

export default function BookCard({ book, onAddToCart }) {
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <>
        {'★'.repeat(fullStars)}
        {hasHalfStar && '☆'}
        {'☆'.repeat(emptyStars)}
      </>
    );
  };

  return (
    <article className={styles.card}>
      <img
        src={book.image}
        alt={`Cover of ${book.title}`}
        className={styles.bookImg}
        loading="lazy"
      />
      <h2 className={styles.bookTitle}>{book.title}</h2>
      <p className={styles.bookAuthor}>{book.author}</p>
      <div className={styles.bookRating}>
        <span
          className={styles.ratingStars}
          aria-label={`Rating: ${book.rating} out of 5 stars`}
        >
          {renderStars(book.rating)}
        </span>
        <span className={styles.ratingCount}>{book.rating}</span>
      </div>
      <div className={styles.bookBottom}>
        <p
          className={styles.bookPrice}
          aria-label={`Price: ${book.price} Egyptian pounds`}
        >
          {book.price} EGP
        </p>
        <button
          onClick={() => onAddToCart(book)}
          className={styles.buyBtn}
          aria-label={`Add ${book.title} to cart`}
        >
          <FaCartShopping className={styles.cartIcon} aria-hidden="true" />
          Add to cart
        </button>
      </div>
    </article>
  );
}
