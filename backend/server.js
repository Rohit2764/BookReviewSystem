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
const PORT = process.env.PORT || 10000;
const MONGO_URI = process.env.MONGO_URI;

// --- Middleware ---
app.use(cors({
    origin: 'https://book-review-system-rkp.vercel.app'
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
app.use(errorHandler);

// --- Sentinel flag to prevent multiple server starts ---
let isServerStarted = false;

// --- Function to start the server ---
const startServer = async () => {
  // Only proceed if the server hasn't been started yet
  if (isServerStarted) {
    console.log('Server has already been started. Ignoring duplicate call.');
    return;
  }

  try {
    // 1. Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('Successfully connected to MongoDB!');

    // 2. Start listening for requests
    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
      // Set the flag to true once the server is successfully listening
      isServerStarted = true;
    });

  } catch (error) {
    console.error('Failed to start server!', error);
    process.exit(1);
  }
};

// --- Start the application ---
startServer();