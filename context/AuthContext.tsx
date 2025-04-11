import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import { login as loginApi, register as registerApi, fetchCurrentUser } from '../services/authService';
import { User, RegisterData } from '../types/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user is logged in on initial load
  useEffect(() => {
    async function loadUserFromToken() {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userData = await fetchCurrentUser(token);
        if (userData) {
          setUser(userData);
        } else {
          // Token is invalid, remove it
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    }

    loadUserFromToken();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await loginApi(email, password);
      if (result) {
        setUser(result.user);
        localStorage.setItem('token', result.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Register function
  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      const result = await registerApi(userData);
      if (result) {
        setUser(result.user);
        localStorage.setItem('token', result.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
