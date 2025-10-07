const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('../models/User');
const Book = require('../models/Book');
const Review = require('../models/Review');

const users = [
  { name: 'Alice', email: 'alice@example.com', password: 'password123' },
  { name: 'Bob', email: 'bob@example.com', password: 'password123' },
  { name: 'Charlie', email: 'charlie@example.com', password: 'password123' }
];

const books = [
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    description: 'A novel set in the Jazz Age that tells the story of Jay Gatsby and his unrequited love for Daisy Buchanan.',
    genre: 'Classic',
    year: 1925
  },
  {
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    description: 'A novel about racial injustice in the Deep South seen through the eyes of young Scout Finch.',
    genre: 'Classic',
    year: 1960
  },
  {
    title: '1984',
    author: 'George Orwell',
    description: 'A dystopian novel about totalitarianism and surveillance.',
    genre: 'Dystopian',
    year: 1949
  }
];

const reviews = [
  { rating: 5, reviewText: 'A masterpiece of American literature.' },
  { rating: 4, reviewText: 'A powerful and moving story.' },
  { rating: 5, reviewText: 'Chilling and thought-provoking.' }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bookreview', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Book.deleteMany({});
    await Review.deleteMany({});

    // Create users with hashed passwords
    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = new User({ ...userData, password: hashedPassword });
      await user.save();
    }

    const savedUsers = await User.find();

    // Create books with addedBy reference
    for (let i = 0; i < books.length; i++) {
      const bookData = books[i];
      const book = new Book({ ...bookData, addedBy: savedUsers[i % savedUsers.length]._id });
      await book.save();
    }

    const savedBooks = await Book.find();

    // Create reviews with bookId and userId references
    for (let i = 0; i < reviews.length; i++) {
      const reviewData = reviews[i];
      const review = new Review({
        ...reviewData,
        bookId: savedBooks[i % savedBooks.length]._id,
        userId: savedUsers[i % savedUsers.length]._id
      });
      await review.save();
    }

    console.log('Seed data created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();
