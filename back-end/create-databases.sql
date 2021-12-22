CREATE DATABASE `NAME` -- /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
CREATE TABLE `orders` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `order_shift` int DEFAULT NULL,
  `order_employee` int DEFAULT NULL,
  `order_items` varchar(2000) DEFAULT NULL,
  `order_total` int DEFAULT NULL,
  `order_owe` int DEFAULT NULL,
  `order_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `sessions` (
  `session_id` int NOT NULL AUTO_INCREMENT,
  `session_token` varchar(45) DEFAULT NULL,
  `session_user` varchar(45) DEFAULT NULL,
  `session_expiry` datetime DEFAULT NULL,
  PRIMARY KEY (`session_id`),
  UNIQUE KEY `session_id_UNIQUE` (`session_id`),
  UNIQUE KEY `session_token_UNIQUE` (`session_token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `shifts` (
  `shift_id` int NOT NULL AUTO_INCREMENT,
  `shift_name` varchar(45) DEFAULT NULL,
  `shift_ended` tinyint NOT NULL DEFAULT '0',
  `started_by` varchar(45) DEFAULT NULL,
  `ended_by` varchar(45) DEFAULT NULL,
  `employee_list` varchar(2000) DEFAULT '[]',
  `started_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ended_at` datetime DEFAULT NULL,
  `stat_orders` int DEFAULT NULL,
  `stat_items` int DEFAULT NULL,
  `stat_sales` int DEFAULT NULL,
  `stat_owe` int DEFAULT NULL,
  PRIMARY KEY (`shift_id`),
  UNIQUE KEY `shift_id_UNIQUE` (`shift_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `stock` (
  `item_id` int NOT NULL AUTO_INCREMENT,
  `category` varchar(200) DEFAULT NULL,
  `menu_item` varchar(200) DEFAULT NULL,
  `item_name` varchar(200) DEFAULT NULL,
  `chest_id` int NOT NULL DEFAULT '0',
  `sell_price` int DEFAULT NULL,
  `shipment_price` int DEFAULT NULL,
  `stock` int DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  UNIQUE KEY `item_id_UNIQUE` (`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `user_name` varchar(45) DEFAULT NULL,
  `user_password` varchar(200) DEFAULT NULL,
  `user_owe` int NOT NULL DEFAULT '65',
  `legacy_user` tinyint NOT NULL DEFAULT '0',
  `disabled` tinyint NOT NULL DEFAULT '0',
  `invited` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `user_name_UNIQUE` (`user_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `roles` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_priority` int NOT NULL DEFAULT '10',
  `role_name` varchar(64) DEFAULT NULL,
  `permission_manage_stock` tinyint NOT NULL DEFAULT '0',
  `permission_casino_bingo` tinyint NOT NULL DEFAULT '0',
  `permission_casino_blackjack` tinyint NOT NULL DEFAULT '0',
  `permission_casino_cards` tinyint NOT NULL DEFAULT '0',
  `permission_casino_stats` tinyint NOT NULL DEFAULT '0',
  `permission_list_employees` tinyint NOT NULL DEFAULT '0',
  `permission_manage_employees` tinyint NOT NULL DEFAULT '0',
  `permission_manage_shift` tinyint NOT NULL DEFAULT '0',
  `permission_shift_stats` tinyint NOT NULL DEFAULT '1',
  `permission_sell` tinyint NOT NULL DEFAULT '0',
  `permission_overview` tinyint NOT NULL DEFAULT '1',
  `permission_view_shift` tinyint NOT NULL DEFAULT '1',
  `permission_list_shifts` tinyint NOT NULL DEFAULT '0',
  `permission_list_stock` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `role_id_UNIQUE` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `roles` (`role_priority`, `role_name`) VALUES ('0', 'Shopkeeper');
INSERT INTO `roles` (`role_priority`, `role_name`) VALUES ('1', 'Co-Owner');
INSERT INTO `roles` (`role_priority`, `role_name`) VALUES ('2', 'Secratary');
INSERT INTO `roles` (`role_priority`, `role_name`) VALUES ('3', 'Manager');
INSERT INTO `roles` (`role_priority`, `role_name`) VALUES ('4', 'Senior Employee');
INSERT INTO `roles` (`role_priority`, `role_name`) VALUES ('5', 'Employee');
INSERT INTO `roles` (`role_priority`, `role_name`) VALUES ('6', 'Trial Employee');
INSERT INTO `roles` (`role_priority`, `role_name`) VALUES ('99', 'Former Employee');
UPDATE `sayonara-logs`.`roles` SET `permission_manage_stock` = '1', `permission_casino_bingo` = '1', `permission_casino_blackjack` = '1', `permission_casino_cards` = '1', `permission_casino_stats` = '1', `permission_list_employees` = '1', `permission_manage_employees` = '1', `permission_manage_shift` = '1', `permission_sell` = '1', `permission_list_shifts` = '1', `permission_list_stock` = '1' WHERE (`role_id` = '1');
UPDATE `sayonara-logs`.`roles` SET `role_id` = '2', `permission_manage_stock` = '1', `permission_casino_bingo` = '1', `permission_casino_blackjack` = '1', `permission_casino_cards` = '1', `permission_casino_stats` = '1', `permission_list_employees` = '1', `permission_manage_employees` = '1', `permission_manage_shift` = '1', `permission_sell` = '1', `permission_list_shifts` = '1', `permission_list_stock` = '1' WHERE (`role_id` = '2');
UPDATE `sayonara-logs`.`roles` SET `permission_manage_stock` = '1', `permission_casino_stats` = '1', `permission_list_employees` = '1', `permission_manage_employees` = '1', `permission_list_shifts` = '1', `permission_list_stock` = '1' WHERE (`role_id` = '3');
UPDATE `sayonara-logs`.`roles` SET `permission_manage_stock` = '1', `permission_casino_bingo` = '1', `permission_casino_blackjack` = '1', `permission_casino_cards` = '1', `permission_casino_stats` = '1', `permission_list_employees` = '1', `permission_manage_employees` = '0', `permission_manage_shift` = '1', `permission_sell` = '1', `permission_list_shifts` = '1', `permission_list_stock` = '1' WHERE (`role_id` = '4');
UPDATE `sayonara-logs`.`roles` SET `permission_casino_bingo` = '1', `permission_casino_blackjack` = '1', `permission_casino_cards` = '1', `permission_casino_stats` = '1', `permission_list_employees` = '1', `permission_sell` = '1', `permission_list_shifts` = '1', `permission_list_stock` = '1' WHERE (`role_id` = '5');
UPDATE `sayonara-logs`.`roles` SET `permission_casino_bingo` = '1', `permission_casino_blackjack` = '1', `permission_casino_cards` = '1', `permission_casino_stats` = '1', `permission_sell` = '1', `permission_list_shifts` = '1', `permission_list_stock` = '1' WHERE (`role_id` = '6');
UPDATE `sayonara-logs`.`roles` SET `permission_sell` = '1', `permission_list_stock` = '1' WHERE (`role_id` = '7');