import React, { createContext, useContext, useEffect, useState } from 'react';

import { getAllExercises } from '@/db/exercises';
import type { Exercise } from '@/types/exercise';

type ExercisesContextType = {
  exercises: Exercise[];
  isLoading: boolean;
  error: Error | null;
};

const ExercisesContext = createContext<ExercisesContextType | null>(null);

export function ExercisesProvider({ children }: { children: React.ReactNode }) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAllExercises()
      .then((rows) => {
        if (!cancelled) {
          setExercises(rows);
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

  return (
    <ExercisesContext.Provider value={{ exercises, isLoading, error }}>
      {children}
    </ExercisesContext.Provider>
  );
}

export function useExercises() {
  const ctx = useContext(ExercisesContext);
  if (!ctx) throw new Error('useExercises must be used within ExercisesProvider');
  return ctx;
}
