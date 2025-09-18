import { mysqlTable, varchar, timestamp, int, text } from "drizzle-orm/mysql-core";

export const tabTrays = mysqlTable("tabTrays", {
  name: varchar("name", { length: 140 }).primaryKey().notNull(),
  creation: timestamp("creation"),
  modified: timestamp("modified"),
  modifiedBy: varchar("modified_by", { length: 140 }),
  owner: varchar("owner", { length: 140 }),
  docstatus: int("docstatus").notNull().default(0),
  idx: int("idx").notNull().default(0),
  amendedFrom: varchar("amended_from", { length: 140 }),
  userTags: text("_user_tags"),
  comments: text("_comments"),
  assign: text("_assign"),
  likedBy: text("_liked_by"),
  converyId: varchar("convery id", { length: 140 }),
  trayid: varchar("trayid", { length: 140 }),
  trayimage: varchar("trayimage", { length: 140 }),
  packetsnumber: int("packetsnumber").notNull().default(0),
  packettype: varchar("packettype", { length: 140 }),
});

export const tabOpticalCount = mysqlTable("tabOpticalCount", {
  name: varchar("name", { length: 140 }).primaryKey().notNull(),
  creation: timestamp("creation"),
  modified: timestamp("modified"),
  modifiedBy: varchar("modified_by", { length: 140 }),
  owner: varchar("owner", { length: 140 }),
  docstatus: int("docstatus").notNull().default(0),
  idx: int("idx").notNull().default(0),
  assemblyLine: int("assembly_line"),
  machineId: int("machine_id"),
  fromTime: timestamp("from_time"),
  toTime: timestamp("to_time"),
  countedPackets: int("counted_packets"),
});

export type TraySelect = typeof tabTrays.$inferSelect;
export type TrayInsert = typeof tabTrays.$inferInsert;
export type OpticalCountSelect = typeof tabOpticalCount.$inferSelect;
export type OpticalCountInsert = typeof tabOpticalCount.$inferInsert;
