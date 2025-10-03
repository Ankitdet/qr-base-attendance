import { pool } from "./db";

async function seed() {
  try {
    // Check if participants table is empty
  /*   await pool.query("DROP TABLE IF EXISTS attendance");
    await pool.query("DROP TABLE IF EXISTS event_participants");
    await pool.query("DROP TABLE IF EXISTS events");
    await pool.query("DROP TABLE IF EXISTS participants");
    console.log("🟢 Existing participant data deleted."); */

    // Insert participants
    await pool.query(`
      INSERT INTO participants (flatno, member_name, mobile_no) VALUES
      ('B303', 'Ankit Detroja', '21212'),
      ('B303', 'Prabhubhuai Detroja', '121'),
      ('B303', 'Chetnaben Detroja', '121'),
      ('B303', 'Krutika Detroja', '111111222'),
      ('B303', 'Foram Detroja', '11111231232322'),
      ('B302', 'Praveen Kamat', '1121212'),
      ('B301', 'Praveen Kamat', '11111222'),
      ('B304', 'Rahul Kanti', '11111222');
    `);

    console.log(
      "✅ Mock data inserted for participants, events, event_participants, and attendance"
    );
  } catch (err) {
    console.error("❌ Seed failed:", err);
  } finally {
    pool.end();
  }
}

seed();
