<?php
/*
 * BrownieBites - Database Installer
 * This file creates the database and all required tables.
 * Run this file ONCE in your browser to set up the application.
 *
 * ! IMPORTANT !
 * For security, DELETE THIS FILE after you have run it successfully.
 */

// --- Database Configuration ---
$db_host = "127.0.0.1";
$db_user = "root";
$db_pass = ""; // set local DB password (left blank for generic GitHub repo)
$db_name = "browniebites_db";

// --- Default Admin Configuration ---
$admin_name = "Admin";
$admin_email = "admin@browniebites.com";
$admin_pass = "admin123"; // Default password, will be hashed

// --- 1. Connect to MySQL Server ---
$conn = new mysqli($db_host, $db_user, $db_pass);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// --- 2. Create Database ---
$sql_create_db = "CREATE DATABASE IF NOT EXISTS $db_name CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci";
if ($conn->query($sql_create_db) === TRUE) {
    echo "Database '$db_name' created or already exists.<br>";
} else {
    die("Error creating database: " . $conn->error . "<br>");
}

// --- 3. Select the Database ---
$conn->select_db($db_name);

// --- 4. SQL Table Definitions ---
$sql_queries = [
    // --- Users Table ---
    "CREATE TABLE IF NOT EXISTS `users` (
      `user_id` INT AUTO_INCREMENT PRIMARY KEY,
      `name` VARCHAR(100) NOT NULL,
      `email` VARCHAR(100) NOT NULL UNIQUE,
      `phone` VARCHAR(20) NOT NULL UNIQUE,
      `password` VARCHAR(255) NOT NULL,
      `rewards_points` INT DEFAULT 0,
      `tier` ENUM('Silver', 'Gold', 'Choco Elite') DEFAULT 'Silver',
      `date_joined` DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;",

    // --- Admin Table ---
    "CREATE TABLE IF NOT EXISTS `admin` (
      `admin_id` INT AUTO_INCREMENT PRIMARY KEY,
      `name` VARCHAR(100) NOT NULL,
      `email` VARCHAR(100) NOT NULL UNIQUE,
      `password` VARCHAR(255) NOT NULL,
      `role` VARCHAR(50) DEFAULT 'Manager',
      `last_login` DATETIME NULL
    ) ENGINE=InnoDB;",

    // --- Menu Items Table ---
    "CREATE TABLE IF NOT EXISTS `menu_items` (
      `item_id` INT AUTO_INCREMENT PRIMARY KEY,
      `name` VARCHAR(150) NOT NULL,
      `description` TEXT,
      `price` DECIMAL(10, 2) NOT NULL,
      `image_url` VARCHAR(255),
      `available` BOOLEAN DEFAULT 1,
      `date_added` DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;",

    // --- Orders Table ---
    "CREATE TABLE IF NOT EXISTS `orders` (
      `order_id` INT AUTO_INCREMENT PRIMARY KEY,
      `user_id` INT NOT NULL,
      `items` JSON NOT NULL,
      `total_amount` DECIMAL(10, 2) NOT NULL,
      `payment_method` VARCHAR(50) NOT NULL,
      `status` ENUM('Placed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled') DEFAULT 'Placed',
      `order_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
      `eta` VARCHAR(50) NULL,
      FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`)
    ) ENGINE=InnoDB;",

    // --- Payments Table ---
    "CREATE TABLE IF NOT EXISTS `payments` (
      `payment_id` INT AUTO_INCREMENT PRIMARY KEY,
      `order_id` INT NOT NULL,
      `amount` DECIMAL(10, 2) NOT NULL,
      `method` VARCHAR(50) NOT NULL,
      `transaction_id` VARCHAR(255) NULL,
      `status` ENUM('Success', 'Failed', 'Pending') DEFAULT 'Pending',
      `payment_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (`order_id`) REFERENCES `orders`(`order_id`)
    ) ENGINE=InnoDB;",

    // --- Offers Table ---
    "CREATE TABLE IF NOT EXISTS `offers` (
      `offer_id` INT AUTO_INCREMENT PRIMARY KEY,
      `title` VARCHAR(255) NOT NULL,
      `description` TEXT,
      `discount_percent` INT DEFAULT 0,
      `valid_till` DATE NULL,
      `active` BOOLEAN DEFAULT 1
    ) ENGINE=InnoDB;",

    // --- Notifications Table ---
    "CREATE TABLE IF NOT EXISTS `notifications` (
      `notification_id` INT AUTO_INCREMENT PRIMARY KEY,
      `title` VARCHAR(255) NOT NULL,
      `message` TEXT NOT NULL,
      `audience` VARCHAR(50) DEFAULT 'All',
      `date_sent` DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;"
];

// --- 5. Execute Table Creation ---
echo "Creating tables...<br>";
foreach ($sql_queries as $sql) {
    if ($conn->query($sql) === TRUE) {
        // success
    } else {
        echo "Error creating table: " . $conn->error . "<br>";
    }
}
echo "All tables created successfully.<br>";

// --- 6. Insert Default Admin User ---
$hashed_password = password_hash($admin_pass, PASSWORD_DEFAULT);

// Use prepared statement to prevent SQL injection and handle potential errors
$stmt = $conn->prepare("INSERT INTO `admin` (name, email, password, role) VALUES (?, ?, ?, 'Owner') ON DUPLICATE KEY UPDATE name = ?");
$stmt->bind_param("ssss", $admin_name, $admin_email, $hashed_password, $admin_name);

if ($stmt->execute()) {
    echo "Default admin user created/updated successfully.<br>";
    echo "Email: <b>$admin_email</b><br>";
    echo "Password: <b>$admin_pass</b><br>";
} else {
    echo "Error inserting default admin: " . $stmt->error . "<br>";
}
$stmt->close();
$conn->close();

echo "<h2>Installation Complete!</h2>";
echo "<p>Please <b>DELETE this file (install.php)</b> from your server for security.</p>";
echo "<a href=\"login.php\" style=\"font-size: 20px; padding: 10px 20px; background-color: #4B2E05; color: white; text-decoration: none; border-radius: 5px;\">Go to User Login</a><br><br>";
echo "<a href=\"admin/login.php\" style=\"font-size: 20px; padding: 10px 20px; background-color: #333; color: white; text-decoration: none; border-radius: 5px;\">Go to Admin Login</a>";

?>
