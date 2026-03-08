import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { authService } from '../services/api';

export type CharacterKey = 'red-birdie' | 'foggy-birdie' | 'final-birdie';

/** Optional Rive state machine config: run these state machines and set an input so the character starts in idle (not e.g. sleeping). */
export interface RiveConfig {
  /** Names of state machine layer(s) to run (e.g. 2 layers = 2 names). */
  stateMachines: string[];
  /** Optional: set this input on the first state machine to start in idle. */
  idleInput?: { name: string; value: number | boolean };
}

export interface Character {
  key: CharacterKey;
  name: string;
  file: string;
  emoji: string;
  description: string;
  /** Optional: state machine and initial input for this character's .riv file. */
  riveConfig?: RiveConfig;
  /** Use transparent background for the Rive container (e.g. .riv with transparent art). */
  transparentBackground?: boolean;
}

export const CHARACTERS: Character[] = [
  {
    key: 'red-birdie',
    name: 'Red Birdie',
    file: '/Red Birdie.riv',
    emoji: '🐦',
    description: 'Cheerful and energetic — always ready to help!',
    riveConfig: {
      stateMachines: ['State Machine 1'],
      idleInput: { name: 'State', value: 0 },
    },
    transparentBackground: true,
  },
  {
    key: 'foggy-birdie',
    name: 'Foggy Birdie',
    file: '/Foggy Birdie.riv',
    emoji: '🐦',
    description: 'Cool and clever — gives sharp, witty answers.',
    riveConfig: {
      stateMachines: ['State Machine 1'],
      idleInput: { name: 'State', value: 0 },
    },
    transparentBackground: true,
  },
  {
    key: 'final-birdie',
    name: 'Final Birdie',
    file: '/Final Birdie.riv',
    emoji: '🐦',
    description: 'Wise and calm — thoughtful guidance every time.',
    riveConfig: {
      stateMachines: ['State Machine 1'],
      idleInput: { name: 'State', value: 0 },
    },
    transparentBackground: true,
  },
];

/** Total XP needed to reach each level (backend affinity config). */
export const AFFINITY_LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000] as const;
export const AFFINITY_MAX_LEVEL = 5;

export interface AffinityLevelInfo {
  level: number;
  label: string;
  totalXp: number;
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

/** Derive level and progress from total XP using backend thresholds. */
export function getAffinityProgressFromTotalXp(totalXp: number): {
  level: number;
  xpInLevel: number;
  xpPerLevel: number;
  xpNeededForNextLevel: number;
} {
  const t = Math.max(0, Math.floor(totalXp));
  const thresholds = AFFINITY_LEVEL_THRESHOLDS;
  let level = 1;
  for (let i = 1; i < thresholds.length; i++) {
    if (t >= thresholds[i]) level = i + 1;
  }
  level = Math.min(level, AFFINITY_MAX_LEVEL);
  const currentThreshold = thresholds[level - 1];
  const nextThreshold = level < AFFINITY_MAX_LEVEL ? thresholds[level] : thresholds[thresholds.length - 1];
  const xpInLevel = t - currentThreshold;
  const xpPerLevel = nextThreshold - currentThreshold;
  const xpNeededForNextLevel = level >= AFFINITY_MAX_LEVEL ? 0 : nextThreshold - t;
  return { level, xpInLevel, xpPerLevel, xpNeededForNextLevel };
}

/** From POST /api/audio/analyze response (backend is source of truth for affinity). */
export interface AffinityFromBackend {
  affinityXp: number;
  affinityLevel: number;
  affinityXpCurrentLevel?: number;
  affinityXpNeededForLevel?: number;
}

/** Default when no backend affinity yet: Level 1, 0 total XP, 100 to next level. */
const DEFAULT_AFFINITY_LEVEL_INFO: AffinityLevelInfo = {
  level: 1,
  label: getAffinityLabel(1),
  totalXp: 0,
  xpInLevel: 0,
  xpPerLevel: 100,
  xpNeededForNextLevel: 100,
};

interface CharacterContextType {
  character: CharacterKey;
  selected: Character;
  setCharacter: (key: CharacterKey) => void;
  syncFromUser: (characterKey: CharacterKey) => void;
  affinityLevelInfo: AffinityLevelInfo;
  setAffinityFromBackend: (key: CharacterKey, data: AffinityFromBackend) => void;
  /** Set affinity for the whole user (e.g. from login/verify response). */
  setAffinityFromAuth: (data: AffinityFromBackend) => void;
}

const CharacterContext = createContext<CharacterContextType>({
  character: 'red-birdie',
  selected: CHARACTERS[0],
  setCharacter: () => {},
  syncFromUser: () => {},
  affinityLevelInfo: DEFAULT_AFFINITY_LEVEL_INFO,
  setAffinityFromBackend: () => {},
  setAffinityFromAuth: () => {},
});

const AFFINITY_STORAGE_KEY_PREFIX = 'backendAffinityByCharacter';
/** Don't overwrite affinity with getAffinity/verify for this long after a test result (ms). */
const AFFINITY_TEST_GRACE_MS = 60000;

function getAffinityStorageKey(userId: string | undefined): string {
  return userId ? `${AFFINITY_STORAGE_KEY_PREFIX}_${userId}` : `${AFFINITY_STORAGE_KEY_PREFIX}_guest`;
}

function loadAffinityFromStorage(storageKey: string): Partial<Record<CharacterKey, AffinityFromBackend>> {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return {};
    const parsed = JSON.parse(stored) as Partial<Record<CharacterKey, AffinityFromBackend>>;
    return parsed ?? {};
  } catch {
    return {};
  }
}

