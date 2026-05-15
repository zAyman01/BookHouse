import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import Book from './models/book.model.js';
import User from './models/user.model.js';
import Review from './models/review.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const SEED_AUTHOR = {
  name: 'BookHouse Publishing',
  email: 'publisher@bookhouse.com',
  password: 'publisher123',
  role: 'author',
};
const SEED_READERS = [
  {
    name: 'Alice Johnson',
    email: 'alice@bookhouse.com',
    password: 'reader1234',
    role: 'user',
  },
  {
    name: 'Bob Smith',
    email: 'bob@bookhouse.com',
    password: 'reader1234',
    role: 'user',
  },
  {
    name: 'Carol Davis',
    email: 'carol@bookhouse.com',
    password: 'reader1234',
    role: 'user',
  },
  {
    name: 'Dan Wilson',
    email: 'dan@bookhouse.com',
    password: 'reader1234',
    role: 'user',
  },
  {
    name: 'Eva Brown',
    email: 'eva@bookhouse.com',
    password: 'reader1234',
    role: 'user',
  },
];
const FORMATS = ['hardcover', 'paperback', 'e-book', 'audiobook'];
const GENRES = [
  'Fiction',
  'Fantasy',
  'Science Fiction',
  'Mystery',
  'Classic',
  'History',
  'Romance',
  'Philosophy',
];

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
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            reject(new Error('Failed to parse response'));
          }
        });
      })
      .on('error', reject);
  });
}

async function fetchBooksFromAPI() {
  const subjects = [
    'fiction',
    'fantasy',
    'mystery',
    'science_fiction',
    'classic',
    'history',
    'romance',
    'philosophy',
  ];
  const seen = new Set();
  const books = [];

  for (const subject of subjects) {
    try {
      const data = await fetchJSON(
        `https://openlibrary.org/subjects/${subject}.json?limit=20`
      );
      if (!data.works) continue;
      for (const work of data.works) {
        const key = work.title?.toLowerCase();
        if (!key || seen.has(key) || !work.title || !work.authors?.[0]?.name)
          continue;
        seen.add(key);
        const coverId = work.cover_id;
        books.push({
          title: work.title,
          author: work.authors[0].name,
          genre: subject
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase()),
          coverImage: coverId
            ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
            : null,
          description:
            work.first_sentence ||
            work.description ||
            `A captivating ${subject.replace(/_/g, ' ')} book by ${work.authors[0].name}.`,
        });
      }
    } catch (err) {
      console.log(
        `  Open Library subject "${subject}" skipped: ${err.message}`
      );
    }
  }
  return books;
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    let author = await User.findOne({ email: SEED_AUTHOR.email });
    if (!author) {
      author = await User.create(SEED_AUTHOR);
      console.log('Created author:', author.name);
    } else console.log('Using existing author:', author.name);

    const readers = [];
    for (const r of SEED_READERS) {
      let user = await User.findOne({ email: r.email });
      if (!user) {
        user = await User.create(r);
        console.log('Created reader:', user.name);
      } else console.log('Using existing reader:', user.name);
      readers.push(user);
    }

    await Book.deleteMany({ author: author._id });
    await Review.deleteMany({});

    console.log('Fetching books from Open Library API...');
    const apiBooks = await fetchBooksFromAPI();
    console.log(`Fetched ${apiBooks.length} unique books from API`);

    const sourceBooks = apiBooks.length >= 20 ? apiBooks : FALLBACK_BOOKS;
    if (apiBooks.length < 20)
      console.log('Using curated fallback (API returned < 20 books)');

    const bookDocs = sourceBooks.slice(0, 200).map((b, i) => ({
      title: b.title,
      description:
        (b.description || '').substring(0, 500) ||
        `A ${b.genre || 'fiction'} book by ${b.author}.`,
      price: 8.99 + Math.floor(Math.random() * 1200) / 100,
      coverImage: b.coverImage || `https://picsum.photos/seed/book${i}/300/450`,
      author: author._id,
      authorName: b.author,
      genre: b.genre || GENRES[i % GENRES.length],
      format: FORMATS[i % FORMATS.length],
      isPublished: true,
    }));

    const createdBooks = await Book.insertMany(bookDocs);
    console.log(`Seeded ${createdBooks.length} books`);

    const reviewDocs = [];
    for (const book of createdBooks) {
      const numReviews = 2 + Math.floor(Math.random() * 3);
      const usedUsers = new Set();
      for (let j = 0; j < numReviews; j++) {
        const user = readers[j % readers.length];
        if (usedUsers.has(user._id.toString())) continue;
        usedUsers.add(user._id.toString());
        const comment =
          REVIEW_COMMENTS[Math.floor(Math.random() * REVIEW_COMMENTS.length)];
        reviewDocs.push({
          bookId: book._id,
          userId: user._id,
          rating: 3 + Math.floor(Math.random() * 3),
          comment,
        });
      }
    }
    await Review.insertMany(reviewDocs);
    console.log(`Seeded ${reviewDocs.length} reviews`);

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
    console.log('Updated book ratings');

    await mongoose.disconnect();
    console.log('\nSeed complete!');
    console.log(`  ${createdBooks.length} books, ${reviewDocs.length} reviews`);
    console.log('  Author:', 'publisher@bookhouse.com / publisher123');
    console.log(
      '  Readers: alice,bob,carol,dan,eva@bookhouse.com / reader1234'
    );
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

