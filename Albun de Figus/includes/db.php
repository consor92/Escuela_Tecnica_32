<?php
/**
 * Conexión a la Base de Datos mediante PDO
 * Optimizado para seguridad y compatibilidad con hosting compartido.
 */

$host = 'localhost';
$db   = 'album_32';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
     $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
     // En producción, no mostrar el error detallado para evitar fugas de información
     error_log($e->getMessage());
     die("Error de conexión. Por favor, intente más tarde.");
}
?>
