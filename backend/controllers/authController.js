const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const generateToken = (userId) => {
  // This function will throw an error if JWT_SECRET is missing
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Pass `next` to the function to handle errors
exports.signup = async (req, res, next) => { 
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const user = new User({ name, email, password });
    await user.save(); // This part is working

    // The error is likely happening on the next line if JWT_SECRET is missing
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    // Pass the error to the errorHandler middleware
    next(error); 
  }
};

// Pass `next` to the function to handle errors
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    // Pass the error to the errorHandler middleware
    next(error);
  }
};

// Pass `next` to the function to handle errors
exports.getProfile = async (req, res, next) => {
  try {
    const user = req.user;
    const books = await require('../models/Book').find({ addedBy: user._id });
    const reviews = await require('../models/Review').find({ userId: user._id }).populate('bookId', 'title');

    res.json({
      user: { id: user._id, name: user.name, email: user.email },
      books,
      reviews
    });
  } catch (error) {
    // Pass the error to the errorHandler middleware
    next(error);
  }
};