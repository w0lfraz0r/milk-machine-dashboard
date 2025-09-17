import { Request, Response, Router } from "express";
import { db } from "../db/connection";
import { sql } from "drizzle-orm";
import { desc } from "drizzle-orm";
import { tabOpticalCount, tabTrays } from "../db/schema";

const router = Router();

// Get optical counts for today
router.get("/optical-counts", async (req: Request, res: Response) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const opticalData = await db
      .select({
        name: tabOpticalCount.name,
        creation: tabOpticalCount.creation,
        assemblyLine: tabOpticalCount.assemblyLine,
        machineId: tabOpticalCount.machineId,
        fromTime: tabOpticalCount.fromTime,
        toTime: tabOpticalCount.toTime,
        countedPackets: tabOpticalCount.countedPackets,
      })
      .from(tabOpticalCount)
      .where(sql`${tabOpticalCount.creation} >= ${startOfDay.toISOString()}`)
      .orderBy(desc(tabOpticalCount.fromTime));

    res.json(opticalData);
  } catch (error) {
    console.error("Error fetching optical counts:", error);
    res.status(500).json({
      error: "Failed to fetch optical counts",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get hourly optical counts for today
router.get("/optical-counts/hourly", async (req: Request, res: Response) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const hourlyData = await db
      .select({
        hour: sql<string>`to_char(${tabOpticalCount.fromTime}, 'HH24:00')`,
        assemblyLine: tabOpticalCount.assemblyLine,
        totalPackets: sql<number>`SUM(${tabOpticalCount.countedPackets})`,
      })
      .from(tabOpticalCount)
      .where(sql`${tabOpticalCount.creation} >= ${startOfDay.toISOString()}`)
      .groupBy(
        sql`to_char(${tabOpticalCount.fromTime}, 'HH24:00')`,
        tabOpticalCount.assemblyLine
      )
      .orderBy(sql`to_char(${tabOpticalCount.fromTime}, 'HH24:00')`);

    res.json(hourlyData);
  } catch (error) {
    console.error("Error fetching hourly optical counts:", error);
    res.status(500).json({
      error: "Failed to fetch hourly optical counts",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get tray data for today
router.get("/trays", async (req: Request, res: Response) => {
  try {
    const trayData = await db
      .select({
        name: tabTrays.name,
        creation: tabTrays.creation,
        convery_id: tabTrays.converyId,
        trayid: tabTrays.trayid,
        packetsnumber: tabTrays.packetsnumber,
        packettype: tabTrays.packettype,
      })
      .from(tabTrays)
      .where(sql`DATE(${tabTrays.creation}) = CURRENT_DATE`)
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
        packettype: tabTrays.packettype,
        total_packets: sql<number>`SUM(${tabTrays.packetsnumber})`,
        tray_count: sql<number>`COUNT(*)`,
      })
      .from(tabTrays)
      .where(sql`DATE(${tabTrays.creation}) = CURRENT_DATE`)
      .groupBy(tabTrays.packettype)
      .orderBy(sql`SUM(${tabTrays.packetsnumber}) DESC`);

    res.json(packetTypeSummary);
  } catch (error) {
    console.error("Error fetching packet type summary:", error);
    res.status(500).json({
      error: "Failed to fetch packet type summary",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get hourly tray counts
router.get("/trays/hourly", async (req: Request, res: Response) => {
  try {
    const hourlyTrays = await db
      .select({
        hour: sql<string>`to_char(${tabTrays.creation}, 'HH24:00')`,
        tray_count: sql<number>`COUNT(*)`,
        total_packets: sql<number>`SUM(${tabTrays.packetsnumber})`,
      })
      .from(tabTrays)
      .where(sql`DATE(${tabTrays.creation}) = CURRENT_DATE`)
      .groupBy(sql`to_char(${tabTrays.creation}, 'HH24:00')`)
      .orderBy(sql`to_char(${tabTrays.creation}, 'HH24:00')`);

    res.json(hourlyTrays);
  } catch (error) {
    console.error("Error fetching hourly tray counts:", error);
    res.status(500).json({
      error: "Failed to fetch hourly tray counts",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get dashboard statistics
router.get("/stats", async (req: Request, res: Response) => {
  try {
    // Get total packets today
    const [totalPacketsResult] = await db
      .select({
        total: sql<number>`COALESCE(SUM(${tabOpticalCount.countedPackets}), 0)`,
      })
      .from(tabOpticalCount)
      .where(sql`DATE(${tabOpticalCount.creation}) = CURRENT_DATE`);

    // Get active assembly lines
    const [activeLinesResult] = await db
      .select({
        count: sql<number>`COUNT(DISTINCT ${tabOpticalCount.assemblyLine})`,
      })
      .from(tabOpticalCount)
      .where(sql`DATE(${tabOpticalCount.creation}) = CURRENT_DATE`);

    // Get total trays today
    const [totalTraysResult] = await db
      .select({
        total: sql<number>`COUNT(*)`,
      })
      .from(tabTrays)
      .where(sql`DATE(${tabTrays.creation}) = CURRENT_DATE`);

    // Calculate capacity utilization (assuming 150 trays/hour max capacity)
    const [avgTraysResult] = await db
      .select({
        avg_per_hour: sql<number>`COUNT(*) / GREATEST(EXTRACT(EPOCH FROM (MAX(${tabTrays.creation}) - MIN(${tabTrays.creation}))) / 3600, 1)`,
      })
      .from(tabTrays)
      .where(sql`DATE(${tabTrays.creation}) = CURRENT_DATE`);

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
    res.status(500).json({
      error: "Failed to fetch statistics",
      message: error instanceof Error ? error.message : "Unknown error",
    });
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
