<?php 
if ($asistencia==false){redirect('c_perfil');}
?>
<div class="section"><div class="container"><div class="row"><div class="col-md-12"><div class="page-header"><h1 class="text-primary">Ingreso de tareas<br>&nbsp;<small>Realizadas el día de hoy</small></h1></div></div></div></div></div>
    <div class="section">
      <div class="container">
        <div class="row">
          <div class="col-md-12">
            <form class="form-horizontal" role="form" method="post" action="<?= base_url(); ?>c_perfil/insertar_bitacora">
              <div class="form-group"> 
                <div class="col-sm-4 text-primary">
                  <label for="inputEmail3" class="control-label">Fecha Ingreso:
                    <?php date_default_timezone_set('America/Buenos_Aires');
                            $script_tz = date_default_timezone_get();    
                            $fechabsas = date('d-m-Y' , (strtotime ( $script_tz ))); 
                      echo $fechabsas;
                      ?>
                  </label>
                </div>
              </div>
              <div class="form-group">
                <div class="col-sm-2">
                  <label for="inputEmail3" class="control-label">Tarea</label>
                </div>
                <div class="col-sm-10">
                  <input type="text" class="form-control" id="tarea" name="tarea" placeholder="Ingrese el titulo de la tarea">
                </div>
              </div>
              <div class="form-group">
                <div class="col-sm-2">
                  <label for="inputPassword3" class="control-label">Descripción</label>
                </div>
                <div class="col-sm-10">
                  <textarea class="form-control" rows="10" id="descripcion" name="descripcion"></textarea>
                </div>
              </div>
              <div class="form-group">
                <div class="col-sm-offset-2 col-sm-10">
                  <button type="submit" class="btn btn-primary">Ingresar</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>


