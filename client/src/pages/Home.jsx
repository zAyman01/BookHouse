import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import * as bookService from '../services/book.service';
import styles from './Home.module.css';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

const GENRES = [
  { name: 'Literary Fiction', slug: 'Fiction', count: '2,340' },
  { name: 'Science & Nature', slug: 'Science', count: '1,890' },
  { name: 'History & Biography', slug: 'History', count: '1,456' },
  { name: 'Fantasy & Sci-Fi', slug: 'Fantasy', count: '3,210' },
  { name: 'Technology', slug: 'Technology', count: '987' },
  { name: 'Philosophy', slug: 'Philosophy', count: '2,567' },
];

const TESTIMONIALS = [
  { name: 'Sarah Chen', role: 'Reader', text: 'BookHouse transformed how I discover books. The curated recommendations are thoughtful and the community is vibrant.' },
  { name: 'Marcus Johnson', role: 'Author', text: 'Publishing here connected me with readers who genuinely appreciate literary fiction. My debut reached more people than ever before.' },
  { name: 'Priya Patel', role: 'Scholar', text: 'The collection is extraordinary. I\'ve found rare editions and critical texts unavailable anywhere else online.' },
];

export default function Home() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [books, setBooks] = useState([]);

  useEffect(() => {
    bookService.getBooks({ sort: 'rating', limit: 6 }).then(d => setBooks(d.books || [])).catch(() => {});
  }, []);

  const img = (c) => c ? (c.startsWith('http') ? c : `${API}/${c.replace(/\\/g, '/')}`) : '';

  return (
    <>
      <Header />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroBg} />
          <div className={styles.heroInner}>
            <div className={styles.heroText}>
              <span className={styles.kicker}>BookHouse</span>
              <h1 className={styles.title}>Where stories<br />find their <em>readers</em></h1>
              <p className={styles.subtitle}>A carefully curated collection of the world&rsquo;s finest books. Discover, read, and share stories that matter.</p>
              <form className={styles.search} onSubmit={e => { e.preventDefault(); if (q.trim()) navigate(`/library?search=${encodeURIComponent(q)}`); }}>
                <input placeholder="Search by title, author, or genre…" value={q} onChange={e => setQ(e.target.value)} />
                <button type="submit">Search</button>
              </form>
            </div>
            <div className={styles.heroVisual}>
              <div className={styles.heroCard1}>
                <div className={styles.heroCover1}>
                  <div className={styles.coverSpine} />
                  <span className={styles.coverTitle}>The Great Gatsby</span>
                  <span className={styles.coverAuthor}>F. Scott Fitzgerald</span>
                </div>
              </div>
              <div className={styles.heroCard2}>
                <div className={styles.heroCover2}>
                  <div className={styles.coverSpine} />
                  <span className={styles.coverTitle}>To Kill a Mockingbird</span>
                  <span className={styles.coverAuthor}>Harper Lee</span>
                </div>
              </div>
              <div className={styles.heroCard3}>
                <div className={styles.heroCover3}>
                  <div className={styles.coverSpine} />
                  <span className={styles.coverTitle}>1984</span>
                  <span className={styles.coverAuthor}>George Orwell</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.statsSection}>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}><strong>25K+</strong><span>Books</span></div>
            <div className={styles.statItem}><strong>5K+</strong><span>Authors</span></div>
            <div className={styles.statItem}><strong>4.8</strong><span>Avg Rating</span></div>
            <div className={styles.statItem}><strong>100K+</strong><span>Readers</span></div>
          </div>
        </section>

        <section className={styles.picks}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.kicker}>Curated</span>
              <h2 className={styles.sectionTitle}>Editorial Picks</h2>
            </div>
            <Link to="/library" className={styles.viewAll}>View all <span>&rarr;</span></Link>
          </div>
          <div className={styles.grid}>
            {books.map(b => (
              <div key={b._id} className={styles.card} onClick={() => navigate(`/book-detail/${b._id}`)}>
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
              </div>
            ))}
          </div>
        </section>

        <section className={styles.testimonials}>
          <div className="styles.testimonialsInner">
            <span className={styles.kicker}>Voices</span>
            <h2 className={styles.sectionTitle}>What Readers Say</h2>
            <div className={styles.tGrid}>
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className={styles.tCard}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" opacity="0.15"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151C7.563 6.068 6 8.789 6 11h4v10H0z" /></svg>
                  <p className={styles.tText}>{t.text}</p>
                  <div className={styles.tAuthor}>
                    <div className={styles.tAvatar}>{t.name.charAt(0)}</div>
                    <div>
                      <div className={styles.tName}>{t.name}</div>
                      <div className={styles.tRole}>{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.genres}>
          <div className={styles.genresInner}>
            <span className={styles.kicker}>Genres</span>
            <h2 className={styles.sectionTitle}>Browse by Category</h2>
            <div className={styles.gGrid}>
              {GENRES.map((g, i) => {
                const colors = ['#1B3A6B', '#2E5FA3', '#3A7D5A', '#0F2240', '#4A8FD4', '#7C5C8A'];
                return (
                  <div key={g.name} className={styles.gCard} style={{ backgroundColor: colors[i] }} onClick={() => navigate(`/library?genre=${encodeURIComponent(g.slug)}`)}>
                    <h3>{g.name}</h3>
                    <span>{g.count} titles</span>
                    <span className={styles.gArrow}>&rarr;</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className={styles.cta}>
          <div className={styles.ctaInner}>
            <h2>Become Part of Our Story</h2>
            <p>Join a community of readers and authors who share a passion for the written word.</p>
            <div className={styles.ctaButtons}>
              <Link to="/signup" className={styles.ctaPrimary}>Create Account</Link>
              <Link to="/library" className={styles.ctaSecondary}>Browse Library <span>&rarr;</span></Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
