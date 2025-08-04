<?php
foreach($curse as $cu){
        header("Pragma: public");
        header("Expires: 0");
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header("Cache-Control: must-revalidate, post-check=0, pre-check=0"); 
        header("Content-Type: application/force-download");
        header("Content-Type: application/octet-stream");
        header("Content-Type: application/download");;
        header('Content-Disposition: attachment; filename='.$cu->nombre_curso.'.xls');
        header('Content-type: application/force-download');
        header('Content-Transfer-Encoding: binary');
        header('Pragma: public');}

?>
<table>
<tr>
    <th colspan="8">Curso: Datos de Alumnos</th>
</tr>
<tr>
    <th>Apellido</th>
    <th>Nombre</th>
    <th>Dirección</th>
    <th>Nacionalidad</th>
    <th>Fecha de Nacimiento</th>
    <th>Edad</th>
    <th>CUIL</th>
    <th>DNI</th>
    <th>Email</th>
    <th>Telefono</th>
    <th>Telefono Alternativo</th>
</tr>
<?php
foreach($alumnos as $alumno){
    $cumpleanos = new DateTime($alumno->nacimiento);
    $hoy = new DateTime();
    $annos = $hoy->diff($cumpleanos);
    

   echo '<tr>
    <td>'.$alumno->apellido.'</td>
    <td>'.$alumno->nombre.'</td>
    <td>'.$alumno->direccion.'</td>
    <td>'.$alumno->nacionalidad.'</td>
    <td>'.date('d-m-Y',strtotime($alumno->nacimiento)).'</td>
    <td>'.$annos->y.'</td>
    <td>'.$alumno->cuil.'</td>
    <td>'.$alumno->dni.'</td>
    <td>'.$alumno->email.'</td>
    <td>'.$alumno->telefono.'</td>
    <td>'.$alumno->telefono_alternativo.'</td>
</tr>';

}
?>

</table>