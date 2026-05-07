<?php
require_once 'config/db.php';
$csvFile = 'public/users.csv';
echo "Checking file: $csvFile\n";
if (file_exists($csvFile)) {
    echo "File exists.\n";
    $handle = fopen($csvFile, "r");
    if ($handle !== FALSE) {
        $count = 0;
        while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
            $count++;
            if ($count > 5) break;
            print_r($data);
        }
        fclose($handle);
        echo "Read $count lines.\n";
    } else {
        echo "Could not open file.\n";
    }
} else {
    echo "File does not exist.\n";
}
?>