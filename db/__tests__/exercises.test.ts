import { getDb } from '@/db/client';
import {
  deleteExercise,
  getAllExercises,
  getExerciseById,
  insertExercise,
  searchExercisesByName,
  updateExercise,
} from '@/db/exercises';
import type { Exercise } from '@/types/exercise';

jest.mock('@/db/client', () => ({ getDb: jest.fn() }));

const mockGetDb = getDb as jest.Mock;

function createMockDb() {
  return {
    getAllAsync: jest.fn(),
    getFirstAsync: jest.fn(),
    runAsync: jest.fn(),
  };
}

describe('db/exercises', () => {
  let mockDb: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    mockDb = createMockDb();
    mockGetDb.mockResolvedValue(mockDb);
  });

  describe('getAllExercises', () => {
    it('selects all exercises ordered by name', async () => {
      mockDb.getAllAsync.mockResolvedValue([
        { id: '1', name: 'Bench press' },
        { id: '2', name: 'Squat' },
      ]);

      const result = await getAllExercises();

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        'SELECT id, name FROM exercises ORDER BY name COLLATE NOCASE ASC;',
      );
      expect(result).toEqual([
        { id: '1', name: 'Bench press' },
        { id: '2', name: 'Squat' },
      ]);
    });
  });

  describe('getExerciseById', () => {
    it('returns the mapped exercise when found', async () => {
      mockDb.getFirstAsync.mockResolvedValue({ id: '1', name: 'Bench press' });

      const result = await getExerciseById('1');

      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        'SELECT id, name FROM exercises WHERE id = ?;',
        '1',
      );
      expect(result).toEqual({ id: '1', name: 'Bench press' });
    });

    it('returns null when not found', async () => {
      mockDb.getFirstAsync.mockResolvedValue(null);

      const result = await getExerciseById('missing');

      expect(result).toBeNull();
    });
  });

  describe('searchExercisesByName', () => {
    it('searches with a wildcarded LIKE pattern, ordered by name', async () => {
      mockDb.getAllAsync.mockResolvedValue([{ id: '1', name: 'Bench press' }]);

      const result = await searchExercisesByName('bench');

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        'SELECT id, name FROM exercises WHERE name LIKE ? ORDER BY name COLLATE NOCASE ASC;',
        '%bench%',
      );
      expect(result).toEqual([{ id: '1', name: 'Bench press' }]);
    });
  });

  describe('insertExercise', () => {
    it('inserts the exercise', async () => {
      const exercise: Exercise = { id: '1', name: 'Bench press' };

      await insertExercise(exercise);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        'INSERT INTO exercises (id, name) VALUES (?, ?);',
        '1',
        'Bench press',
      );
    });
  });

  describe('updateExercise', () => {
    it('updates the name when provided', async () => {
      await updateExercise('1', { name: 'Incline bench press' });

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        'UPDATE exercises SET name = ? WHERE id = ?;',
        'Incline bench press',
        '1',
      );
    });

    it('does nothing when the patch has no name', async () => {
      await updateExercise('1', {});

      expect(mockDb.runAsync).not.toHaveBeenCalled();
    });
  });

  describe('deleteExercise', () => {
    it('deletes an exercise by id', async () => {
      await deleteExercise('1');

      expect(mockDb.runAsync).toHaveBeenCalledWith('DELETE FROM exercises WHERE id = ?;', '1');
    });
  });
});
