import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
    id: string;
    token: string;
    firstName: string;
    lastName: string;
    email: string;
    age: number;
    contactNumber: string;
    cartItems: string[];
    sellerReviews: string[];
}

interface UserContextType {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    isAuthenticated: boolean;
    logout: () => void;
  }
  
  const UserContext = createContext<UserContextType | undefined>(undefined);
  
  export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    });
  
    const isAuthenticated = Boolean(user);
  
    const logout = () => {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    };
  
    return (
      <UserContext.Provider value={{ user, setUser, isAuthenticated, logout }}>
        {children}
      </UserContext.Provider>
    );
  };
  
  export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
      throw new Error('useUser must be used within a UserProvider');
    }
    return context;
  };