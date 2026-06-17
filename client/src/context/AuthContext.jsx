import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('shopsphere-token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user profile on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const data = await authService.getProfile(token);
          setUser(data.user);
        } catch (err) {
          // Token is invalid or expired
          localStorage.removeItem('shopsphere-token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('shopsphere-token', data.token);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    setLoading(true);
    try {
      const data = await authService.register(name, email, password);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('shopsphere-token', data.token);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('shopsphere-token');
  };

  const updateProfile = async (profileData) => {
    setError(null);
    try {
      const data = await authService.updateProfile(profileData, token);
      setUser(data.user);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Profile update failed';
      setError(message);
      throw new Error(message);
    }
  };

  const clearError = () => setError(null);

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
