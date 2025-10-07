const Book = require('../models/Book');
const Review = require('../models/Review');

// Get paginated list of books with search, filter, and sort
exports.getBooks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    // Search parameters
    const search = req.query.search || '';
    const genre = req.query.genre || '';
    const year = req.query.year ? parseInt(req.query.year) : null;

    // Sort parameters
    const sortBy = req.query.sortBy || 'createdAt'; // createdAt, year, averageRating
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build query
    let query = {};

    // Search in title and author
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by genre
    if (genre) {
      query.genre = { $regex: genre, $options: 'i' };
    }

    // Filter by year
    if (year) {
      query.year = year;
    }

    // Get total count for filtered results
    const total = await Book.countDocuments(query);

    // Build sort object
    let sortObj = {};
    if (sortBy === 'year') {
      sortObj.year = sortOrder;
    } else if (sortBy === 'averageRating') {
      // For rating sort, we need to join with reviews and calculate average
      // This is a simplified version - in production you'd use aggregation
      sortObj.createdAt = sortOrder; // Fallback to createdAt
    } else {
      sortObj.createdAt = sortOrder;
    }

    const books = await Book.find(query)
      .skip(skip)
      .limit(limit)
      .populate('addedBy', 'name email')
      .sort(sortObj);

    res.json({
      page,
      totalPages: Math.ceil(total / limit),
      totalBooks: total,
      books
    });
  } catch (error) {
    console.error('Error in getBooks:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get book details with reviews and average rating
exports.getBookDetails = async (req, res) => {
  try {
    const bookId = req.params.id;
    const book = await Book.findById(bookId).populate('addedBy', 'name email');
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const reviews = await Review.find({ bookId }).populate('userId', 'name email');
    const averageRating = reviews.length
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;

    res.json({ book, reviews, averageRating });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a new book
exports.addBook = async (req, res) => {
  try {
    const { title, author, description, genre, year } = req.body;
    const addedBy = req.user._id;

    const book = new Book({ title, author, description, genre, year, addedBy });
    await book.save();

    res.status(201).json({ message: 'Book added successfully', book });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a book (only creator)
exports.updateBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const { title, author, description, genre, year } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.addedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.description = description || book.description;
    book.genre = genre || book.genre;
    book.year = year || book.year;

    await book.save();

    res.json({ message: 'Book updated successfully', book });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a book (only creator)
exports.deleteBook = async (req, res) => {
  try {
    const bookId = req.params.id;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.addedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await book.remove();

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
