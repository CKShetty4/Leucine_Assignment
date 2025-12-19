import path from 'path';
import sqlite3 from 'sqlite3';

const databaseFilePath = path.resolve(process.cwd(), 'equipment.db');

export const db = new sqlite3.Database(databaseFilePath);

const createTableSql = `
	CREATE TABLE IF NOT EXISTS equipment (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		type TEXT NOT NULL,
		status TEXT NOT NULL,
		lastCleanedDate TEXT NOT NULL
	)
`;

db.serialize(() => {
    db.exec(createTableSql);
});

export function dbAll<T>(sql: string, params: readonly unknown[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
        db.all(sql, params as any[], (error, rows) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(rows as T[]);
        });
    });
}

export function dbGet<T>(sql: string, params: readonly unknown[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
        db.get(sql, params as any[], (error, row) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(row as T | undefined);
        });
    });
}

export function dbRun(
    sql: string,
    params: readonly unknown[] = []
): Promise<{ lastID: number; changes: number }> {
    return new Promise((resolve, reject) => {
        db.run(sql, params as any[], function (this: sqlite3.RunResult, error) {
            if (error) {
                reject(error);
                return;
            }
            resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
}
