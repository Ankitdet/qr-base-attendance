import { Router } from "express";
import { pool } from "../db";

const router = Router();

// Record attendance
router.post("/", async (req, res) => {
  try {
    const { event_id, participant_uuid } = req.body;

    if (!event_id || !participant_uuid) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    //check if participant is valid for the event
    const event_participants_checks = await pool.query(
      "SELECT id FROM event_participants WHERE event_id = $1 AND participant_id = $2",
      [event_id, participant_uuid]
    );

    if (event_participants_checks.rows.length === 0) {
      return res.status(404).json({ msg: "Participant not found" });
    }

    // check if event is completed or not
    const event_check = await pool.query(
      "SELECT is_completed FROM events WHERE id = $1",
      [event_id]
    );

    if (event_check.rows.length === 0) {
      return res.status(404).json({ msg: "Event not found" });
    }

    if (event_check.rows[0].is_completed) {
      return res.status(400).json({ msg: "Event is already completed" });
    }

    const attendance_checks = await pool.query(
      "SELECT id, is_present FROM attendance WHERE event_id = $1 AND participant_id = $2",
      [event_id, participant_uuid]
    );

    if (
      attendance_checks.rows.length == 1 &&
      attendance_checks.rows[0].is_present
    ) {
      return res.status(404).json({ msg: "Attendance already recorded" });
    }

    // Insert attendance
    const result = await pool.query(
      `INSERT INTO attendance (event_id, participant_id, is_present, scanned_time)
       VALUES ($1, $2, true, NOW()) RETURNING *`,
      [event_id, participant_uuid]
    );

    res.json({ msg: "Attendance recorded", data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// check attendance by how many participants are present in an event
// also need to check how many participant added in event

router.get("/:event_id", async (req, res) => {
  try {
    const { event_id } = req.params;

    if (!event_id) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    // also need to check how many participant added in event
    const attendance_checks = await pool.query(
      "SELECT COUNT(*) AS present_count FROM attendance WHERE event_id = $1 AND is_present = true",
      [event_id]
    );

    const participant_checks = await pool.query(
      "SELECT COUNT(*) AS total_count FROM event_participants WHERE event_id = $1",
      [event_id]
    );
    if (participant_checks.rows.length === 0) {
      return res.status(404).json({ msg: "No participants found for event" });
    }

    const total_participants = participant_checks.rows[0].total_count;
    const total_present = attendance_checks.rows[0].present_count;

    res.json({
      msg: "Attendance fetched",
      data: {
        total_participants: total_participants,
        total_present: total_present,
        remaining: total_participants - total_present,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

export default router;
