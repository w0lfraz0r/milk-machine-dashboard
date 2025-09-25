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

export default router;
