import type { Exercise } from '@/types/exercise';

import { getDb } from './client';

type ExerciseRow = { id: string; name: string };

function rowToExercise(row: ExerciseRow): Exercise {
  return { id: row.id, name: row.name };
}

export async function getAllExercises(): Promise<Exercise[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<ExerciseRow>(
    'SELECT id, name FROM exercises ORDER BY name COLLATE NOCASE ASC;',
  );
  return rows.map(rowToExercise);
}

export async function getExerciseById(id: string): Promise<Exercise | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<ExerciseRow>(
    'SELECT id, name FROM exercises WHERE id = ?;',
    id,
  );
  return row ? rowToExercise(row) : null;
}

export async function searchExercisesByName(query: string): Promise<Exercise[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<ExerciseRow>(
    'SELECT id, name FROM exercises WHERE name LIKE ? ORDER BY name COLLATE NOCASE ASC;',
    `%${query}%`,
  );
  return rows.map(rowToExercise);
}

export async function insertExercise(exercise: Exercise): Promise<void> {
  const db = await getDb();
  await db.runAsync('INSERT INTO exercises (id, name) VALUES (?, ?);', exercise.id, exercise.name);
}

export async function updateExercise(
  id: string,
  patch: Partial<Pick<Exercise, 'name'>>,
): Promise<void> {
  const db = await getDb();
  if (patch.name !== undefined) {
    await db.runAsync('UPDATE exercises SET name = ? WHERE id = ?;', patch.name, id);
  }
}

export async function deleteExercise(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM exercises WHERE id = ?;', id);
}
