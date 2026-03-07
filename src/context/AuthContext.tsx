import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { authService } from "../services/api";
import type { User } from "../types";
import { auth, signInWithCustomToken, signOut as firebaseSignOut } from "../lib/firebase";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(() => authService.getUser());

  // Restore Firebase session when we have a stored token (e.g. after refresh) so API calls use the correct user's ID token
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      setUser(null);
      return;
    }
    const token = authService.getToken();
    if (token && !auth.currentUser) {
      signInWithCustomToken(auth, token).catch(() => setUser(null));
    }
  }, []);

  const login = useCallback((user: User, token: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
    } catch {
      // ignore
    }
    authService.logout();
    localStorage.removeItem("character");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
