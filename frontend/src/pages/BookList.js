import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const BookList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [pagination, setPagination] = useState({ totalPages: 0, currentPage: 1, hasPrev: false, hasNext: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New states for search, filter, sort
  const [search, setSearch] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchBooks = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page);
      if (search) params.append('search', search);
      if (genreFilter) params.append('genre', genreFilter);
      if (yearFilter) params.append('year', yearFilter);
      if (sortBy) params.append('sortBy', sortBy);
      if (sortOrder) params.append('sortOrder', sortOrder);

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/books?${params.toString()}`);
      setBooks(response.data.books);
      const { page: currentPage, totalPages } = response.data;
      setPagination({
        totalPages,
        currentPage,
        hasPrev: currentPage > 1,
        hasNext: currentPage < totalPages
      });
      setError(null);
    } catch (err) {
      setError('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [search, genreFilter, yearFilter, sortBy, sortOrder]);

  const handlePageChange = (page) => {
    fetchBooks(page);
  };

  const handleDelete = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/books/${bookId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setBooks(prevBooks => prevBooks.filter(book => book._id !== bookId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete book');
    }
  };

  const handleEdit = (bookId) => {
    navigate(`/edit-book/${bookId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8">Books</h1>

      {/* Search, Filter, Sort Controls */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
        <input
          type="text"
          placeholder="Search by title or author"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 dark:border-gray-600 rounded px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Search books by title or author"
        />
        <select
          value={genreFilter}
          onChange={e => setGenreFilter(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Filter by genre"
        >
          <option value="">All Genres</option>
          <option value="Fiction">Fiction</option>
          <option value="Nonfiction">Nonfiction</option>
          <option value="Fantasy">Fantasy</option>
          <option value="Science">Science</option>
          <option value="Biography">Biography</option>
          {/* Add more genres as needed */}
        </select>
        <input
          type="number"
          placeholder="Filter by year"
          value={yearFilter}
          onChange={e => setYearFilter(e.target.value)}
          className="w-24 border border-gray-300 dark:border-gray-600 rounded px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Filter by year"
          min="1000"
          max={new Date().getFullYear() + 1}
        />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Sort by"
        >
          <option value="createdAt">Newest</option>
          <option value="year">Year</option>
          <option value="averageRating">Rating</option>
        </select>
        <select
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Sort order"
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center text-gray-600 dark:text-gray-400 mt-10">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-600 dark:text-red-400 mt-10">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {books.map(book => (
              <div
                key={book._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6 flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">{book.title}</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">by <span className="font-medium">{book.author}</span></p>
                  <p className="text-gray-500 dark:text-gray-500 mb-3 italic">{book.genre} - {book.year}</p>
                </div>
                <div className="flex space-x-3 mt-4">
                  <Link
                    to={`/books/${book._id}`}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-md font-semibold transition-colors"
                  >
                    View Details
                  </Link>
                  {(user && book.addedBy && user.id === book.addedBy._id.toString()) && (
                    <>
                      <button
                        onClick={() => handleEdit(book._id)}
                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-md font-semibold transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(book._id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-md font-semibold transition-colors"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-10 space-x-4">
              {pagination.hasPrev && (
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 rounded-md text-gray-800 dark:text-white font-semibold transition-colors"
                >
                  Previous
                </button>
              )}
              <span className="px-4 py-2 text-gray-700 dark:text-gray-300 font-medium">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              {pagination.hasNext && (
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 rounded-md text-gray-800 dark:text-white font-semibold transition-colors"
                >
                  Next
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BookList;
