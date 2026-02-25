import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { authService } from "../services/api";
import type { User } from "../types";
import { useCharacter, type CharacterKey } from "./CharacterContext";

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
  const { syncFromUser } = useCharacter();

  // Sync state if token becomes invalid/expired
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      setUser(null);
    }
  }, []);

  const login = useCallback(
    (user: User, token: string) => {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      // Sync this account's character immediately
      syncFromUser((user.character ?? "bunny") as CharacterKey);
      setUser(user);
    },
    [syncFromUser],
  );

  const logout = useCallback(() => {
    authService.logout();
    localStorage.removeItem("character");
    // Reset to default character on logout
    syncFromUser("bunny");
    setUser(null);
  }, [syncFromUser]);

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
