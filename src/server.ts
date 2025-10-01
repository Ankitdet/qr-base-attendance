import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import { initDB } from "./db";
import attendanceRouter from "./routes/attendance.route";
import eventsRouter from "./routes/events.route";
import eventParticipantsRouter from "./routes/event-participants.route";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/events", eventsRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/event-participants", eventParticipantsRouter);


const PORT = process.env.PORT || 5001;

// Start server only after DB initialized
(async () => {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to initialize DB:", err);
    process.exit(1);
  }
})();
export default app;
