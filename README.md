# Gym Tracker

A personal gym workout tracking app built with Expo and React Native. Stores data locally on-device via SQLite — no account or backend required.

## Features

- Create and delete named workouts with timestamps
- Persistent local storage (SQLite, survives app restarts)
- Light/dark mode support
- Android-first; runs in Expo Go without a dev build

## Stack

| Layer | Tech |
|---|---|
| Framework | Expo SDK 54 / React Native 0.81 |
| Language | TypeScript (strict) |
| Routing | Expo Router v6 (file-based) |
| Database | expo-sqlite (WAL mode, migration-based schema) |
| State | React Context + custom hook |
| Architecture | New Architecture + React Compiler enabled |

## Getting started

```bash
npm install
npm start        # opens Expo dev server — scan QR with Expo Go
npm run android  # open on Android emulator/device
npm run ios      # open on iOS simulator
npm run lint     # ESLint via expo lint
```

## Project layout

```
app/
  _layout.tsx          # root Stack + WorkoutsProvider
  (tabs)/
    _layout.tsx        # bottom tab navigator
    index.tsx          # workout list screen
db/
  client.ts            # singleton DB connection, runs migrations on open
  migrations.ts        # ordered migration array — append to add tables
  workouts.ts          # typed DAO (getAllWorkouts, insertWorkout, …)
store/
  workouts.tsx         # WorkoutsProvider + useWorkouts() hook
types/
  workout.ts           # Workout type
components/
  themed-text.tsx      # dark-mode-aware Text wrapper
  themed-view.tsx      # dark-mode-aware View wrapper
  ui/icon-symbol.tsx   # SF Symbols (iOS) / MaterialIcons (Android)
constants/
  theme.ts             # Colors (light/dark) and Fonts
```

## Data model

```ts
type Workout = {
  id: string;    // UUID
  date: string;  // ISO 8601
  name?: string;
};
```

Schema migrations live in `db/migrations.ts` as an ordered array of `{ version, sql }` objects. Already-applied versions are skipped on startup.
