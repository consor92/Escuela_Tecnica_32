<?php
$file = '/var/www/html/public/users.csv';
$content = file_get_contents($file);
// Detect UTF-16 and convert to UTF-8
if (substr($content, 0, 2) == "\xFF\xFE") {
    $content = mb_convert_encoding($content, "UTF-8", "UTF-16LE");
}
// Remove BOM if present
if (substr($content, 0, 3) == "\xEF\xBB\xBF") {
    $content = substr($content, 3);
}
file_put_contents($file, $content);
echo "Conversion of $file complete.\n";
?>