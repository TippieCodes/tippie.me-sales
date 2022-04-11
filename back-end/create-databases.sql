-- phpMyAdmin SQL Dump
-- version 4.9.5deb2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Dec 26, 2021 at 05:24 PM
-- Server version: 8.0.25-0ubuntu0.20.04.1
-- PHP Version: 7.4.20

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `{database}`
--
CREATE DATABASE IF NOT EXISTS `{database}` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `{database}`;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `order_id` int NOT NULL,
  `order_shift` int DEFAULT NULL,
  `order_employee` int DEFAULT NULL,
  `order_items` varchar(2000) DEFAULT NULL,
  `order_total` int DEFAULT NULL,
  `order_owe` int DEFAULT NULL,
  `order_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `role_id` int NOT NULL,
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
  `permission_admin_store` tinyint NOT NULL DEFAULT '0',
  `permission_admin_roles` tinyint NOT NULL DEFAULT '0',
  `permission_admin_discord` tinyint NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`role_id`, `role_priority`, `role_name`, `permission_manage_stock`, `permission_casino_bingo`, `permission_casino_blackjack`, `permission_casino_cards`, `permission_casino_stats`, `permission_list_employees`, `permission_manage_employees`, `permission_manage_shift`, `permission_shift_stats`, `permission_sell`, `permission_overview`, `permission_view_shift`, `permission_list_shifts`, `permission_list_stock`, `permission_admin_store`, `permission_admin_roles`, `permission_admin_discord`) VALUES
(1, 0, 'Shopkeeper', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0),
(2, 1, 'Co-Owner', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0),
(3, 2, 'Secratary', 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 0, 0),
(4, 3, 'Manager', 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0),
(5, 4, 'Senior Employee', 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0),
(6, 5, 'Employee', 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0),
(7, 6, 'Trial Employee', 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0),
(8, 99, 'Former Employee', 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `shifts`
--

CREATE TABLE `shifts` (
  `shift_id` int NOT NULL,
  `shift_name` varchar(45) DEFAULT NULL,
  `shift_ended` tinyint NOT NULL DEFAULT '0',
  `started_by` int DEFAULT NULL,
  `ended_by` int DEFAULT NULL,
  `employee_list` varchar(2000) DEFAULT '[]',
  `started_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ended_at` datetime DEFAULT NULL,
  `stat_orders` int DEFAULT NULL,
  `stat_items` int DEFAULT NULL,
  `stat_sales` int DEFAULT NULL,
  `stat_owe` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stock`
--

CREATE TABLE `stock` (
  `item_id` int NOT NULL,
  `category` varchar(200) DEFAULT NULL,
  `menu_item` varchar(200) DEFAULT NULL,
  `item_name` varchar(200) DEFAULT NULL,
  `chest_id` varchar(5) NOT NULL DEFAULT '0',
  `sell_price` int DEFAULT NULL,
  `shipment_price` int DEFAULT NULL,
  `stock` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int NOT NULL,
  `user_name` varchar(45) DEFAULT NULL,
  `user_password` varchar(200) DEFAULT NULL,
  `user_owe` int NOT NULL DEFAULT '65',
  `user_role` int NOT NULL DEFAULT '8',
  `legacy_user` tinyint NOT NULL DEFAULT '0',
  `disabled` tinyint NOT NULL DEFAULT '0',
  `invited` tinyint NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`),
  ADD KEY `order_shift` (`order_shift`),
  ADD KEY `order_employee` (`order_employee`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`role_id`),
  ADD UNIQUE KEY `role_id_UNIQUE` (`role_id`);

--
-- Indexes for table `shifts`
--
ALTER TABLE `shifts`
  ADD PRIMARY KEY (`shift_id`),
  ADD UNIQUE KEY `shift_id_UNIQUE` (`shift_id`),
  ADD KEY `started_by` (`started_by`),
  ADD KEY `ended_by` (`ended_by`);

--
-- Indexes for table `stock`
--
ALTER TABLE `stock`
  ADD PRIMARY KEY (`item_id`),
  ADD UNIQUE KEY `item_id_UNIQUE` (`item_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `user_name_UNIQUE` (`user_name`),
  ADD KEY `user_role` (`user_role`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `role_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `shifts`
--
ALTER TABLE `shifts`
  MODIFY `shift_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stock`
--
ALTER TABLE `stock`
  MODIFY `item_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`order_shift`) REFERENCES `shifts` (`shift_id`),
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`order_employee`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `shifts`
--
ALTER TABLE `shifts`
  ADD CONSTRAINT `shifts_ibfk_1` FOREIGN KEY (`started_by`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `shifts_ibfk_2` FOREIGN KEY (`ended_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`user_role`) REFERENCES `roles` (`role_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
