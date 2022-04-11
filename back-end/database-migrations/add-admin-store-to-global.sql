CREATE TABLE `admin_roles` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_priority` int NOT NULL DEFAULT '10',
  `role_name` varchar(64) DEFAULT NULL,
  `permission_admin_store_list` tinyint NOT NULL DEFAULT '0',
  `permission_admin_store_admin` tinyint NOT NULL DEFAULT '0',
  `permission_admin_store_create` tinyint NOT NULL DEFAULT '0',
  `permission_admin_store_info` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `role_id_UNIQUE` (`role_id`)
);
