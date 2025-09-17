import { db } from "./connection";
import { tabTrays, tabOpticalCount } from "./schema";

async function seed() {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Generate data for different hours of the day
    const generateTimestamp = (hour: number) => {
      const date = new Date(startOfDay);
      date.setHours(hour);
      return date.toISOString();
    };

    // Sample tray data across different hours
    const trays = Array.from({ length: 20 }).map((_, index) => ({
      name: `TRAY-${(index + 1).toString().padStart(3, "0")}`,
      creation: generateTimestamp(Math.floor(index / 2)), // Distribute across hours
      modified: generateTimestamp(Math.floor(index / 2)),
      modifiedBy: "system",
      owner: "system",
      docstatus: 0,
      idx: index + 1,
      amendedFrom: null,
      userTags: null,
      comments: null,
      assign: null,
      likedBy: null,
      converyId: `C${(index + 1).toString().padStart(3, "0")}`,
      trayid: `T${(index + 1).toString().padStart(3, "0")}`,
      trayimage: null,
      packetsnumber: Math.floor(Math.random() * 50) + 100,
      packettype: ["half", "one", "six"][Math.floor(Math.random() * 3)],
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
