CREATE TABLE `tabOpticalCount` (
	`name` varchar(140) NOT NULL,
	`creation` timestamp,
	`modified` timestamp,
	`modified_by` varchar(140),
	`owner` varchar(140),
	`docstatus` int NOT NULL DEFAULT 0,
	`idx` int NOT NULL DEFAULT 0,
	`assembly_line` int,
	`machine_id` int,
	`from_time` timestamp,
	`to_time` timestamp,
	`counted_packets` int,
	CONSTRAINT `tabOpticalCount_name` PRIMARY KEY(`name`)
);
--> statement-breakpoint
CREATE TABLE `tabTrays` (
	`name` varchar(140) NOT NULL,
	`creation` timestamp,
	`modified` timestamp,
	`modified_by` varchar(140),
	`owner` varchar(140),
	`docstatus` int NOT NULL DEFAULT 0,
	`idx` int NOT NULL DEFAULT 0,
	`amended_from` varchar(140),
	`_user_tags` text,
	`_comments` text,
	`_assign` text,
	`_liked_by` text,
	`convery id` varchar(140),
	`trayid` varchar(140),
	`trayimage` varchar(140),
	`packetsnumber` int NOT NULL DEFAULT 0,
	`packettype` varchar(140),
	CONSTRAINT `tabTrays_name` PRIMARY KEY(`name`)
);
