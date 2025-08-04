<body>
<div class="section section-info">
      <div class="container">
        <div class="row">
          <div class="col-md-12">
              <h1>Bitacoras</h1>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="container">
        <div class="row">
                <form class="form-horizontal" role="form" method="post" action="<?= base_url('c_theacher/bitacoras'); ?>">
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
    <?php
if (isset($bitacoras)){
  if($bitacoras!=null){
echo '<div class="container">';
    $bandera=null;
      foreach($alumnos as $alumno){
           
        if($bandera!=$alumno->id){
            $bandera=$alumno->id;
            echo '<!-- Button trigger modal -->
            <div class="col-sm-3 mb-3">
                <button type="button" class="d-flex align-items-center" data-toggle="modal" data-target="#Modal'.$alumno->id.'">
                '.$alumno->apellido.', '.$alumno->nombre.'
                </button>

                <!-- Modal -->
                <div class="modal fade" id="Modal'.$alumno->id.'" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg" role="document">
                    <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title" id="exampleModalLabel">Bitacoras -  '.$alumno->apellido.', '.$alumno->nombre.'</h3>
                    </div>
                    <div class="modal-body">
                   ';

                   echo'
                   <table class="table table-striped col">
                   <thead class="thead-inverse">
                                       <tr>
                                           <th>Fecha de carga</th>
                                           <th>Tarea</th>
                                           <th>Herramientas</th>
                                       </tr>
                                   
                   </thead>';
                    foreach($bitacoras as $b){

                        if($b->id==$alumno->id){
                            echo'<div class="row"><tr data-toggle="collapse" data-target="#collapse'.$b->id_b.'">
                            <td class="col-3">'.date('d-m <b>Y</b>' , (strtotime ( $b->fecha_de_carga ))).'</td>
                            <td class="col-6">'.$b->titulo.'</td>
                            <td class="col-3">
                                <button type="button" class="btn btn-primary btn-ms" data-toggle="collapse" data-target="#collapse'.$b->id_b.'">
                                    
                                    <i class="fas fa-eye"></i>
                                </button>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="3">
            <!--       ============================ -->
                                <div id="collapse'.$b->id_b.'" class="panel-collapse collapse out">
                                    <div class="panel-body">        
                                        <textarea class="form-control" rows="10" id="descripcion" name="descripcion" disabled>'.$b->descripcion.'</textarea>             
                                    </div>
                                </div>
            <!--       ============================ -->
            
                            </td>
        
                        </tr></div>';

                        }
                       ;
                    }
                    echo'</table></div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    </div>
                    </div>
                </div>
                </div></div>';




        } 

      }

    }else{echo '  
      <div class="alert alert-danger " role="alert">
      <strong>Alerta! </strong>Curso sin estudiantes...
      </div></div>';}
    }
    
?>


<script>
  $(function(){ $('.alumno').bootstrapToggle() });
</script>