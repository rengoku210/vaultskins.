import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '../../data');
const dbPath = path.resolve(dataDir, 'vaultskins.db');

let db;

export const getDb = async () => {
  if (db) return db;

  await fs.mkdir(dataDir, { recursive: true });

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      role TEXT NOT NULL DEFAULT 'user',
      terms_accepted INTEGER NOT NULL DEFAULT 0,
      phone_verified INTEGER NOT NULL DEFAULT 0,
      email_verified INTEGER NOT NULL DEFAULT 0,
      otp_code TEXT,
      otp_expires_at INTEGER,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      rank TEXT,
      skins_json TEXT,
      riot_id TEXT NOT NULL,
      riot_password TEXT NOT NULL,
      contact_email TEXT NOT NULL,
      contact_social TEXT,
      rent_hour REAL,
      rent_day REAL,
      buy_price REAL,
      listing_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      active INTEGER NOT NULL DEFAULT 1,
      preview_image TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      listing_id INTEGER NOT NULL,
      buyer_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      access_expires_at INTEGER,
      mock_txn_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (listing_id) REFERENCES listings(id),
      FOREIGN KEY (buyer_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      read INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  return db;
};

export const getDbPath = () => dbPath;
