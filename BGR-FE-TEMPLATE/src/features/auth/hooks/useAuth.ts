import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface UseAuthReturn extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    // Check if user is already logged in
    const checkAuthStatus = async () => {
      try {
        // Simulate API call to check authentication status
        setState(prev => ({ ...prev, isLoading: true }));

        // Get user from localStorage (this is just a mock implementation)
        const storedUser = localStorage.getItem('auth_user');

        if (storedUser) {
          const user = JSON.parse(storedUser);
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Failed to authenticate',
        });
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock successful login
      const user = { id: '1', email, name: 'John Doe' };

      // Store user in localStorage
      localStorage.setItem('auth_user', JSON.stringify(user));

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Invalid credentials',
      }));
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock successful registration
      const user = { id: '1', email, name };

      // Store user in localStorage
      localStorage.setItem('auth_user', JSON.stringify(user));

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Registration failed',
      }));
    }
  };

  const logout = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    // Remove user from localStorage
    localStorage.removeItem('auth_user');

    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  return {
    ...state,
    login,
    register,
    logout,
  };
}
