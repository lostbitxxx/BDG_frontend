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

export const AFFINITY_XP_PER_LEVEL = 20;

export interface AffinityLevelInfo {
  level: number;
  label: string;
  xpInLevel: number;
  xpNeededForNextLevel: number;
  xpPerLevel: number;
}

export function getAffinityLabel(level: number): string {
  if (level <= 1) return 'Stranger';
  if (level === 2) return 'Friend';
  if (level === 3) return 'Close friend';
  if (level === 4) return 'Best friend';
  return 'Soulmate';
}

/** From POST /api/audio/analyze response (backend is source of truth for affinity). */
export interface AffinityFromBackend {
  affinityXp: number;
  affinityLevel: number;
  affinityXpCurrentLevel?: number;
  affinityXpNeededForLevel?: number;
}

/** Default when no backend affinity yet: Level 1, 0 XP, 20 to next. */
const DEFAULT_AFFINITY_LEVEL_INFO: AffinityLevelInfo = {
  level: 1,
  label: getAffinityLabel(1),
  xpInLevel: 0,
  xpPerLevel: 20,
  xpNeededForNextLevel: 20,
};

interface CharacterContextType {
  character: CharacterKey;
  selected: Character;
  setCharacter: (key: CharacterKey) => void;
  syncFromUser: (characterKey: CharacterKey) => void;
  affinityLevelInfo: AffinityLevelInfo;
  setAffinityFromBackend: (key: CharacterKey, data: AffinityFromBackend) => void;
}

const CharacterContext = createContext<CharacterContextType>({
  character: 'bunny',
  selected: CHARACTERS[0],
  setCharacter: () => {},
  syncFromUser: () => {},
  affinityLevelInfo: DEFAULT_AFFINITY_LEVEL_INFO,
  setAffinityFromBackend: () => {},
});

export function CharacterProvider({ children }: { children: ReactNode }) {
  const [character, setCharacterState] = useState<CharacterKey>('bunny');
  const [backendAffinityByCharacter, setBackendAffinityByCharacter] = useState<
    Partial<Record<CharacterKey, AffinityFromBackend>>
  >(() => {
    try {
      const stored = localStorage.getItem('backendAffinityByCharacter');
      if (!stored) return {};
      const parsed = JSON.parse(stored) as Partial<Record<CharacterKey, AffinityFromBackend>>;
      return parsed ?? {};
    } catch {
      return {};
    }
  });

  const selected = CHARACTERS.find(c => c.key === character) || CHARACTERS[0];
  const backendAffinity = backendAffinityByCharacter[character];
  const affinityLevelInfo: AffinityLevelInfo = backendAffinity
    ? {
        level: backendAffinity.affinityLevel,
        label: getAffinityLabel(backendAffinity.affinityLevel),
        xpInLevel: backendAffinity.affinityXpCurrentLevel ?? 0,
        xpPerLevel: backendAffinity.affinityXpNeededForLevel ?? 20,
        xpNeededForNextLevel: Math.max(
          0,
          (backendAffinity.affinityXpNeededForLevel ?? 20) -
            (backendAffinity.affinityXpCurrentLevel ?? 0)
        ),
      }
    : DEFAULT_AFFINITY_LEVEL_INFO;

  const setCharacter = (key: CharacterKey) => {
    setCharacterState(key);
  };

  const syncFromUser = (characterKey: CharacterKey) => {
    setCharacterState(characterKey);
  };

  const setAffinityFromBackend = (key: CharacterKey, data: AffinityFromBackend) => {
    setBackendAffinityByCharacter(prev => ({ ...prev, [key]: data }));
  };

  useEffect(() => {
    localStorage.setItem('backendAffinityByCharacter', JSON.stringify(backendAffinityByCharacter));
  }, [backendAffinityByCharacter]);

  useEffect(() => {
    localStorage.removeItem('affinityByCharacter');
  }, []);

  return (
    <CharacterContext.Provider
      value={{
        character,
        selected,
        setCharacter,
        syncFromUser,
        affinityLevelInfo,
        setAffinityFromBackend,
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
