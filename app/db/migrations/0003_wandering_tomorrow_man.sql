CREATE TABLE `stockMovements` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`type` varchar(20) NOT NULL,
	`quantity` int NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stockMovements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `products` ADD `quantity` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `minStock` int DEFAULT 0 NOT NULL;