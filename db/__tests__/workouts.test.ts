import { getDb } from '@/db/client';
import { deleteWorkout, getAllWorkouts, insertWorkout, updateWorkout } from '@/db/workouts';
import type { Workout } from '@/types/workout';

jest.mock('@/db/client', () => ({ getDb: jest.fn() }));

const mockGetDb = getDb as jest.Mock;

function createMockDb() {
  return {
    getAllAsync: jest.fn(),
    runAsync: jest.fn(),
  };
}

describe('db/workouts', () => {
  let mockDb: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    mockDb = createMockDb();
    mockGetDb.mockResolvedValue(mockDb);
  });

  describe('getAllWorkouts', () => {
    it('selects all workouts ordered by date and maps rows, omitting a null name', async () => {
      mockDb.getAllAsync.mockResolvedValue([
        { id: '1', date: '2024-01-01T00:00:00.000Z', name: 'Leg day' },
        { id: '2', date: '2024-01-02T00:00:00.000Z', name: null },
      ]);

      const result = await getAllWorkouts();

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        'SELECT id, date, name FROM workouts ORDER BY date ASC;',
      );
      expect(result).toEqual([
        { id: '1', date: '2024-01-01T00:00:00.000Z', name: 'Leg day' },
        { id: '2', date: '2024-01-02T00:00:00.000Z' },
      ]);
      expect(result[1]).not.toHaveProperty('name');
    });
  });

  describe('insertWorkout', () => {
    it('coalesces a missing name to null', async () => {
      const workout: Workout = { id: '1', date: '2024-01-01T00:00:00.000Z' };

      await insertWorkout(workout);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        'INSERT INTO workouts (id, date, name) VALUES (?, ?, ?);',
        '1',
        '2024-01-01T00:00:00.000Z',
        null,
      );
    });

    it('inserts the provided name', async () => {
      const workout: Workout = { id: '1', date: '2024-01-01T00:00:00.000Z', name: 'Push day' };

      await insertWorkout(workout);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        'INSERT INTO workouts (id, date, name) VALUES (?, ?, ?);',
        '1',
        '2024-01-01T00:00:00.000Z',
        'Push day',
      );
    });
  });

  describe('updateWorkout', () => {
    it('updates the name when provided', async () => {
      await updateWorkout('1', { name: 'New name' });

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        'UPDATE workouts SET name = ? WHERE id = ?;',
        'New name',
        '1',
      );
    });

    it('does nothing when the patch has no name', async () => {
      await updateWorkout('1', {});

      expect(mockDb.runAsync).not.toHaveBeenCalled();
    });
  });

  describe('deleteWorkout', () => {
    it('deletes a workout by id', async () => {
      await deleteWorkout('1');

      expect(mockDb.runAsync).toHaveBeenCalledWith('DELETE FROM workouts WHERE id = ?;', '1');
    });
  });
});
