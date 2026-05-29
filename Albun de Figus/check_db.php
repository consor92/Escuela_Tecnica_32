<?php
require_once 'includes/db.php';
$stmt = $pdo->query("SELECT * FROM settings");
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
?>