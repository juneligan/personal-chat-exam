import React, { createContext, useState, ReactNode } from 'react';
// import type { ReactNode } from 'react';
import * as authApi from '../api/auth';

// Define a user interface instead of using 'any'
interface User {
  id?: string;
  username?: string;
  email?: string;
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    setUser(data.user);
    console.log('Login successful:', data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', data.user.id);
  };

  const register = async (username: string, email: string, password: string) => {
    const data = await authApi.register(username, email, password);
    setUser(data.user);
    console.log('Registration successful:', data.user);
  };

  const logout = () => {
    setUser(null);

    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userId');

    // No need to manually disconnect socket here
    // React will unmount the Chat component when user logs out
    // which will trigger the cleanup function in useEffect
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
