# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm start          # Start Expo dev server (opens QR code / menu)
npm run android    # Start and open on Android emulator/device
npm run ios        # Start and open on iOS simulator
npm run lint       # Run ESLint via expo lint
npm run format     # Format all source files with Prettier (auto-fix)
npm run format:check  # Check formatting without writing (good for CI)
npm test           # Run the Jest test suite
```

## Code style

Prettier is configured in `.prettierrc`. Formatting is automatic — a `PostToolUse` hook runs Prettier on every file after each edit. Never hand-format code.

## Git workflow

**Always issue `git add` and `git commit` as separate Bash calls — never chain them with `&&`.** A `PreToolUse` hook on `git commit` runs `npm run lint` and blocks the commit if there are errors. Chaining bypasses this gate.

```bash
# correct
git add path/to/file.tsx
git commit -m "message"

# wrong — bypasses the lint gate
git add path/to/file.tsx && git commit -m "message"
```

## Architecture

**Expo SDK 54**, React Native 0.81, React 19, TypeScript strict mode. New Architecture enabled (`newArchEnabled: true`). React Compiler enabled (`reactCompiler: true`). Android-first.

**Routing** — Expo Router v6 with file-based routing under `app/`. Path alias `@/` maps to the repo root.

- `app/_layout.tsx` — root Stack navigator; wraps the app in `WorkoutsProvider` (outer) and `AppNavigator` (inner). `AppNavigator` reads `isLoading` from the workouts store and shows an `ActivityIndicator` until the DB is ready, then renders the `Stack` with `ThemeProvider`.
- `app/(tabs)/_layout.tsx` — single-tab bottom navigator (Workouts). Add new tabs here.
- `app/(tabs)/index.tsx` — workout list screen: FlatList of workouts. Uses `<Tabs.Screen options={{ headerRight: … }}>` rendered inside the component to wire a `+` icon into the native header — this is the established pattern for dynamic header buttons on this screen.
- `app/workout/[id].tsx` — workout detail screen (dynamic route). Receives the workout `id` via `useLocalSearchParams`, looks it up in the workouts store, and sets the header title to the workout name via `<Stack.Screen options={{ title }}>`. Currently a placeholder view; add exercise tracking UI here.

**Data layer** — SQLite via `expo-sqlite` (bundled in Expo Go, no dev build needed).

- `db/migrations.ts` — ordered array of `{ version, sql }` migration objects. Add new tables by appending a new entry; already-applied versions are never re-run.
- `db/client.ts` — singleton `getDb()` that opens `gymtracker.db`, enables WAL mode + foreign keys, and runs pending migrations on first call.
- `db/workouts.ts` — typed DAO: `getAllWorkouts`, `insertWorkout`, `updateWorkout`, `deleteWorkout`.
- `db/exercises.ts` — typed DAO: `getAllExercises`, `getExerciseById`, `searchExercisesByName`, `insertExercise`, `updateExercise`, `deleteExercise`.

**State** — `store/workouts.tsx` exposes `WorkoutsProvider` and `useWorkouts()`. On mount it loads all rows from SQLite; `addWorkout()` does an optimistic update then persists. Context type: `{ workouts, addWorkout, isLoading, error }`.

**Theming** — `constants/theme.ts` exports `Colors` (light/dark palettes) and `Fonts`. Use `useColorScheme()` from `hooks/use-color-scheme.ts` to read the current scheme.

**Styled primitives** — `ThemedText` and `ThemedView` in `components/` automatically apply the correct color via `useThemeColor`. Prefer these over raw `Text`/`View` for dark-mode-aware colors.

**Icons** — `components/ui/icon-symbol.tsx` wraps SF Symbols on iOS and MaterialIcons on Android. Pass an SF Symbol name; the Android mapping lives in that file.

**Platform splits** — files with `.ios.tsx` / `.web.ts` suffixes are platform-specific (e.g. `icon-symbol.ios.tsx`, `use-color-scheme.web.ts`). 

## Definition of Done

A task is complete only when:

- code is formatted
- lint passes
- TypeScript passes
- relevant tests are added or updated
- all tests pass
- no unrelated files were changed
- implementation is summarized
- verification steps are provided
