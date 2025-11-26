import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const storedUser = authService.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      
      if (!response.success) {
        throw new Error(response.message || 'Email atau password salah');
      }

      setUser(response.data.user);
      
      return { success: true, user: response.data.user };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Terjadi kesalahan saat login' 
      };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);

      if (!response.success) {
        throw new Error(response.message || 'Gagal melakukan registrasi');
      }

      setUser(response.data.user);

      return { success: true, user: response.data.user };
    } catch (error) {
      console.error('Register error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Terjadi kesalahan saat registrasi' 
      };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData);
      
      if (response.success) {
        setUser(response.data);
      }
      
      return response;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isLoggedIn = () => {
    return user !== null;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    updateProfile,
    isAdmin,
    isLoggedIn,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

