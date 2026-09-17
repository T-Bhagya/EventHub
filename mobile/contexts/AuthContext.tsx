import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { saveAuthData, getStoredToken, getStoredUser, clearAuthData } from '../storage/authStorage';
import { getProfileApi } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  role: Role | null;
  login: (token: string, user: User) => Promise<void>;
  register: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = await getStoredToken();
        const storedUser = await getStoredUser();

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);

          // Verify token validity by fetching profile silently
          try {
            const freshUser = await getProfileApi();
            setUser(freshUser);
            await saveAuthData(storedToken, freshUser);
          } catch (e) {
            // Token might be invalid or server unreachable; if unauthorized, logout
            const err = e as any;
            if (err.status === 401 || err.status === 403) {
              await clearAuthData();
              setToken(null);
              setUser(null);
            }
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    await saveAuthData(newToken, newUser);
  };

  const register = async (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    await saveAuthData(newToken, newUser);
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await clearAuthData();
  };

  const updateUser = async (updatedUser: User) => {
    setUser(updatedUser);
    if (token) {
      await saveAuthData(token, updatedUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        role: user?.role || null,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
