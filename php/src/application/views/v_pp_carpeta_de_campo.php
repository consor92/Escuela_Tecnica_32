<?php 
//if ($asistencia==false){redirect('c_perfil');}
$archivo='';
$fecha='';
$usuario='';
foreach($datos_carpeta_de_campo as $fila)
{
$archivo=$fila->nombre_archivo;
$info = new SplFileInfo($archivo);
$extension=($info->getExtension());
$fecha=$fila->fecha;
$usuario=$fila->apellido;    
}
?>
<div class="section"><div class="container"><div class="row"><div class="col-md-12"><div class="page-header"><h1 class="text-primary">Carpeta de campo<br>&nbsp;<small>Este archivo lo deberás subir todos los días de PP, inclusive si estas en Prácticas externas</small></h1></div></div></div></div></div>
    <div class="section">
      <div class="container">
        <div class="row">
         <div class="col-md-3">
             <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Archivo</th>
                    <th>Fecha de Subida</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
    <?php 
    if (($archivo =='')or($usuario =='')or($fecha=='')){
       echo "<td>Falta</td><td>Falta</td>";  
                        }  
    else{
          echo"<td><a href='".base_url()."assets/carpetas/".$archivo."' download='".$usuario.".".$extension."'><span class='glyphicon glyphicon-file'></span><span class='glyphicon glyphicon-download-alt'></span></a> 
                    </td>
                    <td>".$fecha."</td>";     
        
    }
    ?> 

                  </tr>
                </tbody>
              </table>
            </div>
         </div>
          <div class="col-md-12">
            <form class="form-horizontal" role="form" method="post" enctype="multipart/form-data" action="<?= base_url(); ?>c_perfil/cargar_carpeta_de_campo">
              <div class="form-group"> 
                <input type="file" name="mi_carpeta" accept=".pdf,.doc,.docx">
              </div>
              <div class="form-group">
                <div class="col-sm-offset-2 col-sm-10">
                  <button type="submit" class="btn btn-primary">Subir</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>


