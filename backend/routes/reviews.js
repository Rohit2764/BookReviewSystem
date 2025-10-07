const express = require('express');
const { body } = require('express-validator');
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');

const router = express.Router();

// Create review (protected)
router.post('/:bookId', auth, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('reviewText').trim().isLength({ min: 10 }).withMessage('Review text must be at least 10 characters')
], reviewController.createReview);

// Update review (protected, only owner)
router.put('/:id', auth, [
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('reviewText').optional().trim().isLength({ min: 10 }).withMessage('Review text must be at least 10 characters')
], reviewController.updateReview);

// Delete review (protected, only owner)
router.delete('/:id', auth, reviewController.deleteReview);

module.exports = router;
