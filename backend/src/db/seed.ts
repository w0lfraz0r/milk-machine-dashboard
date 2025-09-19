import { db } from "./connection";
import { tabTrays, tabOpticalCount } from "./schema";
import { sql } from "drizzle-orm";

async function seed() {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const generateTimestamp = (hour: number) => {
      const date = new Date(startOfDay);
      date.setHours(hour);
      return date;
    };

    const colors = ["red", "blue", "green", "yellow"];
    const types = ["half", "one", "six"];

    // Sample tray data across different hours
    const trays = Array.from({ length: 20 }).map((_, index) => ({
      name: `TRAY-${(index + 1).toString().padStart(3, "0")}`,
      creation: generateTimestamp(Math.floor(index / 2)),
      modified: generateTimestamp(Math.floor(index / 2)),
      modifiedBy: "system",
      owner: "system",
      docstatus: 0,
      idx: index + 1,
      userTags: null,
      comments: null,
      assign: null,
      likedBy: null,
      conveyorBeltNumber: Math.floor(Math.random() * 2) + 1,
      trayId: index + 1,
      identifiedPacketCount: Math.floor(Math.random() * 50) + 100,
      identifiedColor: colors[Math.floor(Math.random() * colors.length)],
      type: types[Math.floor(Math.random() * types.length)],
      frameImage: null,
      timeOfDetection: generateTimestamp(Math.floor(index / 2)),
    }));

    // Sample optical count data across different hours
    const opticalCounts = Array.from({ length: 24 }).flatMap((_, hour) =>
      Array.from({ length: 4 }).map((_, line) => ({
        name: `COUNT-${hour}-${line + 1}`,
        creation: generateTimestamp(hour),
        modified: generateTimestamp(hour),
        modifiedBy: "system",
        owner: "system",
        docstatus: 0,
        idx: hour * 4 + line + 1,
        userTags: null,
        comments: null,
        assign: null,
        likedBy: null,
        assemblyLine: line + 1,
        machineId: 100 + line + 1,
        fromTime: generateTimestamp(hour),
        toTime: generateTimestamp(hour + 1),
        countedPackets: Math.floor(Math.random() * 500) + 500,
      }))
    );

    console.log("🌱 Starting seed...");

    // Clear existing data
    await db.delete(tabTrays);
    await db.delete(tabOpticalCount);

    console.log("Inserting tray data...");
    for (const tray of trays) {
      await db.insert(tabTrays).values(tray);
    }

    console.log("Inserting optical count data...");
    for (const count of opticalCounts) {
      await db.insert(tabOpticalCount).values(count);
    }

    console.log("✅ Seed completed successfully");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  } finally {
    process.exit(0);
  }
}

seed();
