<?php
$pdo = new PDO("mysql:host=db;dbname=scrum_eval", "admin", "admin123");
$pdo->exec("CREATE TABLE IF NOT EXISTS settings (id INT PRIMARY KEY, key_name VARCHAR(50) UNIQUE, val TINYINT(1))");
$pdo->exec("INSERT IGNORE INTO settings (id, key_name, val) VALUES (1, 'evaluations_enabled', 1)");
echo "Settings initialized.";
?>