function loadAffinityForUser(storageKey: string): Partial<Record<CharacterKey, AffinityFromBackend>> {
  let data = loadAffinityFromStorage(storageKey);
  if (Object.keys(data).length === 0 && storageKey !== `${AFFINITY_STORAGE_KEY_PREFIX}_guest`) {
    const legacy = loadAffinityFromStorage(AFFINITY_STORAGE_KEY_PREFIX);
    if (Object.keys(legacy).length > 0) data = legacy;
  }
  return data;
}

export function CharacterProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?._id;
  const storageKey = getAffinityStorageKey(userId);

  const [character, setCharacterState] = useState<CharacterKey>('red-birdie');
  const [backendAffinityByCharacter, setBackendAffinityByCharacter] = useState<
    Partial<Record<CharacterKey, AffinityFromBackend>>
  >(() => (
    userId ? loadAffinityFromStorage(storageKey) : loadAffinityForUser(storageKey)
  ));

  const prevStorageKeyRef = useRef<string | null>(null);
  const lastSetFromTestRef = useRef<number>(0);

  // When user changes: logout -> clear affinity; login -> clear previous user's data first, then fetch from API
  useEffect(() => {
    if (prevStorageKeyRef.current === storageKey) return;
    prevStorageKeyRef.current = storageKey;
    lastSetFromTestRef.current = 0;

    if (!userId) {
      setBackendAffinityByCharacter({});
      return;
    }

    // Immediately show this user's cached data (or empty) so we never persist the previous user's XP to this user's key
    setBackendAffinityByCharacter(loadAffinityFromStorage(storageKey));

    let cancelled = false;
    const applyAffinity = (affinityXp?: number, affinityLevel?: number) => {
      if (affinityXp !== undefined || affinityLevel !== undefined) {
        const totalXp = Math.max(0, Number(affinityXp ?? 0));
        const level = Math.max(1, Math.min(5, Number(affinityLevel ?? 1)));
        const data: AffinityFromBackend = { affinityXp: totalXp, affinityLevel: level };
        setBackendAffinityByCharacter({ 'red-birdie': data, 'foggy-birdie': data, 'final-birdie': data });
      } else {
        setBackendAffinityByCharacter(loadAffinityFromStorage(storageKey));
      }
    };
    authService.getAffinity()
      .then((res) => {
        if (cancelled) return;
        if (Date.now() - lastSetFromTestRef.current < AFFINITY_TEST_GRACE_MS) return;
        if (res.success && (res.affinityXp !== undefined || res.affinityLevel !== undefined)) {
          applyAffinity(res.affinityXp, res.affinityLevel);
          return;
        }
        return authService.verify();
      })
      .then((res) => {
        if (res == null || cancelled) return;
        if (Date.now() - lastSetFromTestRef.current < AFFINITY_TEST_GRACE_MS) return;
        if (res.affinityXp !== undefined || res.affinityLevel !== undefined) {
          applyAffinity(res.affinityXp, res.affinityLevel);
        } else {
          setBackendAffinityByCharacter(loadAffinityFromStorage(storageKey));
        }
      })
      .catch(() => {
        if (!cancelled && Date.now() - lastSetFromTestRef.current >= AFFINITY_TEST_GRACE_MS) {
          setBackendAffinityByCharacter(loadAffinityFromStorage(storageKey));
        }
      });
    return () => { cancelled = true; };
  }, [storageKey, userId]);

  const selected = CHARACTERS.find(c => c.key === character) || CHARACTERS[0];
  const backendAffinity = backendAffinityByCharacter[character];
  // Derive level and progress from total XP using backend thresholds (0, 100, 300, 600, 1000)
  const affinityLevelInfo: AffinityLevelInfo = backendAffinity
    ? (() => {
        const totalXp = Math.max(0, Number(backendAffinity.affinityXp ?? 0));
        const progress = getAffinityProgressFromTotalXp(totalXp);
        return {
          level: progress.level,
          label: getAffinityLabel(progress.level),
          totalXp,
          xpInLevel: progress.xpInLevel,
          xpPerLevel: progress.xpPerLevel,
          xpNeededForNextLevel: progress.xpNeededForNextLevel,
        };
      })()
    : DEFAULT_AFFINITY_LEVEL_INFO;

  const setCharacter = (key: CharacterKey) => {
    setCharacterState(key);
  };

  const syncFromUser = (characterKey: CharacterKey) => {
    setCharacterState(characterKey);
  };

  const setAffinityFromBackend = (key: CharacterKey, data: AffinityFromBackend) => {
    lastSetFromTestRef.current = Date.now(); // so the fetch effect won't overwrite this with stale API data
    setBackendAffinityByCharacter(prev => ({ ...prev, [key]: data }));
  };

  const setAffinityFromAuth = (data: AffinityFromBackend) => {
    setBackendAffinityByCharacter({ 'red-birdie': data, 'foggy-birdie': data, 'final-birdie': data });
  };

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(backendAffinityByCharacter));
  }, [storageKey, backendAffinityByCharacter]);

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
        setAffinityFromAuth,
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
