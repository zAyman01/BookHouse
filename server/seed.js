import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import Book from './models/book.model.js';
import User from './models/user.model.js';
import Review from './models/review.model.js';
import Order from './models/order.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const ADMIN = {
  name: 'BookHouse Admin',
  email: 'admin@bookhouse.com',
  password: 'admin1234',
  role: 'admin',
};

const SEED_READERS = [
  { name: 'Alice Johnson', email: 'alice@bookhouse.com', password: 'reader1234', role: 'user' },
  { name: 'Bob Smith', email: 'bob@bookhouse.com', password: 'reader1234', role: 'user' },
  { name: 'Carol Davis', email: 'carol@bookhouse.com', password: 'reader1234', role: 'user' },
  { name: 'Dan Wilson', email: 'dan@bookhouse.com', password: 'reader1234', role: 'user' },
  { name: 'Eva Brown', email: 'eva@bookhouse.com', password: 'reader1234', role: 'user' },
];

const FORMATS = ['hardcover', 'paperback', 'e-book', 'audiobook'];

const REVIEW_COMMENTS = [
  'Absolutely loved this book. Could not put it down from start to finish.',
  'A masterpiece of storytelling. The characters are deeply compelling.',
  'Well-written and thought-provoking. Highly recommend to any reader.',
  'One of the best books I have read this year. Truly remarkable.',
  'Beautiful prose and an engaging plot. Will definitely read more from this author.',
  'Deeply moving and emotionally powerful. Left me thinking for days.',
  'An interesting premise executed brilliantly. A must-read.',
  'Sharp, witty, and thoroughly entertaining. A delight to read.',
  'Page-turner from beginning to end. Highly addictive read.',
  'A thought-provoking journey that challenges your perspective.',
];

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch { reject(new Error('Failed to parse response')); } });
    }).on('error', reject);
  });
}

