import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import RatingChart from '../components/RatingChart';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const BookDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ''
  });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  useEffect(() => {
    fetchBookDetails();
  }, [id]);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/books/${id}`);
      setBook(response.data.book);
      setReviews(response.data.reviews);
      setAverageRating(response.data.averageRating);
      setError(null);
    } catch (err) {
      setError('Failed to fetch book details');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewChange = e => {
    const { name, value } = e.target;
    setNewReview(prev => ({ ...prev, [name]: value }));
  };

  const handleAddReview = async e => {
    e.preventDefault();
    if (!user) {
      setReviewError('You must be logged in to add a review.');
      return;
    }
    setReviewLoading(true);
    setReviewError(null);
    try {
      await axios.post(`${API_BASE_URL}/reviews`, {
        bookId: id,
        rating: Number(newReview.rating),
        comment: newReview.comment
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setNewReview({ rating: 5, comment: '' });
      fetchBookDetails();
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to add review');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/reviews/${reviewId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      fetchBookDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete review');
    }
  };

  if (loading) return <div className="text-center text-gray-600 dark:text-gray-400 mt-10">Loading...</div>;
  if (error) return <div className="text-center text-red-600 dark:text-red-400 mt-10">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">{book.title}</h1>
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-1">by <span className="font-semibold">{book.author}</span></p>
      <p className="text-gray-600 dark:text-gray-400 italic mb-4">{book.genre} - {book.year}</p>
      <p className="text-gray-700 dark:text-gray-300 mb-6">{book.description}</p>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Average Rating: {averageRating.toFixed(1)} / 5</h2>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <RatingChart reviews={reviews} />
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Reviews</h3>
        {reviews.length === 0 && <p className="text-gray-600 dark:text-gray-400">No reviews yet.</p>}
        <ul className="space-y-4">
          {reviews.map(review => (
            <li key={review._id} className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-900 dark:text-white">{review.userId.name}</span>
                <span className="text-yellow-500 font-bold">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-2">{review.comment}</p>
              {user && user.id === review.userId._id && (
                <button
                  onClick={() => handleDeleteReview(review._id)}
                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-semibold"
                >
                  Delete Review
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {user && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add a Review</h3>
          {reviewError && <p className="text-red-600 dark:text-red-400 mb-2">{reviewError}</p>}
          <form onSubmit={handleAddReview} className="space-y-4 max-w-md">
            <div>
              <label htmlFor="rating" className="block mb-1 font-semibold text-gray-900 dark:text-white">Rating</label>
              <select
                id="rating"
                name="rating"
                value={newReview.rating}
                onChange={handleReviewChange}
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                {[5,4,3,2,1].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="comment" className="block mb-1 font-semibold text-gray-900 dark:text-white">Comment</label>
              <textarea
                id="comment"
                name="comment"
                value={newReview.comment}
                onChange={handleReviewChange}
                required
                minLength={5}
                rows={4}
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={reviewLoading}
              className="bg-yellow-400 hover:bg-yellow-500 text-white px-6 py-2 rounded font-semibold transition-colors disabled:opacity-50"
            >
              {reviewLoading ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default BookDetails;
