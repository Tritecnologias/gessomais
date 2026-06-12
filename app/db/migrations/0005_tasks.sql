CREATE TABLE `tasks` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`assignee` varchar(255) NOT NULL,
	`phone` varchar(30),
	`deadline` timestamp NOT NULL,
	`priority` varchar(20) NOT NULL DEFAULT 'media',
	`status` varchar(30) NOT NULL DEFAULT 'pendente',
	`notes` text,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
