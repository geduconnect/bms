-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 01, 2026 at 09:08 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `bms`
--

-- --------------------------------------------------------

--
-- Table structure for table `challans`
--

CREATE TABLE `challans` (
  `id` int(11) NOT NULL,
  `challan_no` varchar(50) DEFAULT NULL,
  `university` varchar(255) NOT NULL,
  `igc_name` varchar(255) NOT NULL,
  `igc_address` text DEFAULT NULL,
  `igc_mobile` varchar(20) DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `specialization` varchar(255) DEFAULT NULL,
  `semester` varchar(50) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `status` enum('INITIATED','PACKED','DISPATCHED','DELIVERED') DEFAULT 'INITIATED',
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `igc_user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `challans`
--

INSERT INTO `challans` (`id`, `challan_no`, `university`, `igc_name`, `igc_address`, `igc_mobile`, `subject`, `specialization`, `semester`, `quantity`, `status`, `created_by`, `created_at`, `igc_user_id`) VALUES
(1, 'CH-1767296700872', 'VGU ODL', 'IGC User', NULL, NULL, 'BBA', 'FULL STACK DEVELOPEMENT', '1', 50, '', 1, '2026-01-01 19:45:00', 5);

-- --------------------------------------------------------

--
-- Table structure for table `challan_history`
--

CREATE TABLE `challan_history` (
  `id` int(11) NOT NULL,
  `challan_id` int(11) NOT NULL,
  `status` enum('INITIATED','PACKED','DISPATCHED','DELIVERED') DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `challan_history`
--

INSERT INTO `challan_history` (`id`, `challan_id`, `status`, `remarks`, `updated_by`, `created_at`) VALUES
(1, 1, 'INITIATED', NULL, 1, '2026-01-01 19:45:00'),
(2, 1, '', NULL, 1, '2026-01-01 20:01:12');

-- --------------------------------------------------------

--
-- Table structure for table `challan_items`
--

CREATE TABLE `challan_items` (
  `id` int(11) NOT NULL,
  `challan_id` int(11) NOT NULL,
  `stock_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `challan_items`
--

INSERT INTO `challan_items` (`id`, `challan_id`, `stock_id`, `quantity`, `created_at`) VALUES
(1, 1, 2, 50, '2026-01-01 19:45:00');

-- --------------------------------------------------------

--
-- Table structure for table `igc_profiles`
--

CREATE TABLE `igc_profiles` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `address` text DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ordered_stock`
--

CREATE TABLE `ordered_stock` (
  `id` int(11) NOT NULL,
  `university` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `specialization` varchar(255) DEFAULT NULL,
  `semester` varchar(50) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `vendor` varchar(255) DEFAULT NULL,
  `order_date` date DEFAULT NULL,
  `status` enum('ORDERED','PARTIAL','COMPLETED') DEFAULT 'ORDERED',
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ordered_stock`
--

INSERT INTO `ordered_stock` (`id`, `university`, `subject`, `specialization`, `semester`, `quantity`, `vendor`, `order_date`, `status`, `created_by`, `created_at`) VALUES
(1, 'VGU ODL', 'BCA', 'GENERAL', '1', 500, 'ABC PUBLICATION', '2026-01-01', 'COMPLETED', NULL, '2026-01-01 17:50:54');

-- --------------------------------------------------------

--
-- Table structure for table `received_stock`
--

CREATE TABLE `received_stock` (
  `id` int(11) NOT NULL,
  `ordered_stock_id` int(11) DEFAULT NULL,
  `university` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `specialization` varchar(255) DEFAULT NULL,
  `semester` varchar(50) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `received_date` date DEFAULT NULL,
  `received_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `received_stock`
--

INSERT INTO `received_stock` (`id`, `ordered_stock_id`, `university`, `subject`, `specialization`, `semester`, `quantity`, `received_date`, `received_by`, `created_at`) VALUES
(1, 1, 'VGU ODL', 'BCA', 'GENERAL', '1', 500, NULL, NULL, '2026-01-01 17:57:43'),
(2, 1, 'VGU ODL', 'BCA', 'GENERAL', '1', 500, NULL, NULL, '2026-01-01 17:59:26');

-- --------------------------------------------------------

--
-- Table structure for table `stock`
--

CREATE TABLE `stock` (
  `id` int(11) NOT NULL,
  `university` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `specialization` varchar(255) DEFAULT NULL,
  `semester` varchar(50) DEFAULT NULL,
  `available_qty` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stock`
--

INSERT INTO `stock` (`id`, `university`, `subject`, `specialization`, `semester`, `available_qty`, `created_at`) VALUES
(1, 'VGU ODL', 'BCA', 'CYBER SECURITY', '1', 500, '2026-01-01 17:03:22'),
(2, 'VGU ODL', 'BBA', 'FULL STACK DEVELOPEMENT', '1', 450, '2026-01-01 17:28:01'),
(3, 'VGU ODL', 'BCA', 'GENERAL', '1', 1000, '2026-01-01 17:57:43');

-- --------------------------------------------------------

--
-- Table structure for table `stock_history`
--

CREATE TABLE `stock_history` (
  `id` int(11) NOT NULL,
  `stock_id` int(11) NOT NULL,
  `type` enum('RECEIVED','ISSUED') NOT NULL,
  `quantity` int(11) NOT NULL,
  `ref_table` varchar(50) DEFAULT NULL,
  `ref_id` int(11) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stock_history`
--

INSERT INTO `stock_history` (`id`, `stock_id`, `type`, `quantity`, `ref_table`, `ref_id`, `created_by`, `created_at`) VALUES
(1, 3, 'RECEIVED', 500, 'received_stock', 1, NULL, '2026-01-01 17:59:26'),
(2, 2, 'ISSUED', 50, 'challans', 1, 1, '2026-01-01 19:45:00');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('SUPER_ADMIN','ADMIN','WAREHOUSE','DISPATCH','IGC') DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` tinyint(1) DEFAULT 1,
  `address` varchar(255) DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `gst_no` varchar(20) DEFAULT NULL,
  `contact_person` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`, `status`, `address`, `mobile`, `gst_no`, `contact_person`) VALUES
(1, 'Super Admin', 'super@bms.com', '$2b$10$PeZ3jYuUIlvic2XNJPwIVeku4Wo4s6wmptvUX8QQGTauZIyGRv8pm', 'SUPER_ADMIN', '2026-01-01 16:18:53', 1, NULL, NULL, NULL, NULL),
(2, 'Admin', 'admin@bms.com', '$2b$10$PeZ3jYuUIlvic2XNJPwIVeku4Wo4s6wmptvUX8QQGTauZIyGRv8pm', 'ADMIN', '2026-01-01 16:18:53', 1, NULL, NULL, NULL, NULL),
(3, 'Warehouse User', 'warehouse@bms.com', '$2b$10$PeZ3jYuUIlvic2XNJPwIVeku4Wo4s6wmptvUX8QQGTauZIyGRv8pm', 'WAREHOUSE', '2026-01-01 16:18:53', 1, NULL, NULL, NULL, NULL),
(4, 'Dispatch User', 'dispatch@bms.com', '$2b$10$PeZ3jYuUIlvic2XNJPwIVeku4Wo4s6wmptvUX8QQGTauZIyGRv8pm', 'DISPATCH', '2026-01-01 16:18:53', 1, NULL, NULL, NULL, NULL),
(5, 'IGC User', 'igc@bms.com', '$2b$10$PeZ3jYuUIlvic2XNJPwIVeku4Wo4s6wmptvUX8QQGTauZIyGRv8pm', 'IGC', '2026-01-01 16:18:53', 1, NULL, NULL, NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `challans`
--
ALTER TABLE `challans`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `challan_no` (`challan_no`),
  ADD KEY `igc_user_id` (`igc_user_id`);

--
-- Indexes for table `challan_history`
--
ALTER TABLE `challan_history`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `challan_items`
--
ALTER TABLE `challan_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `igc_profiles`
--
ALTER TABLE `igc_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `ordered_stock`
--
ALTER TABLE `ordered_stock`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `received_stock`
--
ALTER TABLE `received_stock`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `stock`
--
ALTER TABLE `stock`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `stock_history`
--
ALTER TABLE `stock_history`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `challans`
--
ALTER TABLE `challans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `challan_history`
--
ALTER TABLE `challan_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `challan_items`
--
ALTER TABLE `challan_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `igc_profiles`
--
ALTER TABLE `igc_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ordered_stock`
--
ALTER TABLE `ordered_stock`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `received_stock`
--
ALTER TABLE `received_stock`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `stock`
--
ALTER TABLE `stock`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `stock_history`
--
ALTER TABLE `stock_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `challans`
--
ALTER TABLE `challans`
  ADD CONSTRAINT `challans_ibfk_1` FOREIGN KEY (`igc_user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `igc_profiles`
--
ALTER TABLE `igc_profiles`
  ADD CONSTRAINT `igc_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
