CREATE TABLE `jobApplications` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(30) NOT NULL,
	`area` varchar(100) NOT NULL,
	`experience` varchar(50) NOT NULL,
	`availability` varchar(50) NOT NULL,
	`hasCnh` boolean NOT NULL DEFAULT false,
	`hasVehicle` boolean NOT NULL DEFAULT false,
	`message` text,
	`read` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `jobApplications_id` PRIMARY KEY(`id`)
);
