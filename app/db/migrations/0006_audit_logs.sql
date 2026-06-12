CREATE TABLE `auditLogs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`userId` int,
	`userEmail` varchar(320),
	`action` varchar(100) NOT NULL,
	`entity` varchar(100),
	`entityId` int,
	`detail` text,
	`ip` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
