import { Router } from "express";
import { pool } from "../db";

const router = Router();

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
export default router;
