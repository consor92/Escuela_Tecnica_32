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
                <form class="form-horizontal" role="form" method="post" action="<?= base_url('c_theacher/carpeta_de_campo'); ?>">
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
if (isset($campo)){
  if($campo!=null){
echo '<div class="container">
<table class="table">
  <tr>
<th>Apellido</th>
<th>Nombre</th>
<th>Cargado</th>
<th></th>
</tr>';
      foreach($campo as $carpetas){
            echo' <tr>
            <td>'.$carpetas->apellido.'</td>
            <td>'.$carpetas->nombre.'</td>
            <td>'.$carpetas->fecha.'</td>
            <td><a download="'.$carpetas->apellido.'_'.$carpetas->nombre.'" href="'.base_url().'/assets/carpetas/'.$carpetas->nombre_archivo.'">Descargar</a></td>
            </tr>  ';  
        } 
        echo"</table>";
      }

    }
    
?>


