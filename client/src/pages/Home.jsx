import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import * as bookService from '../services/book.service';
import { fadeUp, fadeIn, slideLeft, slideRight, staggerContainer, staggerItem, pageTransition } from '../utils/animations';
import styles from './Home.module.css';

const API = (import.meta.env.VITE_API_URL || '/api').replace('/api', '');

const GENRE_SLUGS = {
  Fiction: 'Fiction', Science: 'Science', History: 'History',
  Philosophy: 'Philosophy', Technology: 'Technology', Fantasy: 'Fantasy',
  Mystery: 'Mystery', Biography: 'Biography', Romance: 'Romance',
  'Non-Fiction': 'Non-Fiction', Horror: 'Horror', 'Sci-Fi': 'Sci-Fi',
};

const GENRE_COLORS = ['#1B3A6B', '#2E5FA3', '#3A7D5A', '#0F2240', '#4A8FD4', '#7C5C8A', '#B33A3A', '#C9A84C', '#2D6A4F', '#6B4C8A'];

const TESTIMONIALS = [
  { name: 'Sarah Chen', role: 'Reader', text: 'BookHouse transformed how I discover books. The curated recommendations are thoughtful and the community is vibrant.' },
  { name: 'Marcus Johnson', role: 'Author', text: 'Publishing here connected me with readers who genuinely appreciate literary fiction. My debut reached more people than ever before.' },
  { name: 'Priya Patel', role: 'Scholar', text: 'The collection is extraordinary. I\'ve found rare editions and critical texts unavailable anywhere else online.' },
];

