<?php
require_once '../includes/db.php';
require_once '../includes/functions.php';

if (!isLoggedIn()) {
    jsonResponse(false, 'Debes iniciar sesión para enviar sugerencias');
}

$user = getCurrentUser($pdo);

// 1. Limitar a una sugerencia cada 24 horas por usuario
try {
    $stmtCheck = $pdo->prepare("SELECT created_at FROM suggestions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1");
    $stmtCheck->execute([$user['id']]);
    $lastSuggestion = $stmtCheck->fetch();

    if ($lastSuggestion) {
        $lastTime = strtotime($lastSuggestion['created_at']);
        $currentTime = time();
        $diffHours = ($currentTime - $lastTime) / 3600;

        if ($diffHours < 24) {
            $remainingHours = ceil(24 - $diffHours);
            jsonResponse(false, "Ya enviaste una sugerencia hoy. Vuelve en $remainingHours horas.");
        }
    }
} catch (Exception $e) {}

$category = cleanInput($_POST['category'] ?? 'idea');
$suggestion = cleanInput($_POST['suggestion'] ?? '');

// Validar categorías permitidas
$allowedCategories = ['bug', 'idea', 'mejora', 'otro'];
if (!in_array($category, $allowedCategories)) {
    $category = 'idea';
}

if (empty($suggestion)) {
    jsonResponse(false, 'La sugerencia no puede estar vacía');
}

if (strlen($suggestion) < 5) {
    jsonResponse(false, 'La sugerencia es muy corta');
}

// 2. Limitar a 255 caracteres
if (strlen($suggestion) > 255) {
    jsonResponse(false, 'La sugerencia es muy larga (máximo 255 caracteres)');
}

try {
    $stmt = $pdo->prepare("INSERT INTO suggestions (user_id, category, suggestion) VALUES (?, ?, ?)");
    $stmt->execute([$user['id'], $category, $suggestion]);
    jsonResponse(true, '¡Gracias! Tu sugerencia ha sido recibida.');
} catch (Exception $e) {
    jsonResponse(false, 'Error al guardar la sugerencia: ' . $e->getMessage());
}
?>