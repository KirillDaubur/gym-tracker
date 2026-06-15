import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Workout } from '@/types/workout';
import { getAllWorkouts, insertWorkout, deleteWorkout } from '@/db/workouts';

type WorkoutsContextType = {
  workouts: Workout[];
  addWorkout: (name: string) => Promise<Workout>;
  removeWorkout: (id: string) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
};

const WorkoutsContext = createContext<WorkoutsContextType | null>(null);

export function WorkoutsProvider({ children }: { children: React.ReactNode }) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAllWorkouts()
      .then((rows) => {
        if (!cancelled) {
          setWorkouts(rows);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function addWorkout(name: string): Promise<Workout> {
    const workout: Workout = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      name,
    };
    setWorkouts((prev) => [...prev, workout]);
    try {
      await insertWorkout(workout);
    } catch (err) {
      setWorkouts((prev) => prev.filter((w) => w.id !== workout.id));
      throw err;
    }
    return workout;
  }

  async function removeWorkout(id: string): Promise<void> {
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
    try {
      await deleteWorkout(id);
    } catch (err) {
      // Rollback: reload from DB
      getAllWorkouts()
        .then(setWorkouts)
        .catch(() => {});
      throw err;
    }
  }

  return (
    <WorkoutsContext.Provider value={{ workouts, addWorkout, removeWorkout, isLoading, error }}>
      {children}
    </WorkoutsContext.Provider>
  );
}

export function useWorkouts() {
  const ctx = useContext(WorkoutsContext);
  if (!ctx) throw new Error('useWorkouts must be used within WorkoutsProvider');
  return ctx;
}
