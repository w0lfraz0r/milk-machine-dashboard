import {
  int,
  mysqlTable,
  text,
  timestamp,
  varchar,
  tinyint,
  mysqlView,
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


export const tabOpticalHistoryByMachine = mysqlTable(
  "tabOpticalHistoryByMachine",
  {
    id: int("id").autoincrement().primaryKey().notNull(),
    machineId: int("machine_id").notNull(),
    day: timestamp("day", { mode: "date" }).notNull(),
    totalCount: int("total_count").notNull().default(0),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).onUpdateNow(),
    calculatedBy: varchar("calculated_by", { length: 140 }),
  },
  (table) => ({
    dayIdx: sql`INDEX \`day_machine_idx\` (\`day\`, \`machine_id\`)`,
  })
);

export const tabOpticalHistoryByAssembly = mysqlTable(
  "tabOpticalHistoryByAssembly",
  {
    id: int("id").autoincrement().primaryKey().notNull(),
    assemblyLine: int("assembly_line").notNull(),
    day: timestamp("day", { mode: "date" }).notNull(),
    totalCount: int("total_count").notNull().default(0),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).onUpdateNow(),
    calculatedBy: varchar("calculated_by", { length: 140 }),
  },
  (table) => ({
    dayIdx: sql`INDEX \`day_assembly_idx\` (\`day\`, \`assembly_line\`)`,
  })
);

export const tabTrayHistoryByConveyor = mysqlTable(
  "tabTrayHistoryByConveyor",
  {
    id: int("id").autoincrement().primaryKey().notNull(),
    conveyorBeltNumber: int("conveyor_belt_number").notNull(),
    day: timestamp("day", { mode: "date" }).notNull(),
    totalIdentifiedPackets: int("total_identified_packets").notNull().default(0),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).onUpdateNow(),
    calculatedBy: varchar("calculated_by", { length: 140 }),
  },
  (table) => ({
    dayIdx: sql`INDEX \`day_conveyor_idx\` (\`day\`, \`conveyor_belt_number\`)`,
  })
);

export const tabTrayHistoryByColorType = mysqlTable(
  "tabTrayHistoryByColorType",
  {
    id: int("id").autoincrement().primaryKey().notNull(),
    conveyorBeltNumber: int("conveyor_belt_number").notNull(),
    identifiedColor: varchar("identified_color", { length: 140 }),
    type: varchar("type", { length: 140 }),
    day: timestamp("day", { mode: "date" }).notNull(),
    count: int("count").notNull().default(0),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).onUpdateNow(),
    calculatedBy: varchar("calculated_by", { length: 140 }),
  },
  (table) => ({
    dayIdx: sql`INDEX \`day_color_type_idx\` (\`day\`, \`conveyor_belt_number\`, \`identified_color\`, \`type\`)`,
  })
);


// views for today's aggregated data
export const vwOpticalTodayByMachine = mysqlView(
  "vwOpticalTodayByMachine",
  {
    machineId: int("machine_id"),
    day: timestamp("day", { mode: "date" }),
    hour: int("hour"),
    totalCount: int("total_count"),
  }
);

export const vwOpticalTodayByAssembly = mysqlView(
  "vwOpticalTodayByAssembly",
  {
    assemblyLine: int("assembly_line"),
    day: timestamp("day", { mode: "date" }),
    hour: int("hour"),
    totalCount: int("total_count"),
  }
);

export const vwTrayTodayByConveyor = mysqlView(
  "vwTrayTodayByConveyor",
  {
    conveyorBeltNumber: int("conveyor_belt_number"),
    day: timestamp("day", { mode: "date" }),
    hour: int("hour"),
    totalIdentifiedPackets: int("total_identified_packets"),
  }
);
export const vwTrayTodayByColorType = mysqlView(
  "vwTrayTodayByColorType",
  {
    conveyorBeltNumber: int("conveyor_belt_number"),
    identifiedColor: varchar("identified_color", { length: 140 }),
    type: varchar("type", { length: 140 }),
    day: timestamp("day", { mode: "date" }),
    hour: int("hour"),
    count: int("count"),
  }
);



export type TraySelect = typeof tabTrays.$inferSelect;
export type TrayInsert = typeof tabTrays.$inferInsert;
export type OpticalCountSelect = typeof tabOpticalCount.$inferSelect;
export type OpticalCountInsert = typeof tabOpticalCount.$inferInsert;
export type OpticalHistoryByMachineSelect = typeof tabOpticalHistoryByMachine.$inferSelect;
export type OpticalHistoryByAssemblySelect = typeof tabOpticalHistoryByAssembly.$inferSelect;
export type TrayHistoryByConveyorSelect = typeof tabTrayHistoryByConveyor.$inferSelect;
export type TrayHistoryByColorTypeSelect = typeof tabTrayHistoryByColorType.$inferSelect;

export type OpticalTodayByMachineSelect = {
  machineId: number;
  day: Date;
  hour: number;
  totalCount: number;
};
export type OpticalTodayByAssemblySelect = {
  assemblyLine: number;
  day: Date;
  hour: number;
  totalCount: number;
};

export type TrayTodayByConveyorSelect = {
  conveyorBeltNumber: number;
  day: Date;
  hour: number;
  totalIdentifiedPackets: number;
};

export type TrayTodayByColorTypeSelect = {
  conveyorBeltNumber: number;
  identifiedColor: string | null;
  type: string | null;
  day: Date;
  hour: number;
  count: number;
};
