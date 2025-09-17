import {
  pgTable,
  varchar,
  timestamp,
  integer,
  text,
} from "drizzle-orm/pg-core";

// tabTrays table schema
export const tabTrays = pgTable("tabTrays", {
  name: varchar("name", { length: 140 }).primaryKey().notNull(),
  creation: timestamp("creation", { mode: "string", precision: 6 }),
  modified: timestamp("modified", { mode: "string", precision: 6 }),
  modifiedBy: varchar("modified_by", { length: 140 }),
  owner: varchar("owner", { length: 140 }),
  docstatus: integer("docstatus").notNull().default(0),
  idx: integer("idx").notNull().default(0),
  amendedFrom: varchar("amended_from", { length: 140 }),
  userTags: text("_user_tags"),
  comments: text("_comments"),
  assign: text("_assign"),
  likedBy: text("_liked_by"),
  converyId: varchar("convery id", { length: 140 }), // Note: space in column name as per your schema
  trayid: varchar("trayid", { length: 140 }),
  trayimage: varchar("trayimage", { length: 140 }),
  packetsnumber: integer("packetsnumber").notNull().default(0),
  packettype: varchar("packettype", { length: 140 }),
});

// tabOpticalCount table schema
export const tabOpticalCount = pgTable("tabOpticalCount", {
  name: varchar("name", { length: 140 }).primaryKey().notNull(),
  creation: timestamp("creation", { mode: "string", precision: 6 }),
  modified: timestamp("modified", { mode: "string", precision: 6 }),
  modifiedBy: varchar("modified_by", { length: 140 }),
  owner: varchar("owner", { length: 140 }),
  docstatus: integer("docstatus").notNull().default(0),
  idx: integer("idx").notNull().default(0),
  assemblyLine: integer("assembly_line"),
  machineId: integer("machine_id"),
  fromTime: timestamp("from_time", { mode: "string", precision: 6 }),
  toTime: timestamp("to_time", { mode: "string", precision: 6 }),
  countedPackets: integer("counted_packets"),
});

// Type exports for TypeScript
export type TraySelect = typeof tabTrays.$inferSelect;
export type TrayInsert = typeof tabTrays.$inferInsert;
export type OpticalCountSelect = typeof tabOpticalCount.$inferSelect;
export type OpticalCountInsert = typeof tabOpticalCount.$inferInsert;
