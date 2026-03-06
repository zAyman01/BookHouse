import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './Library.module.css';
import { FaRegHeart, FaHeart } from 'react-icons/fa6';
import { FaSearch } from 'react-icons/fa';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useState, useMemo, useCallback } from 'react';

import heroBg from '../assets/library-hero-section.png';
import book1 from '../assets/books/book1.jpg';
import book2 from '../assets/books/book2.jpg';
import book3 from '../assets/books/book3.jpg';
import book4 from '../assets/books/book4.jpg';
import book5 from '../assets/books/book5.jpg';
import book6 from '../assets/books/book6.jpg';
import book7 from '../assets/books/book7.jpg';
import book8 from '../assets/books/book8.jpg';
import book9 from '../assets/books/book9.jpg';
import book10 from '../assets/books/book10.jpg';
import book11 from '../assets/books/book11.jpg';
import book12 from '../assets/books/book12.jpg';

const ALL_BOOKS = [
  {
    id: 1,
    title: 'فن اللامبالاة',
    author: 'By Mark Mansoune',
    genre: 'Architecture & Design',
    image: book1,
    price: 44.0,
    format: 'hardcover',
    rating: 4.5,
  },
  {
    id: 2,
    title: 'عقدك النفسية سجنك الأبدي',
    author: 'By Dr. Youssef Al Hosny',
    genre: 'Science & Quantum',
    image: book2,
    price: 27.5,
    format: 'hardcover',
    rating: 4,
  },
  {
    id: 3,
    title: 'أرض زيكولا',
    author: 'By Amr Abdelhameed',
    genre: 'Contemporary Fiction',
    image: book3,
    price: 58.0,
    format: 'hardcover',
    rating: 5,
  },
  {
    id: 4,
    title: 'فتى الأندلس',
    author: 'By Mahmoud Maher',
    genre: 'Academic Journals',
    image: book4,
    price: 9.99,
    format: 'paperback',
    rating: 3.5,
  },
  {
    id: 5,
    title: 'سيكولوجية المال',
    author: 'By Jison Zweeg',
    genre: 'Contemporary Fiction',
    image: book5,
    price: 44.0,
    format: 'hardcover',
    rating: 4,
  },
  {
    id: 6,
    title: 'The Tilting House',
    author: 'By Tom Llewellyn',
    genre: 'Contemporary Fiction',
    image: book6,
    price: 27.5,
    format: 'paperback',
    rating: 4.5,
  },
  {
    id: 7,
    title: 'Surrounded by idiots',
    author: 'By Thomas Erikson',
    genre: 'Architecture & Design',
    image: book7,
    price: 55.06,
    format: 'hardcover',
    rating: 5,
  },
  {
    id: 8,
    title: 'نظرية التغافل',
    author: 'By Mail Ropies & Swear Ropies',
    genre: 'Contemporary Fiction',
    image: book8,
    price: 42.6,
    format: 'e-book',
    rating: 4,
  },
  {
    id: 9,
    title: 'العالم كما تراه الفيزياء',
    author: 'By Jym Alkhalily',
    genre: 'Contemporary Fiction',
    image: book9,
    price: 27.5,
    format: 'paperback',
    rating: 3.5,
  },
  {
    id: 10,
    title: 'The Tilting House',
    author: 'By Tom Llewellyn',
    genre: 'Academic Journals',
    image: book10,
    price: 36.0,
    format: 'audiobook',
    rating: 4,
  },
  {
    id: 11,
    title: 'الرياضيات للفضوليين',
    author: 'By Peter Em Hegenz',
    genre: 'Science & Quantum',
    image: book11,
    price: 19.99,
    format: 'e-book',
    rating: 4.5,
  },
  {
    id: 12,
    title: 'قضية مخالب القط',
    author: 'By Mirna Elmahdy',
    genre: 'Contemporary Fiction',
    image: book12,
    price: 31.0,
    format: 'paperback',
    rating: 4,
  },
];

const GENRES = [
  'Architecture & Design',
  'Science & Quantum',
  'Contemporary Fiction',
  'Academic Journals',
];
const FORMATS = ['hardcover', 'e-book', 'paperback', 'audiobook'];
const BOOKS_PER_PAGE = 6;
const MAX_PRICE = 250;

