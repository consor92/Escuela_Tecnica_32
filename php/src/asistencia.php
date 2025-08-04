<?php
echo "hola gonza!!!";
    $host = "sql206.epizy.com";
    $user = "epiz_27864677";
    $password = "Esdrujula2023";
    $baseDatos = "epiz_27864677_encuentro";
  
    $conexion = new mysqli($host,$user,$password,$baseDatos);
    if($conexion->connect_errno)
    {
        echo "Error de Conexión con la Base de Datos ".$conexion->connect_error."</br>";
        exit();
    }
    else
    {   
        echo "Conectados al Servidor y listos para utilizar la Base de Datos ".$baseDatos."</br>";
    }
$usuario= $_GET['usuario'];
$serial=$_GET['serial'];

$con= "SELECT * FROM asistencia WHERE ((usuario=".$usuario.") AND (serial='".$serial."') AND (fecha= CURDATE()));";
$result = $conexion->query($con);
if($result->num_rows==0){
$con1="INSERT INTO asistencia (usuario, serial, fecha) VALUES ('".$usuario."','".$serial."',CURDATE())";
$result_insert = $conexion->query($con1);
$result_insert->close();
}
$result->close();
?>