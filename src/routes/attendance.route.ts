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

    const event_participants_checks = await pool.query(
      "SELECT id FROM event_participants WHERE event_id = $1 AND participant_id = $2",
      [event_id, participant_uuid]
    );

    if (event_participants_checks.rows.length === 0) {
      return res.status(404).json({ msg: "Participant not found" });
    }

    const attendance_checks = await pool.query(
      "SELECT id,is_present FROM attendance WHERE event_id = $1 AND participant_id = $2",
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
      `INSERT INTO attendance (event_id, participant_id, is_present, scan_time, no_of_scanned)
       VALUES ($1, $2, true, NOW(), 1) RETURNING *`,
      [event_id, participant_uuid]
    );

    res.json({ msg: "Attendance recorded", data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

export default router;
