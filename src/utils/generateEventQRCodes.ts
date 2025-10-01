import fs from "fs";
import path from "path";
import QRCode from "qrcode";
import { pool } from "../db";

/**
 * Generate QR codes as PNG files for each participant of an event.
 * Each participant gets a separate PNG file inside a folder named after their flat number.
 * @param eventId - UUID of the event
 * @param outputDir - Root folder to store QR code folders
 */
export async function generateQRCodesByFlat(
  eventId: string,
  outputDir: string
) {
  try {
    // Fetch participants for the event
    const participantsRes = await pool.query(
      `SELECT ep.participant_id, p.flatno, p.owner_name
       FROM event_participants ep
       JOIN participants p ON ep.participant_id = p.id
       WHERE ep.event_id = $1`,
      [eventId]
    );

    const participants = participantsRes.rows;
    if (participants.length === 0) {
      console.log("No participants found for this event.");
      return;
    }

    // Create output directory if not exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    for (const p of participants) {
      // Create folder for flat number
      const flatFolder = path.join(outputDir, `Flat_${p.flatno}`);
      if (!fs.existsSync(flatFolder)) {
        fs.mkdirSync(flatFolder, { recursive: true });
      }

      // File path for PNG
      const fileName = `${p.flatno}.png`;
      const filePath = path.join(flatFolder, fileName);

      // Generate QR code PNG
      await QRCode.toFile(filePath, p.participant_id, {
        type: "png",
        width: 400, // adjust size
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });

      console.log(`✅ QR code saved: ${filePath}`);
    }

    console.log("✅ All QR codes generated successfully.");
  } catch (err) {
    console.error("❌ Error generating QR codes:", err);
  }
}

// Example usage
const eventId = "3f8fc37f-88d4-436e-a3d9-461b43c6a8fc"; // Replace with actual event_id
const outputDir = "./qr_codes";

generateQRCodesByFlat(eventId, outputDir)
  .then(() => console.log("Done"))
  .catch(console.error);
