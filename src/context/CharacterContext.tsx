import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type CharacterKey = 'bunny' | 'cat' | 'owl';

export interface Character {
  key: CharacterKey;
  name: string;
  file: string;
  emoji: string;
  description: string;
}

export const CHARACTERS: Character[] = [
  {
    key: 'bunny',
    name: 'Bunny',
    file: '/bunny.riv',
    emoji: '🐰',
    description: 'Cheerful and energetic — always ready to help!',
  },
  {
    key: 'cat',
    name: 'Cat',
    file: '/cat.riv',
    emoji: '🐱',
    description: 'Cool and clever — gives sharp, witty answers.',
  },
  {
    key: 'owl',
    name: 'Owl',
    file: '/owl.riv',
    emoji: '🦉',
    description: 'Wise and calm — thoughtful guidance every time.',
  },
];

const DEFAULT_AFFINITY: Record<CharacterKey, number> = {
  bunny: 0,
  cat: 0,
  owl: 0,
};

interface CharacterContextType {
  character: CharacterKey;
  selected: Character;
  setCharacter: (key: CharacterKey) => void;
  syncFromUser: (characterKey: CharacterKey) => void;
  affinity: number;
  affinityByCharacter: Record<CharacterKey, number>;
  incrementAffinity: (key?: CharacterKey, delta?: number) => void;
}

const CharacterContext = createContext<CharacterContextType>({
  character: 'bunny',
  selected: CHARACTERS[0],
  setCharacter: () => {},
  syncFromUser: () => {},
  affinity: 0,
  affinityByCharacter: DEFAULT_AFFINITY,
  incrementAffinity: () => {},
});

export function CharacterProvider({ children }: { children: ReactNode }) {
  const [character, setCharacterState] = useState<CharacterKey>('bunny');
  const [affinityByCharacter, setAffinityByCharacter] = useState<Record<CharacterKey, number>>(
    () => {
      const stored = localStorage.getItem('affinityByCharacter');
      if (!stored) return DEFAULT_AFFINITY;
      try {
        const parsed = JSON.parse(stored) as Partial<Record<CharacterKey, number>>;
        return { ...DEFAULT_AFFINITY, ...parsed };
      } catch {
        return DEFAULT_AFFINITY;
      }
    },
  );
  const selected = CHARACTERS.find(c => c.key === character) || CHARACTERS[0];
  const affinity = affinityByCharacter[character] ?? 0;
  
  const setCharacter = (key: CharacterKey) => {
    setCharacterState(key);
  };
  
  const syncFromUser = (characterKey: CharacterKey) => {
    setCharacterState(characterKey);
  };

  const incrementAffinity = (key: CharacterKey = character, delta = 1) => {
    setAffinityByCharacter(prev => {
      const current = prev[key] ?? 0;
      const next = Math.max(0, Math.min(100, current + delta));
      return { ...prev, [key]: next };
    });
  };

  useEffect(() => {
    localStorage.setItem('affinityByCharacter', JSON.stringify(affinityByCharacter));
  }, [affinityByCharacter]);
  
  return (
    <CharacterContext.Provider
      value={{
        character,
        selected,
        setCharacter,
        syncFromUser,
        affinity,
        affinityByCharacter,
        incrementAffinity,
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
}

export function useCharacter() {
  return useContext(CharacterContext);
}

export default CharacterContext;
