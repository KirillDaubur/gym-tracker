import * as SQLite from 'expo-sqlite';
import { migrations } from './migrations';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) dbPromise = _initDb();
  return dbPromise;
}

async function _initDb(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync('gymtracker.db');
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await _runMigrations(db);
  return db;
}

async function _runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS migrations (
      version    INTEGER PRIMARY KEY NOT NULL,
      applied_at TEXT    NOT NULL
    );
  `);

  const applied = await db.getAllAsync<{ version: number }>(
    'SELECT version FROM migrations ORDER BY version ASC;',
  );
  const appliedSet = new Set(applied.map((r) => r.version));

  const pending = migrations
    .filter((m) => !appliedSet.has(m.version))
    .sort((a, b) => a.version - b.version);

  for (const migration of pending) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(migration.sql);
      await db.runAsync(
        'INSERT INTO migrations (version, applied_at) VALUES (?, ?);',
        migration.version,
        new Date().toISOString(),
      );
    });
  }
}
