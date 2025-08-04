<?php
date_default_timezone_set('America/Buenos_Aires');
$script_tz = date_default_timezone_get();    
$fechabsas = date('d-m-Y' , (strtotime ( $script_tz )));

$fecha_maxima = strtotime("19-11-2008 19:30:00");
 foreach($bitacora_user as $w)
{

     
$fecha_entrada = strtotime(date('d-m-Y' , (strtotime ( $w->fecha_de_carga ))));
	
if($fecha_maxima < $fecha_entrada)
	{
	$fecha_maxima = $fecha_entrada;
	}
}

$fecha_hoy = strtotime(date('d-m-Y' , (strtotime ( $fechabsas ))));
if (($fecha_maxima < $fecha_hoy)and($asistencia==true)) {
  echo'  <div class="section">
    <div class="container">
        <div class="row">
            <div class="col-md-12">
                <a href="'.base_url().'c_perfil/add_bitacora" class="btn btn-large btn-success">Agregar Bitacora</a>
            </div>
        </div>
    </div>
</div>';
}

 
if (sizeof($bitacora_user)>0){
        echo '<div class="section">
                <div class="container">
                    <div class="row">
                        <div class="col-md-12">
              <table class="table table-hover table-striped">
                                <thead class="thead-inverse">
                                    <tr>
                                        <th>Fecha de carga</th>
                                        <th>Tarea</th>
                                        <th>Herramientas</th>
                                    </tr>
                                </thead>';
 foreach($bitacora_user as $fila)
{


if(date("d-m-Y", strtotime($fila->fecha_de_carga))==$fechabsas)
{
    $hoy=true;
    echo '<tr class="success" data-toggle="collapse" data-target="#collapse'.$fila->id.'">';                                                             
                                                                  
                                                                  
}else{$hoy=false;
     echo '<tr data-toggle="collapse" data-target="#collapse'.$fila->id.'">';

     }

echo "<td>".date("d-m-Y", strtotime($fila->fecha_de_carga))."</td>";
echo "<td>".$fila->titulo."</td><td>";
     
     
if($hoy){   
echo '<a href="'.base_url().'c_perfil/ultima_bitacora" class="btn btn-primary btn-ms" onclick="'.$fila->id.'">
            <i class="glyphicon glyphicon-edit"></i>
        </a>';
     
}
     
echo  '<button type="button" class="btn btn-primary btn-ms" data-toggle="collapse" data-target="#collapse'.$fila->id.'">
            <i class="glyphicon glyphicon-eye-open"></i>
        </button></td>';
echo"</tr>";
echo"<tr>";

echo '<td colspan="3">
    <!--       ============================ -->

                <div id="collapse'.$fila->id.'" class="panel-collapse collapse out">
                    <div class="panel-body">        
                        <textarea class="form-control" rows="10" id="descripcion" name="descripcion" disabled>'.$fila->descripcion.'</textarea>             
                    </div>
                </div>

    <!--       ============================ -->
    </td>
</tr> ';      
        
}     
    
echo "            </table>
          </div>
        </div>
      </div>
    </div>   ";                  

    
    
}else{echo "<h1 align='center'>Por el momento usted no ha ingresado bitacoras!!!</h1>";}
?>             