const FALLBACK_BOOKS = [
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    genre: 'Fiction',
    coverImage: null,
    description:
      'A story of the mysteriously wealthy Jay Gatsby and his obsessive love for Daisy Buchanan.',
  },
  {
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    genre: 'Fiction',
    coverImage: null,
    description:
      'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.',
  },
  {
    title: '1984',
    author: 'George Orwell',
    genre: 'Science Fiction',
    coverImage: null,
    description:
      'A dystopian social science fiction novel and cautionary tale about the future of totalitarianism.',
  },
  {
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    genre: 'Classic',
    coverImage: null,
    description:
      'A romantic novel of manners that follows the character development of Elizabeth Bennet.',
  },
  {
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    genre: 'Fiction',
    coverImage: null,
    description:
      "The story of Holden Caulfield's experiences in New York City after being expelled from prep school.",
  },
  {
    title: 'One Hundred Years of Solitude',
    author: 'Gabriel Garcia Marquez',
    genre: 'Fiction',
    coverImage: null,
    description:
      'The multi-generational story of the Buendia family in the fictional town of Macondo.',
  },
  {
    title: 'Brave New World',
    author: 'Aldous Huxley',
    genre: 'Science Fiction',
    coverImage: null,
    description:
      'A dystopian novel set in a futuristic World State, inhabited by genetically modified citizens.',
  },
  {
    title: 'The Lord of the Rings',
    author: 'J.R.R. Tolkien',
    genre: 'Fantasy',
    coverImage: null,
    description:
      'An epic high-fantasy novel following the quest to destroy the One Ring.',
  },
  {
    title: "Harry Potter and the Sorcerer's Stone",
    author: 'J.K. Rowling',
    genre: 'Fantasy',
    coverImage: null,
    description:
      'A young wizard discovers his magical heritage and begins his journey at Hogwarts.',
  },
  {
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    genre: 'Fantasy',
    coverImage: null,
    description:
      'Bilbo Baggins is swept into a quest to reclaim the lost Dwarf Kingdom of Erebor.',
  },
  {
    title: 'Fahrenheit 451',
    author: 'Ray Bradbury',
    genre: 'Science Fiction',
    coverImage: null,
    description:
      'A future American society where books are outlawed and firemen burn any that are found.',
  },
  {
    title: 'Jane Eyre',
    author: 'Charlotte Bronte',
    genre: 'Classic',
    coverImage: null,
    description:
      'The experiences of its eponymous heroine, including her growth to adulthood and her love for Mr. Rochester.',
  },
  {
    title: 'Moby Dick',
    author: 'Herman Melville',
    genre: 'Classic',
    coverImage: null,
    description:
      "The narrative of Captain Ahab's obsessive quest to kill the white whale.",
  },
  {
    title: 'Crime and Punishment',
    author: 'Fyodor Dostoevsky',
    genre: 'Classic',
    coverImage: null,
    description:
      'A young intellectual commits a murder and explores the psychological turmoil that follows.',
  },
  {
    title: 'Dune',
    author: 'Frank Herbert',
    genre: 'Science Fiction',
    coverImage: null,
    description:
      'A epic science fiction saga set on the desert planet Arrakis.',
  },
  {
    title: 'The Picture of Dorian Gray',
    author: 'Oscar Wilde',
    genre: 'Classic',
    coverImage: null,
    description:
      'A young man sells his soul for eternal youth while his portrait ages.',
  },
  {
    title: 'Wuthering Heights',
    author: 'Emily Bronte',
    genre: 'Classic',
    coverImage: null,
    description:
      'A tale of passionate love and revenge set on the Yorkshire moors.',
  },
  {
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    genre: 'History',
    coverImage: null,
    description:
      'A brief history of humankind exploring how Homo sapiens came to dominate the world.',
  },
  {
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    genre: 'Science',
    coverImage: null,
    description:
      'A landmark volume exploring the origins of the universe and the nature of time.',
  },
  {
    title: 'Meditations',
    author: 'Marcus Aurelius',
    genre: 'Philosophy',
    coverImage: null,
    description:
      'Personal writings of the Roman emperor offering a series of spiritual reflections.',
  },
  {
    title: 'The Art of War',
    author: 'Sun Tzu',
    genre: 'Philosophy',
    coverImage: null,
    description:
      'An ancient Chinese military treatise on strategy, tactics, and leadership.',
  },
  {
    title: 'The Silent Patient',
    author: 'Alex Michaelides',
    genre: 'Mystery',
    coverImage: null,
    description:
      'A thriller about a woman who shoots her husband and then never speaks another word.',
  },
  {
    title: 'Gone Girl',
    author: 'Gillian Flynn',
    genre: 'Mystery',
    coverImage: null,
    description:
      "A mystery thriller about a wife's disappearance and the secrets that surface.",
  },
  {
    title: 'The Martian',
    author: 'Andy Weir',
    genre: 'Science Fiction',
    coverImage: null,
    description:
      'An astronaut stranded on Mars fights to survive using his ingenuity.',
  },
  {
    title: 'Educated',
    author: 'Tara Westover',
    genre: 'Biography',
    coverImage: null,
    description:
      'A memoir of a woman who grows up in a survivalist family and eventually goes to Cambridge.',
  },
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    genre: 'Self-Help',
    coverImage: null,
    description:
      'A practical guide on how to build good habits and break bad ones.',
  },
  {
    title: 'The Da Vinci Code',
    author: 'Dan Brown',
    genre: 'Mystery',
    coverImage: null,
    description:
      'A mystery thriller involving a secret society and hidden religious truths.',
  },
  {
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    genre: 'Fiction',
    coverImage: null,
    description:
      'A young Andalusian shepherd follows his dream to find treasure at the Egyptian pyramids.',
  },
  {
    title: 'The Name of the Wind',
    author: 'Patrick Rothfuss',
    genre: 'Fantasy',
    coverImage: null,
    description:
      'The story of Kvothe, a legendary figure who recounts his extraordinary life.',
  },
  {
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    genre: 'Psychology',
    coverImage: null,
    description:
      'A exploration of the two systems that drive the way we think.',
  },
];

seed();