export default function Library() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [formatSelected, setFormatSelected] = useState('');
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [sortBy, setSortBy] = useState('popular');
  const [favorites, setFavorites] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  const toggleGenre = useCallback((genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
    setCurrentPage(1);
  }, []);

  const toggleFavorite = useCallback((id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    setSelectedGenres([]);
    setFormatSelected('');
    setMaxPrice(MAX_PRICE);
    setSearchQuery('');
    setSearchTerm('');
    setCurrentPage(1);
  }, []);

  const handleSearchSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setSearchTerm(searchQuery.trim());
      setCurrentPage(1);
    },
    [searchQuery]
  );

  const handleFormatToggle = useCallback((fmt) => {
    setFormatSelected((prev) => (prev === fmt ? '' : fmt));
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  }, []);

  const filteredBooks = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    let result = ALL_BOOKS.filter((book) => {
      if (
        searchTerm &&
        !book.title.toLowerCase().includes(lowerSearch) &&
        !book.author.toLowerCase().includes(lowerSearch)
      )
        return false;
      if (selectedGenres.length > 0 && !selectedGenres.includes(book.genre))
        return false;
      if (formatSelected && book.format !== formatSelected) return false;
      if (book.price > maxPrice) return false;
      return true;
    });

    if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
    else if (sortBy === 'title')
      result.sort((a, b) => a.title.localeCompare(b.title));
    else if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);

    return result;
  }, [searchTerm, selectedGenres, formatSelected, maxPrice, sortBy]);

  const totalPages = Math.ceil(filteredBooks.length / BOOKS_PER_PAGE);
  const pagedBooks = filteredBooks.slice(
    (currentPage - 1) * BOOKS_PER_PAGE,
    currentPage * BOOKS_PER_PAGE
  );

  const sliderPercent = Math.round((maxPrice / MAX_PRICE) * 100);

  return (
    <>
      <Header />
      <main className={styles.libraryMain}>
        {/* ── Hero Section with Search ── */}
        <section className={styles.heroSection}>
          <div className={styles.heroSectionBackground} aria-hidden="true">
            <img src={heroBg} alt="" />
            <div className={styles.heroOverlay} />
          </div>
          <h1>Explore Our Library</h1>
          <form
            className={styles.searchBar}
            role="search"
            onSubmit={handleSearchSubmit}
          >
            <div className={styles.searchInput}>
              <FaSearch className={styles.searchIcon} aria-hidden="true" />
              <input
                type="text"
                placeholder="Search by title, author, or ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search books"
              />
            </div>
            <button type="submit" className={styles.searchButton}>
              Search
            </button>
          </form>
        </section>

        <div className={styles.libraryContainer}>
          {/* ── Sidebar ── */}
          <aside className={styles.sidebar} aria-label="Book filters">
            <div className={styles.filterSection}>
              <div className={styles.filterHeader}>
                <h3>Filters</h3>
                <button
                  className={styles.resetButton}
                  onClick={handleReset}
                  type="button"
                >
                  Reset
                </button>
              </div>

              <div className={styles.filterGroup}>
                <h4>Genre</h4>
                {GENRES.map((genre) => (
                  <label key={genre} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={selectedGenres.includes(genre)}
                      onChange={() => toggleGenre(genre)}
                    />
                    <span>{genre}</span>
                  </label>
                ))}
              </div>

              <div className={styles.filterGroup}>
                <h4>Price Range</h4>
                <input
                  type="range"
                  className={styles.rangeSlider}
                  min="0"
                  max={MAX_PRICE}
                  value={maxPrice}
                  aria-label={`Maximum price $${maxPrice}`}
                  style={{ '--slider-percent': `${sliderPercent}%` }}
                  onChange={(e) => {
                    setMaxPrice(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                />
                <div className={styles.priceRangeRow}>
                  <span>$0</span>
                  <span>${maxPrice}</span>
                </div>
              </div>

              <div className={styles.filterGroup}>
                <h4>Format</h4>
                <div className={styles.filterButtons}>
                  {FORMATS.map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      className={`${styles.filterButton} ${formatSelected === fmt ? styles.selected : ''}`}
                      onClick={() => handleFormatToggle(fmt)}
                      aria-pressed={formatSelected === fmt}
                    >
                      {fmt.charAt(0).toUpperCase() + fmt.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.membershipSection}>
              <p className={styles.membershipHeader}>Membership</p>
              <h2 className={styles.membershipTitle}>
                Join the BookHouse Club
              </h2>
              <p className={styles.membershipDescription}>
                Unlock exclusive student discounts and early access to first
                editions.
              </p>
              <button type="button" className={styles.membershipButton}>Learn More</button>
            </div>
          </aside>

          {/* ── Book Grid ── */}
          <div className={styles.bookGrid}>
            <div className={styles.filtersInfo}>
              <p>
                Showing {pagedBooks.length} of {filteredBooks.length} books
              </p>
              <div className={styles.sortRow}>
                <label htmlFor="sortedBy">Sort by:</label>
                <select
                  id="sortedBy"
                  value={sortBy}
                  onChange={handleSortChange}
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Top Rated</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="title">Title</option>
                </select>
              </div>
            </div>

            <div className={styles.booksContainer}>
              {pagedBooks.length > 0 ? (
                pagedBooks.map((book) => (
                  <article key={book.id} className={styles.bookCard}>
                    <div className={styles.bookImgWrapper}>
                      <img
                        src={book.image}
                        alt={book.title}
                        className={styles.bookImg}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className={styles.bookInfo}>
                      <div className={styles.bookFormatRow}>
                        <span className={styles.bookFormat}>{book.format}</span>
                        <button
                          type="button"
                          className={`${styles.addToFavoritesButton} ${favorites.has(book.id) ? styles.favorited : ''}`}
                          onClick={() => toggleFavorite(book.id)}
                          aria-label={favorites.has(book.id) ? `Remove "${book.title}" from favorites` : `Add "${book.title}" to favorites`}
                          aria-pressed={favorites.has(book.id)}
                        >
                          {favorites.has(book.id) ? <FaHeart aria-hidden="true" /> : <FaRegHeart aria-hidden="true" />}
                        </button>
                      </div>
                      <h3 className={styles.bookTitle}>{book.title}</h3>
                      <p className={styles.bookAuthor}>{book.author}</p>
                      <div className={styles.bookBottomRow}>
                        <span className={styles.bookPrice}>
                          ${book.price.toFixed(2)}
                        </span>
                        <button
                          type="button"
                          className={styles.addToCart}
                          aria-label={`Add "${book.title}" to cart`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <p>No books match your filters.</p>
                  <button type="button" className={styles.resetButton} onClick={handleReset}>
                    Clear filters
                  </button>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  type="button"
                  className={styles.pageArrow}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <FiChevronLeft aria-hidden="true" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      type="button"
                      className={`${styles.pageButton} ${currentPage === page ? styles.activePage : ''}`}
                      onClick={() => setCurrentPage(page)}
                      aria-label={`Page ${page}`}
                      aria-current={currentPage === page ? 'page' : undefined}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  type="button"
                  className={styles.pageArrow}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  <FiChevronRight aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
