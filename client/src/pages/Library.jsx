import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './Library.module.css';
import { FaSearch } from 'react-icons/fa';
import { useState } from 'react';

export default function Library() {
  const [searchTerm, setSearchTerm] = useState('');
  return (
    <>
      <Header />
      <main className={styles.libraryMain}>
        <section className={styles.heroSection}>
          <h1>Explore Our Library</h1>
          <div className={styles.searchBar}>
            <div className={styles.searchInput}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="search"
                placeholder="Search by title, author, or ISPN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className={styles.filterButton}>Filter</button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
