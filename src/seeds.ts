import { pool } from "./db";

async function seed() {
  try {
    // Check if participants table is empty
   /*  await pool.query("DELETE FROM attendance");
    await pool.query("DELETE FROM event_participants");
    await pool.query("DELETE FROM events");
    await pool.query("DELETE FROM participants");
    console.log("🟢 Existing participant data deleted."); */

    // Insert participants
    await pool.query(`
      INSERT INTO participants (flatno, members, owner_name, mobile_no) VALUES
      ('B303', 4, 'Ankit Detroja', '11111222'),
      ('B302', 5, 'Praveen Kamat', '11111222'),
      ('B301', 5, 'Praveen Kamat', '11111222'),
      ('B304', 6, 'Rahul Kanti', '11111222');
    `);

    // Fetch inserted participants and events
    const participantsRes = await pool.query(
      "SELECT id, flatno FROM participants"
    );
    const eventsRes = await pool.query("SELECT id, event_name FROM events");

    const participants = participantsRes.rows;
    const events = eventsRes.rows;

    // Insert event_participants (link each event to all participants for demo)
    for (const ev of events) {
      for (const p of participants) {
        await pool.query(
          `INSERT INTO event_participants (event_id, participant_id) VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [ev.id, p.id]
        );
      }
    }

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
