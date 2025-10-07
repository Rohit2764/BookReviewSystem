import axios from 'axios';

// Get the base API URL from environment variables.
// Use the local URL as a fallback for development.
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create a new Axios instance with a custom configuration
const api = axios.create({
  // Set the base URL for all requests made with this instance
  baseURL: `${API_URL}/api`,
});

// You can also add interceptors here later for handling tokens automatically

export default api;
