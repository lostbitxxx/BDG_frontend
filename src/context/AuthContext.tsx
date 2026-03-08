import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { authService } from "../services/api";
import type { User } from "../types";
import { auth, signInWithCustomToken, signOut as firebaseSignOut, onAuthStateChanged } from "../lib/firebase";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(() => authService.getUser());
  const [isLoading, setIsLoading] = useState(true);
  const initializationRef = useRef(false);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in - get and store the token for API calls
        console.log('Auth state changed: user signed in', firebaseUser.uid);
        try {
          const token = await firebaseUser.getIdToken(true);
          localStorage.setItem('token', token);
          // Note: Full user object comes from login flow, not here
        } catch (error) {
          console.error('Failed to get auth token:', error);
        }
      } else {
        // User is signed out - clear local state if we have a stored token
        if (authService.isAuthenticated()) {
          console.log('Auth state changed: user signed out, clearing local state');
          authService.logout();
          setUser(null);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Initialize auth state - just verify we have a valid user from localStorage
  // The stored token in localStorage is used for API authentication
  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    const initializeAuth = async () => {
      setIsLoading(true);

      if (!authService.isAuthenticated()) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      // We have a stored user and token in localStorage
      // The token will be used directly for API calls via getAuthHeaders()
      // No need to restore Firebase session - just verify token is valid
      // If Firebase session exists, try to refresh the token
      if (auth.currentUser) {
        try {
          const freshToken = await auth.currentUser.getIdToken(true);
          if (freshToken) {
            localStorage.setItem('token', freshToken);
          }
        } catch {
          // Token refresh failed, but we still have the stored token
          console.log('Using stored token');
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
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
      value={{ user, isAuthenticated: !!user, isLoading, login, logout }}
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
