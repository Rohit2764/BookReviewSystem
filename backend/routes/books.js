const express = require('express');
const { body } = require('express-validator');
const bookController = require('../controllers/bookController');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all books (public)
router.get('/', bookController.getBooks);

// Get single book (public)
router.get('/:id', bookController.getBook);

// Create book (protected)
router.post('/', auth, [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('author').trim().isLength({ min: 1 }).withMessage('Author is required'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('genre').trim().isLength({ min: 1 }).withMessage('Genre is required'),
  body('year').isInt({ min: 1000, max: new Date().getFullYear() + 1 }).withMessage('Please provide a valid year')
], bookController.createBook);

// Update book (protected, only creator)
router.put('/:id', auth, [
  body('title').optional().trim().isLength({ min: 1 }).withMessage('Title cannot be empty'),
  body('author').optional().trim().isLength({ min: 1 }).withMessage('Author cannot be empty'),
  body('description').optional().trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('genre').optional().trim().isLength({ min: 1 }).withMessage('Genre cannot be empty'),
  body('year').optional().isInt({ min: 1000, max: new Date().getFullYear() + 1 }).withMessage('Please provide a valid year')
], bookController.updateBook);

// Delete book (protected, only creator)
router.delete('/:id', auth, bookController.deleteBook);

module.exports = router;
