

<?php
echo '
<div class="container">
<div class="row">
<table class="table table-condensed table-striped">
<thead>
<tr>
    <th>Curso</th>
    <th>Profesor</th>
    <th>Lun</th>
    <th>Mar</th>
    <th>Mie</th>
    <th>Jue</th>
    <th>Vie</th>
    <th>Herramientas</th>
</tr>


</thead>
<tbody>';


foreach($cursos as $c){
    echo '<tr>
            <td>'.$c->nombre_curso.'</td>
            <td>'.$c->apellido.', '.$c->nombre.'</td>
            <td>'.$c->lun.'hs</td>
            <td>'.$c->mar.'hs</td>
            <td>'.$c->mie.'hs</td>
            <td>'.$c->jue.'hs</td>
            <td>'.$c->vie.'hs</td>
            <td><a href="'.base_url().'c_referrer/excel?curso='.$c->c_i.'"><img width="32" src="'.base_url().'assets/img/excel.png" alt="Excel"></a></td>
        </tr>';
}
echo '</tbody></table>';
?>



</table>
</div>
</div>


<td></td>
<td></td>
</tr>