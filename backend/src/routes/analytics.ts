import { Request, Response, Router } from "express";
import { db } from "../db/connection";
import { sql } from "drizzle-orm";
import { desc } from "drizzle-orm";
import { tabOpticalCount, tabTrays } from "../db/schema";

const router = Router();

// Get optical counts for today
router.get("/optical-counts", async (req: Request, res: Response) => {
  try {
    const opticalData = await db
      .select({
        name: tabTrays.name,
        creation: sql`DATE_FORMAT(${tabTrays.creation}, '%Y-%m-%d %H:%i:%s')`,
        conveyorBeltNumber: tabTrays.conveyorBeltNumber,
        timeOfDetection: sql`DATE_FORMAT(${tabTrays.timeOfDetection}, '%Y-%m-%d %H:%i:%s')`,
        identifiedPacketCount: tabTrays.identifiedPacketCount,
      })
      .from(tabTrays)
      .where(sql`DATE(${tabTrays.creation}) = CURDATE()`)
      .orderBy(desc(tabTrays.timeOfDetection));

    res.json(opticalData);
  } catch (error) {
    console.error("Error fetching optical counts:", error);
    res.status(500).json({ error: "Failed to fetch optical counts" });
  }
});

// Get hourly optical counts for today
router.get("/optical-counts/hourly", async (req: Request, res: Response) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const hourlyData = await db
      .select({
        hour: sql<string>`DATE_FORMAT(${tabOpticalCount.fromTime}, '%H:00')`,
        assemblyLine: tabOpticalCount.assemblyLine,
        totalPackets: sql<number>`SUM(${tabOpticalCount.countedPackets})`,
      })
      .from(tabOpticalCount)
      .where(sql`${tabOpticalCount.creation} >= ${startOfDay.toISOString()}`)
      .groupBy(
        sql`DATE_FORMAT(${tabOpticalCount.fromTime}, '%H:00')`,
        tabOpticalCount.assemblyLine
      )
      .orderBy(sql`DATE_FORMAT(${tabOpticalCount.fromTime}, '%H:00')`);

    res.json(hourlyData);
  } catch (error) {
    console.error("Error fetching hourly data:", error);
    res.status(500).json({ error: "Failed to fetch hourly data" });
  }
});

// Get tray data for today
router.get("/trays", async (req: Request, res: Response) => {
  try {
    const trayData = await db
      .select({
        name: tabTrays.name,
        creation: sql`DATE_FORMAT(${tabTrays.creation}, '%Y-%m-%d %H:%i:%s')`,
        conveyorBeltNumber: tabTrays.conveyorBeltNumber,
        trayId: tabTrays.trayId,
        identifiedPacketCount: tabTrays.identifiedPacketCount,
        identifiedColor: tabTrays.identifiedColor,
        type: tabTrays.type,
        timeOfDetection: sql`DATE_FORMAT(${tabTrays.timeOfDetection}, '%Y-%m-%d %H:%i:%s')`,
      })
      .from(tabTrays)
      .where(sql`DATE(${tabTrays.creation}) = CURDATE()`)
      .orderBy(desc(tabTrays.creation))
      .limit(1000);

    res.json(trayData);
  } catch (error) {
    console.error("Error fetching tray data:", error);
    res.status(500).json({
      error: "Failed to fetch tray data",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get packet type summary
router.get("/packet-types/summary", async (req: Request, res: Response) => {
  try {
    const packetTypeSummary = await db
      .select({
        type: tabTrays.type,
        total_packets: sql<number>`SUM(${tabTrays.identifiedPacketCount})`,
        tray_count: sql<number>`COUNT(*)`,
      })
      .from(tabTrays)
      .where(sql`DATE(${tabTrays.creation}) = CURRENT_DATE`)
      .groupBy(tabTrays.type)
      .orderBy(sql`SUM(${tabTrays.identifiedPacketCount}) DESC`);

    res.json(packetTypeSummary);
  } catch (error) {
    console.error("Error fetching packet type summary:", error);
    res.status(500).json({ error: "Failed to fetch packet type summary" });
  }
});

// Get hourly tray counts
router.get("/trays/hourly", async (req: Request, res: Response) => {
  try {
    const hourlyTrays = await db
      .select({
        hour: sql<string>`DATE_FORMAT(${tabTrays.timeOfDetection}, '%H:00')`,
        tray_count: sql<number>`COUNT(*)`,
        total_packets: sql<number>`SUM(${tabTrays.identifiedPacketCount})`,
      })
      .from(tabTrays)
      .where(sql`DATE(${tabTrays.creation}) = CURDATE()`)
      .groupBy(sql`DATE_FORMAT(${tabTrays.timeOfDetection}, '%H:00')`)
      .orderBy(sql`DATE_FORMAT(${tabTrays.timeOfDetection}, '%H:00')`);

    res.json(hourlyTrays);
  } catch (error) {
    console.error("Error fetching hourly tray counts:", error);
    res.status(500).json({ error: "Failed to fetch hourly tray counts" });
  }
});

// Get dashboard statistics
router.get("/stats", async (req: Request, res: Response) => {
  try {
    const [totalPacketsResult] = await db
      .select({
        total: sql<number>`COALESCE(SUM(${tabTrays.identifiedPacketCount}), 0)`,
      })
      .from(tabTrays)
      .where(sql`DATE(${tabTrays.creation}) = CURDATE()`);

    const [activeLinesResult] = await db
      .select({
        count: sql<number>`COUNT(DISTINCT ${tabTrays.conveyorBeltNumber})`,
      })
      .from(tabTrays)
      .where(sql`DATE(${tabTrays.creation}) = CURDATE()`);

    const [totalTraysResult] = await db
      .select({
        total: sql<number>`COUNT(*)`,
      })
      .from(tabTrays)
      .where(sql`DATE(${tabTrays.creation}) = CURDATE()`);

    const [avgTraysResult] = await db
      .select({
        avg_per_hour: sql<number>`
          COUNT(*) / GREATEST(
            TIMESTAMPDIFF(HOUR, MIN(${tabTrays.creation}), MAX(${tabTrays.creation})) + 1,
            1
          )
        `,
      })
      .from(tabTrays)
      .where(sql`DATE(${tabTrays.creation}) = CURDATE()`);

    const capacityUtilization = Math.round(
      (avgTraysResult.avg_per_hour / 150) * 100
    );

    res.json({
      totalPackets: totalPacketsResult.total || 0,
      activeLines: activeLinesResult.count || 0,
      totalTrays: totalTraysResult.total || 0,
      capacityUtilization: Math.min(capacityUtilization, 100) || 0,
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

// Get today toal packets from opticalcounter
router.get("/stats/total-packets", async (req: Request, res: Response) => {
  try {
    const [latestResult] = await db
      .select({
        derivedCount: tabOpticalCount.derivedCount,
      })
      .from(tabOpticalCount)
      .where(sql`DATE(${tabOpticalCount.creation}) = CURDATE()`)
      .orderBy(sql`${tabOpticalCount.creation} DESC`)
      .limit(1);

    res.json({
      totalPackets: latestResult?.derivedCount || 0,
    });
  } catch (error) {
    console.error("Error fetching today total packets from opticalcounter:", error);
    res.status(500).json({ error: "Failed to fetch today total packets from opticalcounter" });
  }
});


// Health check endpoint
router.get("/health", async (req: Request, res: Response) => {
  try {
    // Test database connection
    await db
      .select({ test: sql`1` })
      .from(tabTrays)
      .limit(1);

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      database: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
