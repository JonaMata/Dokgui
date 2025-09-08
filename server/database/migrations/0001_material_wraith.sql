ALTER TABLE `tokens` ADD `name` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `tokens_user_id_name_unique` ON `tokens` (`user_id`,`name`);