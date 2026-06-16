import type { getDb as GetDb } from '@/db/client';

function createMockDb() {
  return {
    execAsync: jest.fn().mockResolvedValue(undefined),
    runAsync: jest.fn().mockResolvedValue(undefined),
    getAllAsync: jest.fn().mockResolvedValue([]),
    withTransactionAsync: jest.fn((callback: () => Promise<void>) => callback()),
  };
}

describe('db/client', () => {
  it('opens the database once and caches the promise on subsequent calls', async () => {
    await jest.isolateModulesAsync(async () => {
      const mockDb = createMockDb();
      const openDatabaseAsync = jest.fn().mockResolvedValue(mockDb);
      jest.doMock('expo-sqlite', () => ({ openDatabaseAsync }));
      jest.doMock('@/db/migrations', () => ({ migrations: [] }));

      const { getDb } = require('@/db/client') as { getDb: typeof GetDb };
      await getDb();
      await getDb();

      expect(openDatabaseAsync).toHaveBeenCalledTimes(1);
    });
  });

  it('enables WAL mode and foreign keys on init', async () => {
    await jest.isolateModulesAsync(async () => {
      const mockDb = createMockDb();
      jest.doMock('expo-sqlite', () => ({
        openDatabaseAsync: jest.fn().mockResolvedValue(mockDb),
      }));
      jest.doMock('@/db/migrations', () => ({ migrations: [] }));

      const { getDb } = require('@/db/client') as { getDb: typeof GetDb };
      await getDb();

      expect(mockDb.execAsync).toHaveBeenCalledWith('PRAGMA journal_mode = WAL;');
      expect(mockDb.execAsync).toHaveBeenCalledWith('PRAGMA foreign_keys = ON;');
    });
  });

  it('runs only migrations that are not yet recorded as applied, in version order', async () => {
    await jest.isolateModulesAsync(async () => {
      const mockDb = createMockDb();
      mockDb.getAllAsync.mockResolvedValue([{ version: 1 }]);
      jest.doMock('expo-sqlite', () => ({
        openDatabaseAsync: jest.fn().mockResolvedValue(mockDb),
      }));
      jest.doMock('@/db/migrations', () => ({
        migrations: [
          { version: 1, sql: 'CREATE TABLE workouts (...);' },
          { version: 2, sql: 'CREATE TABLE sets (...);' },
        ],
      }));

      const { getDb } = require('@/db/client') as { getDb: typeof GetDb };
      await getDb();

      expect(mockDb.execAsync).not.toHaveBeenCalledWith('CREATE TABLE workouts (...);');
      expect(mockDb.execAsync).toHaveBeenCalledWith('CREATE TABLE sets (...);');
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        'INSERT INTO migrations (version, applied_at) VALUES (?, ?);',
        2,
        expect.any(String),
      );
    });
  });
});
