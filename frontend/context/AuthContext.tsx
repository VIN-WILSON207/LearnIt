'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient, { tokenManager, normalizeRole, ApiError } from '@/lib/apiClient';
import { LoginResponse, User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string, levelId?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = tokenManager.getToken();

        if (storedUser && token) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
          } catch (error) {
            console.error('Failed to parse stored user:', error);
            localStorage.removeItem('user');
            tokenManager.clearToken();
          }
        } else if (!token) {
          // No token means not authenticated, clear any stale user data
          tokenManager.clearToken();
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        tokenManager.clearToken();
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await apiClient.post<LoginResponse>('/api/auth/login', {
        email,
        password,
      });

      // Store token
      tokenManager.setToken(data.token);

      // Normalize role (INSTRUCTOR → instructor, uppercase → lowercase)
      const normalizedRole = normalizeRole(data.user.role);

      // Create normalized user object
      const normalizedUser: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: normalizedRole,
        avatar: undefined, // Backend doesn't provide avatar yet
      };

      // Store user
      setUser(normalizedUser);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
    } catch (error) {
      // Clear any stale auth data on login failure
      tokenManager.clearToken();
      
      if (error instanceof ApiError) {
        throw new Error(error.message || 'Login failed');
      }
      throw error;

    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: string = 'STUDENT',
    levelId?: string
  ) => {
    setIsLoading(true);
    try {
      const data = await apiClient.post<LoginResponse>('/api/auth/register', {
        name,
        email,
        password,
        role,
        levelId,
      });

      // Store token
      tokenManager.setToken(data.token);

      // Normalize role
      const normalizedRole = normalizeRole(data.user.role);

      // Create normalized user object
      const normalizedUser: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: normalizedRole,
        avatar: undefined,
      };

      // Store user
      setUser(normalizedUser);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
    } catch (error) {
      tokenManager.clearToken();
      
      if (error instanceof ApiError) {
        throw new Error(error.message || 'Registration failed');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    tokenManager.clearToken();
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
