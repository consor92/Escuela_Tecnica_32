<?php
$host = 'db';
$db   = 'scrum_eval';
$user = 'admin';
$pass = 'admin123';
$dsn = "mysql:host=$host;dbname=$db;charset=utf8mb4";
try {
    $pdo = new PDO($dsn, $user, $pass);
    $pdo->exec("ALTER TABLE evaluation_periods ADD COLUMN is_active TINYINT(1) DEFAULT 0");
    echo "Column added successfully.";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>