import { useState, useCallback } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BookCard from '../components/BookCard';
import heroImg from '../assets/favorites-page-hero-img.png';
import book1 from '../assets/favorite-book1.jpg';
import book2 from '../assets/favorite-book2.jpg';
import book3 from '../assets/favorite-book3.jpg';
import book4 from '../assets/favorite-book4.jpg';
import book5 from '../assets/favorite-book5.jpg';

import styles from './Favorites.module.css';

// Book data array for better maintainability
const FAVORITE_BOOKS = [
  {
    id: 1,
    title: 'فتي الاندلس',
    author: 'محمود ماهر',
    rating: 4.5,
    price: 150,
    image: book1,
  },
  {
    id: 2,
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    rating: 4.7,
    price: 250,
    image: book2,
  },
  {
    id: 3,
    title: 'أرض زيكولا',
    author: 'عمرو عبد الحميد',
    rating: 4.4,
    price: 180,
    image: book3,
  },
  {
    id: 4,
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    rating: 4.8,
    price: 200,
    image: book4,
  },
  {
    id: 5,
    title: 'The midnight library',
    author: 'Matt Haig',
    rating: 4.6,
    price: 220,
    image: book5,
  },
];

export default function Favorites() {
  const [notification, setNotification] = useState('');
  const currentYear = new Date().getFullYear();

  const handleAddToCart = useCallback((book) => {
    // Add to cart logic would go here
    // For now, just show a notification
    setNotification(`"${book.title}" added to cart!`);

    setTimeout(() => {
      setNotification('');
    }, 3000);
  }, []);

  const handleViewMore = (e) => {
    e.preventDefault();
    // Navigate to all books page or show more books
    // This would typically use React Router navigation
    console.log('View more books');
  };

  return (
    <>
      <Header activePage="favorites" />
      <main className={styles.favoritesPage}>
        {notification && (
          <div className={styles.notification} role="status" aria-live="polite">
            {notification}
          </div>
        )}

        <section className={styles.heroSection} aria-labelledby="hero-title">
          <img
            src={heroImg}
            alt="Collection of bestselling books"
            className={styles.heroImg}
          />
          <div className={styles.heroContent}>
            <h1 id="hero-title" className={styles.heroTitle}>
              Deals on Great Reads for {currentYear}
            </h1>
            <p className={styles.heroText}>
              Discover your next favorite book with our handpicked selection of
              bestsellers.
            </p>
            <button
              onClick={handleViewMore}
              className={styles.heroBtn}
              aria-label="View more books"
            >
              View More
            </button>
          </div>
        </section>

        <section
          className={styles.favoritesList}
          aria-label="Favorite books collection"
        >
          {FAVORITE_BOOKS.map((book) => (
            <BookCard key={book.id} book={book} onAddToCart={handleAddToCart} />
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}
