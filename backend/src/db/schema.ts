import {
  int,
  mysqlTable,
  text,
  timestamp,
  varchar,
  tinyint,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const tabTrays = mysqlTable(
  "tabTrays",
  {
    name: varchar("name", { length: 140 }).primaryKey().notNull(),
    creation: timestamp("creation", { mode: "date", fsp: 6 }),
    modified: timestamp("modified", { mode: "date", fsp: 6 }),
    modifiedBy: varchar("modified_by", { length: 140 }),
    owner: varchar("owner", { length: 140 }),
    docstatus: tinyint("docstatus").notNull().default(0),
    idx: int("idx").notNull().default(0),
    userTags: text("_user_tags"),
    comments: text("_comments"),
    assign: text("_assign"),
    likedBy: text("_liked_by"),
    conveyorBeltNumber: int("conveyor_belt_number", { unsigned: false })
      .notNull()
      .default(0),
    trayId: int("tray_id").notNull().default(0),
    identifiedPacketCount: int("identified_packet_count").notNull().default(0),
    identifiedColor: varchar("identified_color", { length: 140 }),
    type: varchar("type", { length: 140 }),
    frameImage: text("frame_image"),
    timeOfDetection: timestamp("time_of_detection", { mode: "date", fsp: 6 }),
  },
  (table) => ({
    creationIdx: sql`INDEX \`creation\` (\`creation\`)`,
  })
);

export const tabOpticalCount = mysqlTable(
  "tabOpticalCount",
  {
    name: varchar("name", { length: 140 }).primaryKey().notNull(),
    creation: timestamp("creation", { mode: "date", fsp: 6 }),
    modified: timestamp("modified", { mode: "date", fsp: 6 }),
    modifiedBy: varchar("modified_by", { length: 140 }),
    owner: varchar("owner", { length: 140 }),
    docstatus: tinyint("docstatus").notNull().default(0),
    idx: int("idx").notNull().default(0),
    userTags: text("_user_tags"),
    comments: text("_comments"),
    assign: text("_assign"),
    likedBy: text("_liked_by"),
    assemblyLine: int("assembly_line").notNull().default(0),
    machineId: int("machine_id").notNull().default(0),
    fromTime: timestamp("from_time", { mode: "date", fsp: 6 }),
    toTime: timestamp("to_time", { mode: "date", fsp: 6 }),
    countedPackets: int("counted_packets").notNull().default(0),
    incrementalCounts: int("incremental_counts").notNull().default(0),
    derivedCount: int("derived_count").notNull().default(0),
  },
  (table) => ({
    creationIdx: sql`INDEX \`creation\` (\`creation\`)`,
  })
);

export type TraySelect = typeof tabTrays.$inferSelect;
export type TrayInsert = typeof tabTrays.$inferInsert;
export type OpticalCountSelect = typeof tabOpticalCount.$inferSelect;
export type OpticalCountInsert = typeof tabOpticalCount.$inferInsert;
