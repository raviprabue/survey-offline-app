import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

// Open DB (Singleton)
export async function getDB() {
  if (!db) {
    db = await SQLite.openDatabaseAsync("survey.db");

    // ✅ ADD THESE LINES (IMPORTANT)
    await db.execAsync("PRAGMA journal_mode = WAL;");
    await db.execAsync("PRAGMA synchronous = NORMAL;");
  }
  return db;
}


// Initialize Tables (Run once on app start)
export async function initDB() {

  const database = await getDB();
await database.withTransactionAsync(async () => {

  await database.execAsync(`

    /* ===== MASTER TABLES ===== */

    CREATE TABLE IF NOT EXISTS surveyors (
      surveyor_id TEXT PRIMARY KEY,
      name TEXT,
      username TEXT,
      password TEXT
    );

    CREATE TABLE IF NOT EXISTS beats (
      beat_id TEXT PRIMARY KEY,
      beat_name TEXT,
      surveyor_id TEXT
    );

    CREATE TABLE IF NOT EXISTS shops (
      shop_id TEXT PRIMARY KEY,
      shop_name TEXT,
      beat_id TEXT
    );

    DROP TABLE IF EXISTS questions;

    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      section TEXT,
      question TEXT,
      type TEXT,
      options TEXT,
      show_if TEXT,
      mandatory INTEGER,
      photo_count INTEGER
    );

    /* ===== SESSION TABLE ===== */

    CREATE TABLE IF NOT EXISTS session (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      surveyor_id TEXT,
      username TEXT,
      login_time TEXT
    );

    /* ===== SURVEY DATA ===== */

    CREATE TABLE IF NOT EXISTS survey_header (
      survey_id TEXT PRIMARY KEY,
      surveyor_id TEXT,
      beat_id TEXT,
      shop_id TEXT,
      latitude REAL,
      longitude REAL,
      accuracy REAL,
      survey_date TEXT,
      synced INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS survey_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      survey_id TEXT,
      question_id TEXT,
      answer TEXT
    );

    CREATE TABLE IF NOT EXISTS survey_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      survey_id TEXT,
      question_id TEXT,
      file_path TEXT,
      synced INTEGER DEFAULT 0
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_one_survey_per_day
    ON survey_header (shop_id, survey_date);

  `);

});






  console.log("Database initialized successfully");
}
