const errorHandler = (err, req, res, next) => {
  // --- Step 1: Log the full error details for debugging ---
  // This part is crucial for seeing errors in your Render logs.
  console.error('--- An error occurred ---');
  console.error('Error Message:', err.message);
  console.error('Error Stack:', err.stack);
  console.error('--- End of error report ---');


  // --- Step 2: Handle specific, known errors (your code) ---
  // This sends clean messages to the frontend.
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  if (err.code === 11000) {
    // This is the "duplicate key" error, often for emails.
    return res.status(400).json({ message: 'A user with this email already exists.' });
  }

  // --- Step 3: Handle all other errors ---
  // This is a fallback for unexpected issues.
  res.status(500).json({ message: err.message || 'Something went wrong!' });
};

module.exports = errorHandler;