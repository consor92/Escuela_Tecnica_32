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
              <h1>Asistencia</h1>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="container">
        <div class="row">
                <form class="form-horizontal" role="form" method="post" action="<?= base_url().'c_theacher'; ?>">
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
            <form class="form-horizontal" role="form" method="post" action="c_theacher/presentes">

<?php
if (isset($alumnos)){
  if($alumnos!=null){
    echo '<input type="hidden" name="cursote" id="cursote" value="'.$curso_id.'">';
      foreach($alumnos as $alumno){
          echo '<div class="form-group">
                  <div class="col-sm-offset-2 col-sm-10">
                    <div class="checkbox">
                      <label>
                      <input type="checkbox" id="alumno" name="alumno[]" data-toggle="toggle" 
                      data-on="Presente"
                      data-off="Ausente" 
                      data-onstyle="success" data-offstyle="danger"'; 
               if ($alumno->presentismo=='1'){echo ' checked ';} 
              echo     'value="'.$alumno->id.'">'.$alumno->apellido.', '.$alumno->nombre.'</label>
              
                    </div>
                  </div>
                </div>
                
                
                ';
      }
     echo '<input type="submit" class="btn btn-primary" value="Guardar">
     </form>'; 
    }else{echo '  
      <div class="alert alert-danger " role="alert">
      <strong>Alerta! </strong>Curso sin estudiantes...
      </div>';}
    }
    
?>


<script>
  $(function(){ $('.alumno').bootstrapToggle() });
</script>
  
</body>

