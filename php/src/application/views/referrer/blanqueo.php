<?php

date_default_timezone_set('America/Buenos_Aires');
$script_tz = date_default_timezone_get();    
$fechabsas = date('Y-m-d' , (strtotime ( $script_tz )));
?>  
<body>
    <div class="section section-info">
      <div class="container">
        <div class="row">
          <div class="col-md-12">
          <h1>Blanqueo de Password</h1>
              <h5 >El blanqueo permite cambiar la contraseña automaticamente por otra 12345678</h5>
              <h5 class="text-light">Solicitar al alumno que ingrese al sistema y la cambie.</h5>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="container">
        <div class="row">
                <form class="form-horizontal" role="form" method="post" action="<?= base_url('c_theacher/blanqueo'); ?>">
          <div class="col-md-12">
              <div class="form-group">
                <div class="col-sm-1">
                  <label class="control-label">Curso</label>
                </div>
                <div class="col-sm-3">
                  <select class="form-control" name="curso" id="curso">
  <?php 
        foreach($cursos as $w)
                {
                  if ($curso_id==$w->id){echo "<option selected='true' value=".$w->id.">".$w->nombre_curso."</option>";}
                  else{
                    echo "<option value=".$w->id.">".$w->nombre_curso."</option>";
                  }
                    

                }

?> 
                    
                  </select>
                </div>
                <div class="col-sm-2">
                  <button type="submit" class="btn btn btn-success">Listar Alumnos</button>
                </div>
                <div class="col-sm-offset-6 col-sm-6">
                </div>
              </div>
              </div>
            </form>
          
        </div>
      </div>
    </div>
<!-- Alumnos -->
<div class="col-md-12">
            <hr>
</div>
    <div class="section">
      <div class="container">
        <div class="row">
          <div class="col-md-12">

<?php
if (isset($alumnos)){
  if($alumnos!=null){
    
         echo' <table border="2">
          <tr>
        <th>Alumno</th>
        <th>Email</th>
        <th></th>
        </tr>  ';
        foreach($alumnos as $alumno){
                        {
                    
                    echo' <tr>
                            <td>'.$alumno->apellido.', '.$alumno->nombre.'</td>
                            <td>'.$alumno->email.'<td>
                            <td><a href="'.base_url('c_theacher/blanqueo').'?a='.$alumno->id.'"><i class="material-icons">https</i></a></td>
                            
                        </tr>  ';
                        }
        



      }
      echo "</table>";
    }else{echo '  
      <div class="alert alert-danger " role="alert">
      <strong>Alerta! </strong>Curso sin estudiantes...
      </div>';}
    }
    



if(isset($pwd_change)){
  if(($pwd_change)==true)
{echo '
  <div class="modal fade" id="mostrarmodal" tabindex="-1" role="dialog" aria-labelledby="basicModal" aria-hidden="true">
  <div class="modal-dialog">

  <div class="alert alert-success " role="alert">
  <strong>Perfecto!!!</strong>Se ha actualizado correctamente...
  </div>
  </div>  
  
  
<script type="text/javascript">
  $( document ).ready(function() {
    $("#mostrarmodal").modal("show");
  });  
</script>';}else{
  echo '
  <div class="modal fade" id="mostrarmodal" tabindex="-1" role="dialog" aria-labelledby="basicModal" aria-hidden="true">
  <div class="modal-dialog">

  <div class="alert alert-danger " role="alert">
  <strong>Alerta! </strong>lo sentimos..pero no se pudo actualizar
  </div>
  </div>  
  
  
<script type="text/javascript">
  $( document ).ready(function() {
    $("#mostrarmodal").modal("show");
  });  
</script>';  
}}
?>
<script>
  $(function(){ $('.alumno').bootstrapToggle() });
</script>
  
</body>

