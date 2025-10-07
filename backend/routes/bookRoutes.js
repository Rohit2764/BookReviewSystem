const express = require('express');
const { body } = require('express-validator');
const bookController = require('../controllers/bookController');
const auth = require('../middleware/auth');

const router = express.Router();

// Get paginated list of books (public)
router.get('/', bookController.getBooks);

// Get book details with reviews (public)
router.get('/:id', bookController.getBookDetails);

// Add a new book (protected)
router.post(
  '/',
  auth,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('author').notEmpty().withMessage('Author is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('genre').notEmpty().withMessage('Genre is required'),
    body('year').isInt({ min: 1000, max: new Date().getFullYear() + 1 }).withMessage('Valid year is required')
  ],
  bookController.addBook
);

// Update a book (protected, only creator)
router.put(
  '/:id',
  auth,
  [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('author').optional().notEmpty().withMessage('Author cannot be empty'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty'),
    body('genre').optional().notEmpty().withMessage('Genre cannot be empty'),
    body('year').optional().isInt({ min: 1000, max: new Date().getFullYear() + 1 }).withMessage('Valid year is required')
  ],
  bookController.updateBook
);

// Delete a book (protected, only creator)
router.delete('/:id', auth, bookController.deleteBook);

module.exports = router;