async function fetchBooksFromAPI() {
  const subjects = ['fiction', 'fantasy', 'mystery', 'science_fiction', 'classic', 'history', 'romance', 'philosophy'];
  const seen = new Set();
  const books = [];

  for (const subject of subjects) {
    try {
      const data = await fetchJSON(`https://openlibrary.org/subjects/${subject}.json?limit=20`);
      if (!data.works) continue;
      for (const work of data.works) {
        const key = work.title?.toLowerCase();
        if (!key || seen.has(key) || !work.title || !work.authors?.[0]?.name) continue;
        seen.add(key);
        const coverId = work.cover_id;
        const authorName = work.authors[0].name;
        // Normalise author name for email — take last word, lowercase, remove non-alpha
        const emailSlug = authorName.split(/\s+/).pop().toLowerCase().replace(/[^a-z]/g, '').slice(0, 12) || 'author';
        books.push({
          title: work.title,
          authorName,
          authorEmail: `${emailSlug}@bookhouse.com`,
          genre: subject.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          coverImage: coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : null,
          description: work.first_sentence || work.description || `A ${subject.replace(/_/g, ' ')} book by ${authorName}.`,
        });
      }
    } catch (err) {
      console.log(`  Open Library subject "${subject}" skipped: ${err.message}`);
    }
  }
  return books;
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // ─── Seed Admin ───────────────────────────────────────────────────────────
    let admin = await User.findOne({ email: ADMIN.email });
    if (!admin) { admin = await User.create(ADMIN); console.log('Created admin:', admin.name); }
    else console.log('Admin exists:', admin.name);

    // ─── Seed Readers ─────────────────────────────────────────────────────────
    const readers = [];
    for (const r of SEED_READERS) {
      let user = await User.findOne({ email: r.email });
      if (!user) { user = await User.create(r); console.log('Created reader:', user.name); }
      else console.log('Reader exists:', user.name);
      readers.push(user);
    }

    // ─── Fetch Books ──────────────────────────────────────────────────────────
    await Book.deleteMany({});
    await Review.deleteMany({});

    console.log('\nFetching books from Open Library API...');
    let apiBooks = await fetchBooksFromAPI();
    console.log(`Fetched ${apiBooks.length} unique books from API`);

    if (apiBooks.length < 20) {
      console.log('Using curated fallback books');
      apiBooks = FALLBACK_BOOKS;
    }

    // ─── Create Author Accounts ───────────────────────────────────────────────
    const authorMap = new Map(); // authorEmail -> User doc
    for (const b of apiBooks) {
      if (authorMap.has(b.authorEmail)) continue;
      const name = b.authorName;
      const email = b.authorEmail;
      let user = await User.findOne({ email });
      if (!user) {
        // Check if another book by the same author already created this user
        user = await User.create({ name, email, password: 'author1234', role: 'author' });
        console.log('Created author:', name, `(${email})`);
      }
      authorMap.set(email, user);
    }

    // ─── Create Books ─────────────────────────────────────────────────────────
    const bookDocs = apiBooks.slice(0, 200).map((b, i) => {
      const authorUser = authorMap.get(b.authorEmail);
      return {
        title: b.title,
        description: (b.description || '').substring(0, 500) || `A ${b.genre || 'fiction'} book by ${b.authorName}.`,
        price: 8.99 + Math.floor(Math.random() * 1200) / 100,
        coverImage: b.coverImage || `https://picsum.photos/seed/book${i}/300/450`,
        author: authorUser._id,
        authorName: b.authorName,
        genre: b.genre || 'Fiction',
        format: FORMATS[i % FORMATS.length],
        isPublished: true,
      };
    });

    await Book.createIndexes();
    const createdBooks = await Book.insertMany(bookDocs);
    console.log(`\nSeeded ${createdBooks.length} books across ${authorMap.size} authors`);

    // ─── Create Reviews ───────────────────────────────────────────────────────
    const reviewDocs = [];
    for (const book of createdBooks) {
      const numReviews = 2 + Math.floor(Math.random() * 3);
      const usedUsers = new Set();
      for (let j = 0; j < numReviews; j++) {
        const user = readers[j % readers.length];
        if (usedUsers.has(user._id.toString())) continue;
        usedUsers.add(user._id.toString());
        reviewDocs.push({
          bookId: book._id,
          userId: user._id,
          rating: 3 + Math.floor(Math.random() * 3),
          comment: REVIEW_COMMENTS[Math.floor(Math.random() * REVIEW_COMMENTS.length)],
        });
      }
    }
    await Review.insertMany(reviewDocs);

    // ─── Update Ratings ───────────────────────────────────────────────────────
    for (const book of createdBooks) {
      const stats = await Review.aggregate([
        { $match: { bookId: book._id } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
      ]);
      await Book.findByIdAndUpdate(book._id, {
        ratingsAverage: stats[0] ? Math.round(stats[0].avg * 10) / 10 : 0,
        ratingsCount: stats[0]?.count || 0,
      });
    }
    console.log(`Seeded ${reviewDocs.length} reviews`);
    console.log('Updated book ratings');

    // ─── Create Orders ────────────────────────────────────────────────────────
    await Order.deleteMany({});
    const orderDocs = [];
    const bookIds = createdBooks.map((b) => b._id);

    // Each reader buys 5-15 random books
    for (const reader of readers) {
      const numBooks = 5 + Math.floor(Math.random() * 11);
      const shuffled = [...bookIds].sort(() => Math.random() - 0.5).slice(0, numBooks);
      const orderBooks = shuffled.map((bid) => {
        const book = createdBooks.find((b) => b._id.equals(bid));
        return { book: bid, priceAtPurchase: book ? book.price : 9.99 };
      });
      const totalPrice = orderBooks.reduce((s, o) => s + o.priceAtPurchase, 0);

      // Create purchase spread over last 60 days
      const daysAgo = Math.floor(Math.random() * 60);
      const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      orderDocs.push({
        userId: reader._id,
        books: orderBooks,
        totalPrice,
        status: 'completed',
        createdAt,
      });
    }
    await Order.insertMany(orderDocs);

    // Add books to readers' libraries
    for (const reader of readers) {
      const readerOrders = orderDocs.filter((o) => o.userId.equals(reader._id));
      const purchasedIds = readerOrders.flatMap((o) => o.books.map((b) => b.book));
      await User.findByIdAndUpdate(reader._id, { $addToSet: { library: { $each: purchasedIds } } });
    }
    console.log(`Seeded ${orderDocs.length} orders`);

    await mongoose.disconnect();
    console.log('\n========== Seed Complete ==========');
    console.log(`  ${createdBooks.length} books, ${reviewDocs.length} reviews`);
    console.log(`  ${authorMap.size} authors, ${readers.length} readers, 1 admin`);
    console.log('  Admin:  admin@bookhouse.com / admin1234');
    console.log('  Authors: <name>@bookhouse.com / author1234');
    console.log('  Readers: alice,bob,carol,dan,eva@bookhouse.com / reader1234');
    console.log('===================================\n');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

const FALLBACK_BOOKS = [
  { title: 'The Great Gatsby', authorName: 'F. Scott Fitzgerald', authorEmail: 'fitzgerald@bookhouse.com', genre: 'Fiction', coverImage: null, description: 'A story of the mysteriously wealthy Jay Gatsby and his obsessive love for Daisy Buchanan.' },
  { title: 'To Kill a Mockingbird', authorName: 'Harper Lee', authorEmail: 'lee@bookhouse.com', genre: 'Fiction', coverImage: null, description: 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.' },
  { title: '1984', authorName: 'George Orwell', authorEmail: 'orwell@bookhouse.com', genre: 'Science Fiction', coverImage: null, description: 'A dystopian social science fiction novel and cautionary tale about the future of totalitarianism.' },
  { title: 'Pride and Prejudice', authorName: 'Jane Austen', authorEmail: 'austen@bookhouse.com', genre: 'Classic', coverImage: null, description: 'A romantic novel of manners that follows the character development of Elizabeth Bennet.' },
  { title: 'The Catcher in the Rye', authorName: 'J.D. Salinger', authorEmail: 'salinger@bookhouse.com', genre: 'Fiction', coverImage: null, description: 'The story of Holden Caulfield\'s experiences in New York City after being expelled from prep school.' },
  { title: 'One Hundred Years of Solitude', authorName: 'Gabriel Garcia Marquez', authorEmail: 'marquez@bookhouse.com', genre: 'Fiction', coverImage: null, description: 'The multi-generational story of the Buendia family in the fictional town of Macondo.' },
  { title: 'Brave New World', authorName: 'Aldous Huxley', authorEmail: 'huxley@bookhouse.com', genre: 'Science Fiction', coverImage: null, description: 'A dystopian novel set in a futuristic World State, inhabited by genetically modified citizens.' },
  { title: 'The Lord of the Rings', authorName: 'J.R.R. Tolkien', authorEmail: 'tolkien@bookhouse.com', genre: 'Fantasy', coverImage: null, description: 'An epic high-fantasy novel following the quest to destroy the One Ring.' },
  { title: 'Harry Potter and the Sorcerer\'s Stone', authorName: 'J.K. Rowling', authorEmail: 'rowling@bookhouse.com', genre: 'Fantasy', coverImage: null, description: 'A young wizard discovers his magical heritage and begins his journey at Hogwarts.' },
  { title: 'The Hobbit', authorName: 'J.R.R. Tolkien', authorEmail: 'tolkien@bookhouse.com', genre: 'Fantasy', coverImage: null, description: 'Bilbo Baggins is swept into a quest to reclaim the lost Dwarf Kingdom of Erebor.' },
  { title: 'Fahrenheit 451', authorName: 'Ray Bradbury', authorEmail: 'bradbury@bookhouse.com', genre: 'Science Fiction', coverImage: null, description: 'A future American society where books are outlawed and firemen burn any that are found.' },
  { title: 'Jane Eyre', authorName: 'Charlotte Bronte', authorEmail: 'bronte@bookhouse.com', genre: 'Classic', coverImage: null, description: 'The experiences of its eponymous heroine, including her growth to adulthood and her love for Mr. Rochester.' },
  { title: 'Moby Dick', authorName: 'Herman Melville', authorEmail: 'melville@bookhouse.com', genre: 'Classic', coverImage: null, description: 'The narrative of Captain Ahab\'s obsessive quest to kill the white whale.' },
  { title: 'Crime and Punishment', authorName: 'Fyodor Dostoevsky', authorEmail: 'dostoevsky@bookhouse.com', genre: 'Classic', coverImage: null, description: 'A young intellectual commits a murder and explores the psychological turmoil that follows.' },
  { title: 'Dune', authorName: 'Frank Herbert', authorEmail: 'herbert@bookhouse.com', genre: 'Science Fiction', coverImage: null, description: 'A epic science fiction saga set on the desert planet Arrakis.' },
  { title: 'The Picture of Dorian Gray', authorName: 'Oscar Wilde', authorEmail: 'wilde@bookhouse.com', genre: 'Classic', coverImage: null, description: 'A young man sells his soul for eternal youth while his portrait ages.' },
  { title: 'Wuthering Heights', authorName: 'Emily Bronte', authorEmail: 'bronte@bookhouse.com', genre: 'Classic', coverImage: null, description: 'A tale of passionate love and revenge set on the Yorkshire moors.' },
  { title: 'Sapiens', authorName: 'Yuval Noah Harari', authorEmail: 'harari@bookhouse.com', genre: 'History', coverImage: null, description: 'A brief history of humankind exploring how Homo sapiens came to dominate the world.' },
  { title: 'A Brief History of Time', authorName: 'Stephen Hawking', authorEmail: 'hawking@bookhouse.com', genre: 'Science', coverImage: null, description: 'A landmark volume exploring the origins of the universe and the nature of time.' },
  { title: 'Meditations', authorName: 'Marcus Aurelius', authorEmail: 'aurelius@bookhouse.com', genre: 'Philosophy', coverImage: null, description: 'Personal writings of the Roman emperor offering a series of spiritual reflections.' },
  { title: 'The Art of War', authorName: 'Sun Tzu', authorEmail: 'tzu@bookhouse.com', genre: 'Philosophy', coverImage: null, description: 'An ancient Chinese military treatise on strategy, tactics, and leadership.' },
  { title: 'The Silent Patient', authorName: 'Alex Michaelides', authorEmail: 'michaelides@bookhouse.com', genre: 'Mystery', coverImage: null, description: 'A thriller about a woman who shoots her husband and then never speaks another word.' },
  { title: 'Gone Girl', authorName: 'Gillian Flynn', authorEmail: 'flynn@bookhouse.com', genre: 'Mystery', coverImage: null, description: 'A mystery thriller about a wife\'s disappearance and the secrets that surface.' },
  { title: 'The Martian', authorName: 'Andy Weir', authorEmail: 'weir@bookhouse.com', genre: 'Science Fiction', coverImage: null, description: 'An astronaut stranded on Mars fights to survive using his ingenuity.' },
  { title: 'Educated', authorName: 'Tara Westover', authorEmail: 'westover@bookhouse.com', genre: 'Biography', coverImage: null, description: 'A memoir of a woman who grows up in a survivalist family and eventually goes to Cambridge.' },
  { title: 'Atomic Habits', authorName: 'James Clear', authorEmail: 'clear@bookhouse.com', genre: 'Self-Help', coverImage: null, description: 'A practical guide on how to build good habits and break bad ones.' },
  { title: 'The Da Vinci Code', authorName: 'Dan Brown', authorEmail: 'brown@bookhouse.com', genre: 'Mystery', coverImage: null, description: 'A mystery thriller involving a secret society and hidden religious truths.' },
  { title: 'The Alchemist', authorName: 'Paulo Coelho', authorEmail: 'coelho@bookhouse.com', genre: 'Fiction', coverImage: null, description: 'A young Andalusian shepherd follows his dream to find treasure at the Egyptian pyramids.' },
  { title: 'The Name of the Wind', authorName: 'Patrick Rothfuss', authorEmail: 'rothfuss@bookhouse.com', genre: 'Fantasy', coverImage: null, description: 'The story of Kvothe, a legendary figure who recounts his extraordinary life.' },
  { title: 'Thinking, Fast and Slow', authorName: 'Daniel Kahneman', authorEmail: 'kahneman@bookhouse.com', genre: 'Psychology', coverImage: null, description: 'A exploration of the two systems that drive the way we think.' },
];

seed();
