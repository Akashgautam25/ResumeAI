import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.js';
import { authService } from '../services/authService.js';
import { useToast } from './ToastContext.js';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  loginWithDemo: () => Promise<void>;
  register: (data: { name: string; email: string; password: string; targetRole?: string }) => Promise<void>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { success, error: toastError } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('resumeai_access_token');
      if (token) {
        try {
          const currentUser = await authService.getMe();
          setUser(currentUser);
        } catch {
          localStorage.removeItem('resumeai_access_token');
          localStorage.removeItem('resumeai_refresh_token');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (data: { email: string; password: string }) => {
    try {
      setIsLoading(true);
      const res = await authService.login(data);
      localStorage.setItem('resumeai_access_token', res.accessToken);
      localStorage.setItem('resumeai_refresh_token', res.refreshToken);
      setUser(res.user);
      success(`Welcome back, ${res.user.name}!`);
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Invalid email or password';
      toastError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithDemo = async () => {
    return login({
      email: 'demo@resumeai.com',
      password: 'Password123!',
    });
  };

  const register = async (data: { name: string; email: string; password: string; targetRole?: string }) => {
    try {
      setIsLoading(true);
      const res = await authService.register(data);
      localStorage.setItem('resumeai_access_token', res.accessToken);
      localStorage.setItem('resumeai_refresh_token', res.refreshToken);
      setUser(res.user);
      success('Account created successfully! Welcome to ResumeAI.');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Registration failed';
      toastError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    success('Logged out successfully.');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithDemo,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
