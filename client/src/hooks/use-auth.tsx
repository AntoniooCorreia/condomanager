import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@shared/schema";
import { MOCK_USERS } from "@/lib/mock-data";
import { api } from "@shared/routes";
import { useLocation } from "wouter";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Try to restore session from localStorage first
    const stored = localStorage.getItem("current_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem("current_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch(api.auth.login.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        localStorage.setItem("current_user", JSON.stringify(data));
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      // Mock fallback
      const mockUser = MOCK_USERS.find((u) => u.username === username);
      if (mockUser) {
        setUser(mockUser);
        localStorage.setItem("current_user", JSON.stringify(mockUser));
      } else {
        throw new Error("Invalid credentials");
      }
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("current_user");
    localStorage.removeItem("mock_user");
    fetch(api.auth.logout.path, { method: "POST" }).catch(() => {});
    setLocation("/");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