export default function Home() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [books, setBooks] = useState([]);
  const [topBooks, setTopBooks] = useState([]);
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    bookService.getBooks({ sort: 'rating', limit: 6 }).then(d => setBooks(d.books || [])).catch(() => {});
    bookService.getBooks({ sort: 'rating', limit: 3 }).then(d => setTopBooks(d.books || [])).catch(() => {});
    bookService.getGenres().then(d => setGenres(d.genres || [])).catch(() => {});
  }, []);

  const img = (c) => c ? (c.startsWith('http') ? c : `${API}/${c.replace(/\\/g, '/')}`) : '';

  const heroBooks = topBooks.length >= 3 ? topBooks : [];

  const displayGenres = genres.length > 0 ? genres.slice(0, 6) : [];

  return (
    <>
      <Header />
      <motion.main className={styles.main} variants={pageTransition} initial="initial" animate="animate" exit="exit">
        <motion.section className={styles.hero} variants={fadeIn}>
          <div className={styles.heroBg} />
          <div className={styles.heroInner}>
            <motion.div className={styles.heroText} variants={slideLeft}>
              <span className={styles.kicker}>BookHouse</span>
              <h1 className={styles.title}>Where stories<br />find their <em>readers</em></h1>
              <p className={styles.subtitle}>A carefully curated collection of the world&rsquo;s finest books. Discover, read, and share stories that matter.</p>
              <form className={styles.search} onSubmit={e => { e.preventDefault(); if (q.trim()) navigate(`/library?search=${encodeURIComponent(q)}`); }}>
                <input placeholder="Search by title, author, or genre…" value={q} onChange={e => setQ(e.target.value)} />
                <button type="submit">Search</button>
              </form>
            </motion.div>
            <motion.div className={styles.heroVisual} variants={slideRight}>
              {heroBooks[0] && (
                <motion.div className={styles.heroCard1} animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
                  <div className={styles.heroCover1}>
                    {heroBooks[0].coverImage ? (
                      <img src={img(heroBooks[0].coverImage)} alt={heroBooks[0].title} className={styles.heroCoverImg} />
                    ) : null}
                    <div className={styles.heroCoverMeta}>
                      <span className={styles.coverTitle}>{heroBooks[0].title}</span>
                      <span className={styles.coverAuthor}>{heroBooks[0].authorName}</span>
                    </div>
                  </div>
                </motion.div>
              )}
              {heroBooks[1] && (
                <motion.div className={styles.heroCard2} animate={{ y: [0, 8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
                  <div className={styles.heroCover2}>
                    {heroBooks[1].coverImage ? (
                      <img src={img(heroBooks[1].coverImage)} alt={heroBooks[1].title} className={styles.heroCoverImg} />
                    ) : null}
                    <div className={styles.heroCoverMeta}>
                      <span className={styles.coverTitle}>{heroBooks[1].title}</span>
                      <span className={styles.coverAuthor}>{heroBooks[1].authorName}</span>
                    </div>
                  </div>
                </motion.div>
              )}
              {heroBooks[2] && (
                <motion.div className={styles.heroCard3} animate={{ y: [0, -6, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}>
                  <div className={styles.heroCover3}>
                    {heroBooks[2].coverImage ? (
                      <img src={img(heroBooks[2].coverImage)} alt={heroBooks[2].title} className={styles.heroCoverImg} />
                    ) : null}
                    <div className={styles.heroCoverMeta}>
                      <span className={styles.coverTitle}>{heroBooks[2].title}</span>
                      <span className={styles.coverAuthor}>{heroBooks[2].authorName}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.section>

        <motion.section className={styles.statsSection} variants={fadeUp} viewport={{ once: true }}>
          <motion.div className={styles.statsGrid} variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true, amount: 0.3 }}>
            <motion.div className={styles.statItem} variants={staggerItem}><strong>25K+</strong><span>Books</span></motion.div>
            <motion.div className={styles.statItem} variants={staggerItem}><strong>5K+</strong><span>Authors</span></motion.div>
            <motion.div className={styles.statItem} variants={staggerItem}><strong>4.8</strong><span>Avg Rating</span></motion.div>
            <motion.div className={styles.statItem} variants={staggerItem}><strong>100K+</strong><span>Readers</span></motion.div>
          </motion.div>
        </motion.section>

        <motion.section className={styles.picks} variants={fadeUp} viewport={{ once: true }}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.kicker}>Curated</span>
              <h2 className={styles.sectionTitle}>Editorial Picks</h2>
            </div>
            <Link to="/library" className={styles.viewAll}>View all <span>&rarr;</span></Link>
          </div>
          <motion.div className={styles.grid} variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true, amount: 0.2 }}>
            {books.map(b => (
              <motion.div key={b._id} className={styles.card} variants={staggerItem} whileHover={{ y: -6 }} onClick={() => navigate(`/book-detail/${b._id}`)}>
                <div className={styles.cardCover}>
                  {b.coverImage ? <img src={img(b.coverImage)} alt={b.title} loading="lazy" /> : <div className={styles.cardPlaceholder}>{b.title?.charAt(0)}</div>}
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardStars}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <span key={i} className={i <= Math.round(b.ratingsAverage || 0) ? styles.starF : styles.starE}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                      </span>
                    ))}
                    <span className={styles.cardRating}>{b.ratingsAverage?.toFixed(1)}</span>
                  </div>
                  <h3 className={styles.cardTitle}>{b.title}</h3>
                  <p className={styles.cardAuthor}>{b.authorName}</p>
                  <div className={styles.cardFooter}>
                    <span className={styles.cardPrice}>${Number(b.price).toFixed(2)}</span>
                    {b.genre && <span className={styles.cardTag}>{b.genre}</span>}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        <motion.section className={styles.testimonials} variants={fadeUp} viewport={{ once: true }}>
          <div className={styles.testimonialsInner}>
            <span className={styles.kicker}>Voices</span>
            <h2 className={styles.sectionTitle}>What Readers Say</h2>
            <motion.div className={styles.tGrid} variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true, amount: 0.3 }}>
              {TESTIMONIALS.map((t, i) => (
                <motion.div key={i} className={styles.tCard} variants={staggerItem} whileHover={{ y: -4 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" opacity="0.15"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151C7.563 6.068 6 8.789 6 11h4v10H0z" /></svg>
                  <p className={styles.tText}>{t.text}</p>
                  <div className={styles.tAuthor}>
                    <div className={styles.tAvatar}>{t.name.charAt(0)}</div>
                    <div>
                      <div className={styles.tName}>{t.name}</div>
                      <div className={styles.tRole}>{t.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        <motion.section className={styles.genres} variants={fadeUp} viewport={{ once: true }}>
          <div className={styles.genresInner}>
            <span className={styles.kicker}>Genres</span>
            <h2 className={styles.sectionTitle}>Browse by Category</h2>
            <motion.div className={styles.gGrid} variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true, amount: 0.3 }}>
              {displayGenres.map((g, i) => (
                <motion.div key={g.name} className={styles.gCard} style={{ backgroundColor: GENRE_COLORS[i % GENRE_COLORS.length] }} variants={staggerItem} whileHover={{ scale: 1.03 }} onClick={() => navigate(`/library?genre=${encodeURIComponent(GENRE_SLUGS[g.name] || g.name)}`)}>
                  <h3>{g.name}</h3>
                  <span>{g.count.toLocaleString()} titles</span>
                  <span className={styles.gArrow}>&rarr;</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        <motion.section className={styles.cta} variants={fadeUp} viewport={{ once: true }}>
          <div className={styles.ctaInner}>
            <h2>Become Part of Our Story</h2>
            <p>Join a community of readers and authors who share a passion for the written word.</p>
            <div className={styles.ctaButtons}>
              <Link to="/signup" className={styles.ctaPrimary}>Create Account</Link>
              <Link to="/library" className={styles.ctaSecondary}>Browse Library <span>&rarr;</span></Link>
            </div>
          </div>
        </motion.section>
      </motion.main>
      <Footer />
    </>
  );
}
