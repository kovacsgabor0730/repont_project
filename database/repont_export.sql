DROP TABLE IF EXISTS `machines`;

CREATE TABLE `machines` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `installation_date` datetime NOT NULL,
  `postal_code` int(11) NOT NULL,
  `public_space_name` varchar(255) NOT NULL,
  `public_space_type` varchar(255) NOT NULL,
  `house_number` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `machines` WRITE;
/*!40000 ALTER TABLE `machines` DISABLE KEYS */;

UNLOCK TABLES;
DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `products` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `type_number` varchar(255) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_product_name` (`product_name`),
  UNIQUE KEY `idx_products_product_name` (`product_name`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `recycling`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `recycling` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `machine` bigint(20) NOT NULL,
  `product` bigint(20) NOT NULL,
  `event_type` enum('success','error','warning') NOT NULL,
  `event_date` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_recycling_products` (`product`),
  KEY `FK_recycling_machines` (`machine`),
  KEY `idx_leaderboard_query` (`event_type`,`event_date`,`machine`,`product`),
  KEY `idx_recycling_event_date` (`event_date`),
  KEY `idx_recycling_machine_product_event_type` (`machine`,`product`,`event_type`),
  CONSTRAINT `FK_recycling_machines` FOREIGN KEY (`machine`) REFERENCES `machines` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_recycling_products` FOREIGN KEY (`product`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `CHK_event_date` CHECK (`event_date` >= '2025-01-01' and `event_date` < '2025-04-02')
) ENGINE=InnoDB AUTO_INCREMENT=120006 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `recycling` WRITE;

UNLOCK TABLES;

