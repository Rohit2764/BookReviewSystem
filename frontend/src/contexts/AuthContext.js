import React, { createContext, useState, useContext, useEffect } from 'react';
// Step 1: Import the new api instance
import api from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Step 2: Remove the old API_BASE_URL constant
// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Step 3: Set the header on the api instance, not the global axios
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Here you would typically fetch user data from a '/profile' endpoint
      // For now, we'll just set a placeholder.
      setUser({ token }); 
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Step 4: Use the 'api' instance with the relative path
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      // Step 5: Set the header on the 'api' instance
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const signup = async (name, email, password) => {
    try {
      // Step 6: Use the 'api' instance with the relative path
      const response = await api.post('/auth/signup', { name, email, password });
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      // Step 7: Set the header on the 'api' instance
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Signup failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    // Step 8: Delete the header from the 'api' instance
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};