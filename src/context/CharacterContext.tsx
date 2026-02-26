import React, { createContext, useContext, useState, ReactNode } from 'react';

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

interface CharacterContextType {
  character: CharacterKey;
  selected: Character;
  setCharacter: (key: CharacterKey) => void;
  syncFromUser: (characterKey: CharacterKey) => void;
}

const CharacterContext = createContext<CharacterContextType>({
  character: 'bunny',
  selected: CHARACTERS[0],
  setCharacter: () => {},
  syncFromUser: () => {},
});

export function CharacterProvider({ children }: { children: ReactNode }) {
  const [character, setCharacterState] = useState<CharacterKey>('bunny');
  const selected = CHARACTERS.find(c => c.key === character) || CHARACTERS[0];
  
  const setCharacter = (key: CharacterKey) => {
    setCharacterState(key);
  };
  
  const syncFromUser = (characterKey: CharacterKey) => {
    setCharacterState(characterKey);
  };
  
  return (
    <CharacterContext.Provider value={{ character, selected, setCharacter, syncFromUser }}>
      {children}
    </CharacterContext.Provider>
  );
}

export function useCharacter() {
  return useContext(CharacterContext);
}

export default CharacterContext;
