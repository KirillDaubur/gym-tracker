export const migrations: { version: number; sql: string }[] = [
  {
    version: 1,
    sql: `
      CREATE TABLE IF NOT EXISTS workouts (
        id    TEXT PRIMARY KEY NOT NULL,
        date  TEXT NOT NULL,
        name  TEXT
      );
    `,
  },
];
