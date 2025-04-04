-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: localhost    Database: wx_eit
-- ------------------------------------------------------
-- Server version	8.0.36

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `alarms`
--

DROP TABLE IF EXISTS `alarms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alarms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `device_id` int DEFAULT NULL,
  `alarm_type` varchar(50) DEFAULT NULL,
  `timestamp` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `device_id` (`device_id`),
  CONSTRAINT `alarms_ibfk_1` FOREIGN KEY (`device_id`) REFERENCES `devices` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alarms`
--

LOCK TABLES `alarms` WRITE;
/*!40000 ALTER TABLE `alarms` DISABLE KEYS */;
INSERT INTO `alarms` VALUES (1,NULL,'temperature_high','2025-03-19 13:32:51');
/*!40000 ALTER TABLE `alarms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `devices`
--

DROP TABLE IF EXISTS `devices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `devices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `status` enum('normal','fault') NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=104 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `devices`
--

LOCK TABLES `devices` WRITE;
/*!40000 ALTER TABLE `devices` DISABLE KEYS */;
INSERT INTO `devices` VALUES (101,'Device A','normal'),(102,'Device B','fault'),(103,'Device C','normal');
/*!40000 ALTER TABLE `devices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `repair_records`
--

DROP TABLE IF EXISTS `repair_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `repair_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `work_order_id` int DEFAULT NULL,
  `repair_steps` text,
  `replaced_parts` text,
  `tools_used` text,
  `repair_time` int DEFAULT NULL,
  `result` enum('success','failure') DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `work_order_id` (`work_order_id`),
  CONSTRAINT `repair_records_ibfk_1` FOREIGN KEY (`work_order_id`) REFERENCES `work_orders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `repair_records`
--

LOCK TABLES `repair_records` WRITE;
/*!40000 ALTER TABLE `repair_records` DISABLE KEYS */;
/*!40000 ALTER TABLE `repair_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sops`
--

DROP TABLE IF EXISTS `sops`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sops` (
  `id` int NOT NULL AUTO_INCREMENT,
  `device_id` int DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `version` int NOT NULL,
  `operator` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `device_id` (`device_id`),
  CONSTRAINT `sops_ibfk_1` FOREIGN KEY (`device_id`) REFERENCES `devices` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sops`
--

LOCK TABLES `sops` WRITE;
/*!40000 ALTER TABLE `sops` DISABLE KEYS */;
INSERT INTO `sops` VALUES (1,NULL,'testSOP01',1,'operator001','2025-03-31 02:22:24'),(2,NULL,'testSOP02',1,'operator002','2025-03-31 02:23:09'),(3,NULL,'testSOP03',1,'operator003','2025-03-31 02:23:16'),(4,NULL,'testSOP04',1,'operator003','2025-03-31 02:23:23'),(5,NULL,'testSOP02',1,'operator003','2025-03-31 02:23:34'),(6,NULL,'testSOP02',1,'operator002','2025-03-31 02:23:39'),(7,NULL,'testSOP02',1,'operator02','2025-03-31 02:23:48'),(8,NULL,'testSOP02',1,'operator02','2025-03-31 02:23:57'),(9,NULL,'testSOP02',1,'operator02','2025-03-31 02:25:14'),(10,NULL,'testSOP02',2,'operator02','2025-03-31 02:44:30'),(11,NULL,'testSOP02',3,'operator002','2025-03-31 02:44:55');
/*!40000 ALTER TABLE `sops` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `steps`
--

DROP TABLE IF EXISTS `steps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `steps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sop_id` int NOT NULL,
  `content` text NOT NULL,
  `images` json DEFAULT NULL,
  `step_order` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sop_id` (`sop_id`),
  CONSTRAINT `steps_ibfk_1` FOREIGN KEY (`sop_id`) REFERENCES `sops` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `steps`
--

LOCK TABLES `steps` WRITE;
/*!40000 ALTER TABLE `steps` DISABLE KEYS */;
INSERT INTO `steps` VALUES (44,1,'这是一个新步骤1','[{\"full\": \"/uploads/full/e201c018-8ecd-4ba1-9e6b-931cf2abfdfd.jpg\", \"thumbnail\": \"/uploads/thumbnail/e201c018-8ecd-4ba1-9e6b-931cf2abfdfd.jpg\"}]',2);
/*!40000 ALTER TABLE `steps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(20) NOT NULL,
  `username` varchar(50) NOT NULL,
  `role` enum('repair','operator','manager','admin') NOT NULL,
  `open_id_hash` varchar(64) NOT NULL,
  `status` enum('pending','approved','disabled','deleted') NOT NULL,
  `registration_code` varchar(8) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_id` (`employee_id`),
  UNIQUE KEY `open_id_hash` (`open_id_hash`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'ADMIN001','系统管理员','admin','f5b9a2f4022218994db03f82502f5925982a9c472372e10e82d002d338027c4c','approved','INITCODE','2025-03-28 06:11:29'),(2,'repair01','James Zhang','repair','609f8be6c059b37cbefe32b6981bd75221f6abaf37e8995c38daec8ab660e408','approved','78FKLMNE','2025-03-28 07:58:39'),(3,'repair02','James Lanist','operator','501e8c5a66a9eee54ed75fb9caaee06025af89276415dd17f77927893bdcf4e4','approved','VL3HXZAA','2025-03-30 05:53:54'),(4,'repair03','Hack Fang(已注销)','operator','da1ff64ab9e1e6c0d4e6dfd286d2f5f43e5dd01d5d314835f6be507a89ee76e7','deleted','BH5IT6HF','2025-03-30 13:52:27'),(5,'operator01','Uno Hawkins','operator','784155630a914bef0ac4d45fa95a6e43e2fc3dcc4d97298175416b86d7124f4b','disabled','TMX39YGR','2025-03-30 14:45:33');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_old`
--

DROP TABLE IF EXISTS `users_old`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_old` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(50) NOT NULL,
  `role` enum('worker','repair','admin') NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=204 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_old`
--

LOCK TABLES `users_old` WRITE;
/*!40000 ALTER TABLE `users_old` DISABLE KEYS */;
INSERT INTO `users_old` VALUES (201,'John Doe','123456','repair'),(202,'Jane Smith','123456','repair'),(203,'Alice Johnson','123456','repair');
/*!40000 ALTER TABLE `users_old` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `work_orders`
--

DROP TABLE IF EXISTS `work_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `work_orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `alarm_id` int DEFAULT NULL,
  `device_id` int DEFAULT NULL,
  `repairer_id` int DEFAULT NULL,
  `priority` enum('low','medium','high') DEFAULT NULL,
  `status` enum('pending','in_progress','completed') DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `alarm_id` (`alarm_id`),
  KEY `device_id` (`device_id`),
  KEY `repairer_id` (`repairer_id`),
  CONSTRAINT `work_orders_ibfk_1` FOREIGN KEY (`alarm_id`) REFERENCES `alarms` (`id`),
  CONSTRAINT `work_orders_ibfk_2` FOREIGN KEY (`device_id`) REFERENCES `devices` (`id`),
  CONSTRAINT `work_orders_ibfk_3` FOREIGN KEY (`repairer_id`) REFERENCES `users_old` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `work_orders`
--

LOCK TABLES `work_orders` WRITE;
/*!40000 ALTER TABLE `work_orders` DISABLE KEYS */;
INSERT INTO `work_orders` VALUES (4,1,101,201,'high','pending','2025-03-19 13:47:31','2025-03-19 13:47:31'),(5,1,101,201,'high','pending','2025-03-19 19:43:07','2025-03-19 19:43:07'),(6,1,101,201,'high','pending','2025-03-19 19:44:18','2025-03-19 19:44:18'),(7,1,101,201,'high','pending','2025-03-19 19:44:35','2025-03-19 19:44:35'),(8,1,101,201,'high','pending','2025-03-19 19:44:44','2025-03-19 19:44:44'),(9,1,101,201,'high','pending','2025-03-19 19:47:23','2025-03-19 19:47:23'),(10,1,101,201,'high','pending','2025-03-19 19:57:16','2025-03-19 19:57:16');
/*!40000 ALTER TABLE `work_orders` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-04 21:19:44
