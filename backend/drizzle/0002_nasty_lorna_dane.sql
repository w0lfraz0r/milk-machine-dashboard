CREATE TABLE `tabOpticalHistoryByAssembly` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assembly_line` int NOT NULL,
	`day` timestamp NOT NULL,
	`total_count` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	`calculated_by` varchar(140),
	CONSTRAINT `tabOpticalHistoryByAssembly_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tabOpticalHistoryByMachine` (
	`id` int AUTO_INCREMENT NOT NULL,
	`machine_id` int NOT NULL,
	`day` timestamp NOT NULL,
	`total_count` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	`calculated_by` varchar(140),
	CONSTRAINT `tabOpticalHistoryByMachine_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tabTrayHistoryByColorType` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conveyor_belt_number` int NOT NULL,
	`identified_color` varchar(140),
	`type` varchar(140),
	`day` timestamp NOT NULL,
	`count` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	`calculated_by` varchar(140),
	CONSTRAINT `tabTrayHistoryByColorType_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tabTrayHistoryByConveyor` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conveyor_belt_number` int NOT NULL,
	`day` timestamp NOT NULL,
	`total_identified_packets` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	`calculated_by` varchar(140),
	CONSTRAINT `tabTrayHistoryByConveyor_id` PRIMARY KEY(`id`)
);
