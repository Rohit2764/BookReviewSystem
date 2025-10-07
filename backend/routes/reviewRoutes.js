const express = require('express');
const { body } = require('express-validator');
const reviewController = require('../controllers/reviewController');

const auth = require('../middleware/auth');

const router = express.Router();

// Add a review (protected)
router.post(
  '/',
  auth,
  [
    body('bookId').isMongoId().withMessage('Valid book ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('reviewText').notEmpty().withMessage('Review text is required')
  ],
  reviewController.createReview
);

// Update a review (protected, only owner)
router.put(
  '/:id',
  auth,
  [
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('reviewText').optional().notEmpty().withMessage('Review text cannot be empty')
  ],
  reviewController.updateReview
);

// Delete a review (protected, only owner)
router.delete('/:id', auth, reviewController.deleteReview);

module.exports = router;
