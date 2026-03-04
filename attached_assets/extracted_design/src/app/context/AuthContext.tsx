import { createContext, useContext, useState, ReactNode } from "react";
import { User, UserRole } from "../types/user";

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // Mock user - in production this would come from authentication
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    return null;
  });

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  };

  const updateUser = (user: User | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user));
    }
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, setCurrentUser: updateUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
