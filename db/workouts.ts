import { getDb } from './client';
import type { Workout } from '@/types/workout';

type WorkoutRow = { id: string; date: string; name: string | null };

function rowToWorkout(row: WorkoutRow): Workout {
  return { id: row.id, date: row.date, ...(row.name != null ? { name: row.name } : {}) };
}

export async function getAllWorkouts(): Promise<Workout[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<WorkoutRow>(
    'SELECT id, date, name FROM workouts ORDER BY date ASC;',
  );
  return rows.map(rowToWorkout);
}

export async function insertWorkout(workout: Workout): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO workouts (id, date, name) VALUES (?, ?, ?);',
    workout.id,
    workout.date,
    workout.name ?? null,
  );
}

export async function updateWorkout(
  id: string,
  patch: Partial<Pick<Workout, 'name'>>,
): Promise<void> {
  const db = await getDb();
  if (patch.name !== undefined) {
    await db.runAsync('UPDATE workouts SET name = ? WHERE id = ?;', patch.name, id);
  }
}

export async function deleteWorkout(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM workouts WHERE id = ?;', id);
}
