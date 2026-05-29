<?php
require_once 'includes/db.php';
try {
    $pdo->exec("ALTER TABLE promo_codes ADD COLUMN max_uses INT DEFAULT 50");
    echo "Columna max_uses añadida.";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>