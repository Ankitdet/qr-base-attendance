import { Router } from "express";
import { pool } from "../db";
import moment from "moment";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { event_name, start_date, end_date, notes } = req.body;

    if (!event_name || !start_date || !end_date) {
      return res.status(400).json({ msg: "Missing required fields." });
    }

    // Format start and end dates
    const start = moment(start_date, "YYYY-MM-DD");
    const end = moment(end_date, "YYYY-MM-DD");
    const diffDays = end.diff(start, "days") + 1; // Include end date

    const insertedEvents = [];

    for (let i = 1; i <= diffDays; i++) {
      const currentDate = moment(start).add(i, "days").format("YYYY-MM-DD");
      const result = await pool.query(
        `INSERT INTO events (event_name, start_date, end_date, notes, day)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [event_name, currentDate, currentDate, notes, i]
      );
      insertedEvents.push(result.rows[0]);
    }

    res.status(201).json({ msg: "Events created", data: insertedEvents });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Get all events
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM events ORDER BY start_date DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Get event by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM events WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ msg: "Event not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

export default router;
