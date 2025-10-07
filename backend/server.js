const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes and middleware
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/bookRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 10000; // Render uses PORT env var
const MONGO_URI = process.env.MONGO_URI;

// --- Middleware ---
app.use(cors({
    // It's a good practice to restrict the origin in production
    // origin: process.env.FRONTEND_URL 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/reviews', reviewRoutes);

// --- Health check endpoint ---
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Book Review API is running' });
});

// --- Error handling middleware ---
// This should be the last middleware in the chain
app.use(errorHandler);


// --- Function to start the server ---
const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('Successfully connected to MongoDB!');

    // 2. Start listening for requests ONLY after the DB connection is successful
    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });

  } catch (error) {
    // Log the detailed error and stop the process if the DB connection fails
    console.error('Failed to connect to MongoDB!', error);
    process.exit(1);
  }
};
// --- Start the application after DB connection ---
startServer();

// --- Start the application ---
startServer();