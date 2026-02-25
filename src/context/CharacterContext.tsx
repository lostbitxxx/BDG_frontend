import React, { createContext, useContext, useState } from "react";
import { authService } from "../services/api";

export type CharacterKey = "bunny" | "cat" | "owl";

export interface Character {
  key: CharacterKey;
  name: string;
  file: string;
  emoji: string;
  description: string;
}

export const CHARACTERS: Character[] = [
  {
    key: "bunny",
    name: "Bunny",
    file: "/bunny.riv",
    emoji: "🐰",
    description: "Cheerful and energetic — always ready to help!",
  },
  {
    key: "cat",
    name: "Cat",
    file: "/cat.riv",
    emoji: "🐱",
    description: "Cool and clever — gives sharp, witty answers.",
  },
  {
    key: "owl",
    name: "Owl",
    file: "/owl.riv",
    emoji: "🦉",
    description: "Wise and calm — thoughtful guidance every time.",
  },
];

interface CharacterContextType {
  selected: Character;
  setCharacter: (key: CharacterKey) => Promise<void>;
  syncFromUser: (characterKey: CharacterKey) => void;
}

const CharacterContext = createContext<CharacterContextType | null>(null);

const DEFAULT: Character = CHARACTERS[0]!;

function resolveCharacter(key?: string | null): Character {
  return CHARACTERS.find((c) => c.key === key) ?? DEFAULT;
}

export const CharacterProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selected, setSelected] = useState<Character>(() => {
    // Prefer DB value stored in user object, fall back to localStorage
    const user = authService.getUser();
    return resolveCharacter(
      user?.character ?? localStorage.getItem("character"),
    );
  });

  // Called by AuthContext on login/logout to immediately switch to the correct character
  const syncFromUser = (characterKey: CharacterKey) => {
    const character = resolveCharacter(characterKey);
    localStorage.setItem("character", characterKey);
    setSelected(character);
  };

  const setCharacter = async (key: CharacterKey) => {
    const character = resolveCharacter(key);
    // Optimistic update
    setSelected(character);
    localStorage.setItem("character", key);

    // Persist to DB if logged in
    if (authService.isAuthenticated()) {
      await authService.updateCharacter(key);
    }
  };

  return (
    <CharacterContext.Provider value={{ selected, setCharacter, syncFromUser }}>
      {children}
    </CharacterContext.Provider>
  );
};

export const useCharacter = (): CharacterContextType => {
  const ctx = useContext(CharacterContext);
  if (!ctx)
    throw new Error("useCharacter must be used inside CharacterProvider");
  return ctx;
};
