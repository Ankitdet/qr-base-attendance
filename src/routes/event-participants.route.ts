import { Router } from "express";
import { pool } from "../db";

const router = Router();

// get event participants by event id
router.get("/:event_id", async (req, res) => {
  try {
    const { event_id } = req.params;

    const result = await pool.query(
      "SELECT participant_id FROM event_participants WHERE event_id = $1",
      [event_id]
    );

    res.json({ event_id, participants: result.rows.map((row) => row.participant_id) });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// delete participants by event id and participant id
router.delete("/:event_id/:participant_id", async (req, res) => {
  try {
    const { event_id, participant_id } = req.params;

    // Delete participant for the event
    await pool.query(
      "DELETE FROM event_participants WHERE event_id = $1 AND participant_id = $2",
      [event_id, participant_id]
    );

    res.json({ msg: "Participant deleted for the event" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Get all events
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT event_id, array_agg(participant_id) AS participants
      FROM event_participants
      GROUP BY event_id
      ORDER BY event_id DESC
      `
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

router.post("/", async (req, res) => {
  try {
    const { event_id, participant_ids } = req.body;

    if (!event_id || !participant_ids || !Array.isArray(participant_ids)) {
      return res
        .status(400)
        .json({ msg: "Missing or invalid required fields." });
    }

    // check if event exists
    const eventCheck = await pool.query("SELECT id FROM events WHERE id = $1", [
      event_id,
    ]);

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ msg: "Event not found" });
    }

    if (participant_ids.length === 0) {
      return res.status(400).json({ msg: "Participant IDs array is empty." });
    }
    // Delete existing participants for the event to avoid duplicates
    await pool.query("DELETE FROM event_participants WHERE event_id = $1", [
      event_id,
    ]);

    // Insert new participants
    const insertPromises = participant_ids.map((pid: string) =>
      pool.query(
        `INSERT INTO event_participants (event_id, participant_id) VALUES ($1, $2)`,
        [event_id, pid]
      )
    );

    await Promise.all(insertPromises);

    res.status(201).json({ msg: `There are participants ${participant_ids.length} added to event` });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});
export default router;
