import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../shared/schema";
import { api } from "../shared/routes";
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
    const res = await fetch(api.auth.login.path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      throw new Error("Credenciais inválidas");
    }

    const data = await res.json();
    setUser(data);
    localStorage.setItem("current_user", JSON.stringify(data));
    setLocation(data.role === "admin" || data.role === "gestor" || data.userType === "gestor" ? "/admin" : "/user");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("current_user");
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
