<?php
require_once 'includes/db.php';
try {
    $stmt = $pdo->prepare("INSERT IGNORE INTO stickers (number, name, description, rarity, external_url) VALUES (51, 'MÁXIMO LOGRO', 'Premio final por completar la colección técnica.', 'gold', 'https://picsum.photos/seed/stk51/300/400')");
    $stmt->execute();
    echo "Sticker 51 ensured.";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
