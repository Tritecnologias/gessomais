CREATE TABLE `visits` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`leadId` int,
	`title` varchar(255) NOT NULL,
	`scheduledAt` timestamp NOT NULL,
	`address` varchar(500),
	`contact` varchar(255),
	`notes` text,
	`status` varchar(30) NOT NULL DEFAULT 'agendada',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `visits_id` PRIMARY KEY(`id`)
);
