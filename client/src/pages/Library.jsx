import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import * as bookService from '../services/book.service';
import heroImg from '../assets/library-hero-section.png';
import styles from './Library.module.css';

const BOOKS_PER_PAGE = 12;
const GENRES = [
  'Fiction',
  'Science',
  'History',
  'Philosophy',
  'Technology',
  'Fantasy',
  'Mystery',
  'Biography',
];
const FORMATS = ['hardcover', 'paperback', 'e-book', 'audiobook'];

const API = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
).replace('/api', '');

export default function Library() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  );
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [formatSelected, setFormatSelected] = useState('');
  const [maxPrice, setMaxPrice] = useState(250);
  const [sortBy, setSortBy] = useState('rating');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    const params = {
      page: currentPage,
      limit: BOOKS_PER_PAGE,
      sort: sortBy,
    };
    if (searchQuery) params.search = searchQuery;
    if (selectedGenres.length === 1) params.genre = selectedGenres[0];
    if (formatSelected) params.format = formatSelected;
    if (maxPrice < 250) params.maxPrice = maxPrice;

    bookService
      .getBooks(params)
      .then((data) => {
        setBooks(data.books || []);
        setTotal(data.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [
    currentPage,
    sortBy,
    searchQuery,
    selectedGenres,
    formatSelected,
    maxPrice,
  ]);

  const toggleGenre = useCallback((genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
    setCurrentPage(1);
  }, []);

  const handleReset = useCallback(() => {
    setSelectedGenres([]);
    setFormatSelected('');
    setMaxPrice(250);
    setSearchQuery('');
    setCurrentPage(1);
    setSearchParams({});
  }, [setSearchParams]);

  const handleSearchSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setCurrentPage(1);
      if (searchQuery) setSearchParams({ search: searchQuery });
      else setSearchParams({});
    },
    [searchQuery, setSearchParams]
  );

  const totalPages = Math.ceil(total / BOOKS_PER_PAGE);

  const img = (c) =>
    c ? (c.startsWith('http') ? c : `${API}/${c.replace(/\\/g, '/')}`) : '';

  return (
    <>
      <Header />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroBg}>
            <img src={heroImg} alt="Library background" loading="lazy" />
            <div className={styles.heroOverlay} />
          </div>
          <h1 className={styles.heroTitle}>Explore Our Library</h1>
          <form
            className={styles.heroSearch}
            role="search"
            onSubmit={handleSearchSubmit}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by title or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search books"
            />
            <button type="submit">Search</button>
          </form>
        </section>

        <div className={`${styles.container} ${!sidebarOpen ? styles.containerFull : ''}`}>
          {sidebarOpen && <aside className={styles.sidebar}>
            <div className={styles.filterCard}>
              <div className={styles.filterHead}>
                <h3>Filters</h3>
                <button
                  className={styles.resetBtn}
                  onClick={handleReset}
                  type="button"
                >
                  Reset
                </button>
              </div>
              <div className={styles.filterGroup}>
                <h4>Genre</h4>
                {GENRES.map((genre) => (
                  <label key={genre} className={styles.checkLabel}>
                    <input
                      type="checkbox"
                      checked={selectedGenres.includes(genre)}
                      onChange={() => toggleGenre(genre)}
                    />
                    <span>{genre}</span>
                  </label>
                ))}
              </div>
              <div className={styles.filterGroup}>
                <h4>Format</h4>
                <div className={styles.formatGrid}>
                  {FORMATS.map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      className={`${styles.formatBtn} ${formatSelected === fmt ? styles.formatActive : ''}`}
                      onClick={() =>
                        setFormatSelected((prev) => (prev === fmt ? '' : fmt))
                      }
                    >
                      {fmt.charAt(0).toUpperCase() + fmt.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.membershipCard}>
              <p className={styles.memberLabel}>Membership</p>
              <h2 className={styles.memberTitle}>Join BookHouse Club</h2>
              <p className={styles.memberDesc}>
                Unlock exclusive discounts and early access to first editions.
              </p>
              <button type="button" className={styles.memberBtn}>
                Learn More
              </button>
            </div>
          </aside>}

          <div className={styles.content}>
            <div className={styles.toolbar}>
              <button className={styles.sidebarToggle} onClick={() => setSidebarOpen(v => !v)} aria-label={sidebarOpen ? 'Close filters' : 'Open filters'}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {sidebarOpen ? <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></> : <><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" /><circle cx="8" cy="12" r="3" fill="var(--color-primary)" stroke="none" /></>}
                </svg>
                {sidebarOpen ? 'Hide Filters' : 'Show Filters'}
              </button>
              <p className={styles.resultCount}>
                {loading
                  ? 'Loading...'
                  : `Showing ${books.length} of ${total} books`}
              </p>
              <div className={styles.sortGroup}>
                <label htmlFor="sort">Sort:</label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="rating">Top Rated</option>
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            <div className={styles.grid}>
              {loading ? (
                <div className={styles.empty}>
                  <p>Loading books...</p>
                </div>
              ) : books.length > 0 ? (
                books.map((book) => {
                  const stars = Math.floor(book.ratingsAverage || 0);
                  return (
                    <article key={book._id} className={styles.bookCard}>
                      <a
                        href={`/book-detail/${book._id}`}
                        className={styles.bookCover}
                      >
                        {book.coverImage ? (
                          <img
                            src={img(book.coverImage)}
                            alt={book.title}
                            loading="lazy"
                          />
                        ) : (
                          <div className={styles.coverPlaceholder}>
                            {book.title?.charAt(0)}
                          </div>
                        )}
                        <div className={styles.coverBadge}>
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            stroke="none"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                          {book.ratingsAverage?.toFixed(1)}
                        </div>
                        {book.genre && (
                          <span className={styles.genrePill}>{book.genre}</span>
                        )}
                      </a>
                      <div className={styles.bookBody}>
                        <div className={styles.starsRow}>
                          {[1, 2, 3, 4, 5].map((i) => (
                            <span
                              key={i}
                              className={
                                i <= stars ? styles.starF : styles.starE
                              }
                            >
                              <svg
                                width="11"
                                height="11"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                stroke="none"
                              >
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                            </span>
                          ))}
                          <span className={styles.starsCount}>
                            ({book.ratingsCount || 0})
                          </span>
                        </div>
                        <h3 className={styles.bookTitle}>{book.title}</h3>
                        <p className={styles.bookAuthor}>{book.authorName}</p>
                        <span className={styles.bookFormat}>
                          {book.format || 'e-book'}
                        </span>
                        <div className={styles.bookFooter}>
                          <span className={styles.bookPrice}>
                            ${Number(book.price).toFixed(2)}
                          </span>
                          <button
                            type="button"
                            className={styles.addCartBtn}
                            aria-label="Add to cart"
                          >
                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <circle cx="9" cy="21" r="1" />
                              <circle cx="20" cy="21" r="1" />
                              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className={styles.empty}>
                  <p>No books found.</p>
                  <button
                    type="button"
                    className={styles.clearBtn}
                    onClick={handleReset}
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  type="button"
                  className={styles.pageArrow}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  &larr;
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      type="button"
                      className={`${styles.pageBtn} ${currentPage === page ? styles.pageActive : ''}`}
                      onClick={() => setCurrentPage(page)}
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
                >
                  &rarr;
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
