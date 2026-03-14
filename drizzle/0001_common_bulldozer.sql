CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int NOT NULL,
	`productName` varchar(255) NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`quantity` int NOT NULL,
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`customerName` varchar(255),
	`customerEmail` varchar(320),
	`customerPhone` varchar(20),
	`total` decimal(10,2) NOT NULL,
	`paymentMethod` enum('transfer','visa','messenger') NOT NULL,
	`status` enum('pending','paid','processing','shipped','completed','cancelled') NOT NULL DEFAULT 'pending',
	`address` text,
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`slipImageUrl` text,
	`slipImageKey` text,
	`paymentStatus` enum('pending','submitted','verified','rejected') NOT NULL DEFAULT 'pending',
	`verifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_orderId_unique` UNIQUE(`orderId`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`brand` varchar(100),
	`model` varchar(100),
	`categoryId` int,
	`price` decimal(10,2) NOT NULL,
	`stock` int NOT NULL DEFAULT 0,
	`imageUrl` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `repair_bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`repairCode` varchar(20) NOT NULL,
	`userId` int,
	`customerName` varchar(255) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`brand` varchar(100) NOT NULL,
	`model` varchar(100) NOT NULL,
	`issue` text NOT NULL,
	`bookingDate` varchar(20) NOT NULL,
	`bookingTime` varchar(10) NOT NULL,
	`status` enum('received','diagnosing','repairing','waiting_parts','completed','ready_pickup','cancelled') NOT NULL DEFAULT 'received',
	`technicianNote` text,
	`estimatedCost` decimal(10,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `repair_bookings_id` PRIMARY KEY(`id`),
	CONSTRAINT `repair_bookings_repairCode_unique` UNIQUE(`repairCode`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);