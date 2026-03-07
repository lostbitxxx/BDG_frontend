# Affinity – Frontend usage

After `POST /api/audio/analyze`, the response can include affinity fields. The frontend uses them as follows.

## Analyze response fields

| Field | Meaning |
|-------|--------|
| `affinityXpAwarded` | XP earned this time (5–50 by score). Show as the “reward” line, e.g. “+25 XP”. |
| `affinityLevel` | Current level (1–5). Use for level badge and relationship label. |
| `affinityXp` | Total XP. Synced to context for persistence. |
| `affinityXpCurrentLevel` | XP progress within current level (optional). Used for progress bar. |
| `affinityXpNeededForLevel` | XP needed to complete current level (optional). Used for progress bar. |

## Score → XP (backend)

The backend maps exercise score to `affinityXpAwarded` (e.g. 5–50). The exact score→XP table is defined in the backend; the frontend only displays `affinityXpAwarded` as “+N XP”.

## Frontend behavior

1. **Mock Test result**
   - Show **“+{affinityXpAwarded} XP”** when `affinityXpAwarded` is present (not “+1” from level).
   - After a successful analyze, if `affinityLevel` and `affinityXp` are present, call `setAffinityFromBackend(character, { affinityXp, affinityLevel, affinityXpCurrentLevel, affinityXpNeededForLevel })` so the rest of the app uses backend affinity.

2. **Level badge / progress**
   - Use `affinityLevel` (1–5) for the level badge and relationship label (Stranger, Friend, Close friend, Best friend, Soulmate).
   - Use `affinityXpCurrentLevel` / `affinityXpNeededForLevel` for the “progress to next level” bar when provided.

3. **Context**
   - `CharacterContext` keeps only `backendAffinityByCharacter` (persisted to `localStorage` under `backendAffinityByCharacter`). When present for the current character, `affinityLevelInfo` is derived from backend data; otherwise the **default** is Level 1, Stranger, 0 XP, 100 XP to next level. There is no legacy affinity system.

Same analyze call and auth; the UI and context use only this system.
