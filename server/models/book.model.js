import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    fileUrl: {
      type: String, // path to uploaded PDF/epub file
      default: null,
    },
    coverImage: {
      type: String, // path to uploaded cover image
      default: null,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    authorName: {
      type: String,     // snapshot of author's name at publish time — enables text search by author
      trim: true,
    },
    genre: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      set: (val) => Math.round(val * 10) / 10, // round to 1 decimal
    },
    ratingsCount: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes for common queries
bookSchema.index({ title: 'text', authorName: 'text', description: 'text' }); // full-text search (title + author name + description)
bookSchema.index({ author: 1 });                          // books by author
bookSchema.index({ genre: 1 });                           // filter by genre
bookSchema.index({ category: 1 });                        // filter by category
bookSchema.index({ price: 1 });                           // sort/filter by price
bookSchema.index({ isPublished: 1 });                     // published books only
bookSchema.index({ ratingsAverage: -1 });                 // top-rated books

const Book = mongoose.model('Book', bookSchema);
export default Book;
