CREATE TABLE IF NOT EXISTS "tabOpticalCount" (
	"name" varchar(140) PRIMARY KEY NOT NULL,
	"creation" timestamp(6),
	"modified" timestamp(6),
	"modified_by" varchar(140),
	"owner" varchar(140),
	"docstatus" integer DEFAULT 0 NOT NULL,
	"idx" integer DEFAULT 0 NOT NULL,
	"assembly_line" integer,
	"machine_id" integer,
	"from_time" timestamp(6),
	"to_time" timestamp(6),
	"counted_packets" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tabTrays" (
	"name" varchar(140) PRIMARY KEY NOT NULL,
	"creation" timestamp(6),
	"modified" timestamp(6),
	"modified_by" varchar(140),
	"owner" varchar(140),
	"docstatus" integer DEFAULT 0 NOT NULL,
	"idx" integer DEFAULT 0 NOT NULL,
	"amended_from" varchar(140),
	"_user_tags" text,
	"_comments" text,
	"_assign" text,
	"_liked_by" text,
	"convery id" varchar(140),
	"trayid" varchar(140),
	"trayimage" varchar(140),
	"packetsnumber" integer DEFAULT 0 NOT NULL,
	"packettype" varchar(140)
);
