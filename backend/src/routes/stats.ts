import { Request, Response, Router } from "express";
import { db } from "../db/connection";
import { sql } from "drizzle-orm";
import { desc } from "drizzle-orm";
import { tabOpticalCount, tabTrays } from "../db/schema";

const router = Router();
router.get("/", async (req: Request, res: Response) => {
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
router.get("/total-packets", async (req: Request, res: Response) => {
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

router.get("/total-milk-today", async (req: Request, res: Response) => {
  try {
    // Map tray type to milk volume in ml
    const typeToVolume: Record<string, number> = {
      half: 500,
      unknown: 0,
      one: 1000,
      six: 6000,
      empty: 0,
      two_hundred_ml: 200,
    };

    // Query vwTrayTodayByColorType to get today's trays with count and type
    const milkData = await db.execute(sql`
      SELECT type, SUM(count) as total_count
      FROM vwTrayTodayByColorType
      WHERE DATE(day) = CURDATE()
      GROUP BY type
    `);

    // Calculate total milk produced in litres
    let totalMilkMl = 0;
    for (const row of milkData[0]) {
      const type = row.type || "unknown";
      const volume = typeToVolume[type] || 0;
      totalMilkMl += volume * Number(row.total_count);
    }
    const totalMilkLitres = totalMilkMl / 1000;

    // Get total trays today from tabTrays
    const [totalTraysResult] = await db
      .select({
        total: sql<number>`COUNT(*)`,
      })
      .from(tabTrays)
      .where(sql`DATE(${tabTrays.creation}) = CURDATE()`);

    // Get total packets today from vwTrayTodayByConveyor
    const [totalPacketsResult] = await db.execute(sql`
      SELECT SUM(total_identified_packets) as total_packets
      FROM vwTrayTodayByConveyor
      WHERE DATE(day) = CURDATE()
    `);

    res.json({
      totalMilkLitres,
      totalTrays: totalTraysResult?.total || 0,
      totalPackets: Number(totalPacketsResult[0]?.total_packets) || 0,
    });
  } catch (error) {
    console.error("Error fetching total milk today:", error);
    res.status(500).json({ error: "Failed to fetch total milk today" });
  }
});

router.get("/packets-per-assembly-line", async (req: Request, res: Response) => {
  try {
    const [rows] = await db.execute(sql`
      SELECT conveyor_belt_number, SUM(total_identified_packets) AS total_packets
      FROM vwTrayTodayByConveyor
      WHERE DATE(day) = CURDATE()
      GROUP BY conveyor_belt_number
      ORDER BY conveyor_belt_number
    `);

    const results = Array.isArray(rows) ? rows : [];

    const data = results.map((row: any) => ({
      name: `Assembly line ${row.conveyor_belt_number}`,
      packets: parseInt(row.total_packets, 10) || 0,
    }));

    res.json(data);
  } catch (error) {
    console.error("Error fetching packets per assembly line:", error);
    res.status(500).json({ error: "Failed to fetch packets per assembly line" });
  }
});


export default router;
