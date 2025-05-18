import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('./wallet.db');

db.serialize(() => {
  // Enable foreign key constraints
  db.run('PRAGMA foreign_keys = ON;');

  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    balance INTEGER DEFAULT 0
  )`);

  // Transactions table with foreign key constraint
  db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT,
    amount INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  // Index on user_id to speed up queries
  db.run(`CREATE INDEX IF NOT EXISTS idx_user_id ON transactions(user_id)`);
});

export default db;
