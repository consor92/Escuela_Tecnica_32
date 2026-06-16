<?php
require_once 'includes/db.php';

$duplicates_found = 0;
for ($i = 0; $i < 100; $i++) {
    $stmt = $pdo->query("SELECT id FROM trivias WHERE is_active = 1 ORDER BY RAND() LIMIT 3");
    $ids = $stmt->fetchAll(PDO::FETCH_COLUMN);
    if (count($ids) !== count(array_unique($ids))) {
        $duplicates_found++;
        echo "Intento $i: Duplicados encontrados! IDs: " . implode(',', $ids) . "\n";
    }
}

if ($duplicates_found === 0) {
    echo "Prueba completada: 100 intentos, 0 duplicados encontrados en la consulta SQL.\n";
} else {
    echo "Prueba completada: Se encontraron $duplicates_found casos con duplicados.\n";
}
?>
