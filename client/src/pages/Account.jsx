import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import useAuth from '../hooks/useAuth';
import * as userService from '../services/user.service';
import styles from './Account.module.css';

export default function Account() {
  const { user } = useAuth();
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    userService.getLibrary()
      .then((data) => setLibrary(data.books || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.banner}>
          <div className={styles.profile}>
            <div className={styles.avatar}>{user.name?.charAt(0)?.toUpperCase()}</div>
            <div>
              <h1 className={styles.name}>{user.name}</h1>
              <p className={styles.email}>{user.email}</p>
              <span className={styles.role}>{user.role}</span>
            </div>
          </div>
          <div className={styles.stats}>
            <div><strong>{library.length}</strong><span>Books</span></div>
            <div><strong>0</strong><span>Reviews</span></div>
            <div><strong>0</strong><span>Following</span></div>
            <div><strong>0</strong><span>Followers</span></div>
          </div>
        </div>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>My Library ({library.length})</h2>
          {loading ? (
            <p className={styles.muted}>Loading...</p>
          ) : library.length === 0 ? (
            <p className={styles.muted}>No books purchased yet.</p>
          ) : (
            <div className={styles.grid}>
              {library.map((book) => (
                <div key={book._id} className={styles.bookCard}>
                  <h3>{book.title}</h3>
                  <p>{book.authorName}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
