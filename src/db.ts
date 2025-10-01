import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

// 🟢 Bootstrap schema
async function initDB() {
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE IF NOT EXISTS participants (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      flatno VARCHAR(10) NOT NULL UNIQUE,
      members INT NOT NULL CHECK (members > 0),
      owner_name VARCHAR(100) NOT NULL,
      mobile_no VARCHAR(15) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS events (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      event_name VARCHAR(100) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      day INT NOT NULL,
      notes TEXT,
      CHECK (end_date >= start_date)
    );

    CREATE TABLE IF NOT EXISTS event_participants (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
      UNIQUE (event_id, participant_id)
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
      is_present BOOLEAN NOT NULL DEFAULT false,
      scan_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      no_of_scanned INT NOT NULL DEFAULT 1
    );
  `);

  console.log("✅ Database schema ready");
}

export { initDB, pool };

