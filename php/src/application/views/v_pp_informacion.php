<?php foreach($datos_user_all as $fila)
{  ?>
  <div class="section">
      <div class="container">
        <div class="row">
          <div class="col-md-6 panel panel-default">
            <h1><?=$fila->apellido?>, <?=$fila->nombre?></h1>
            <h3>Email: <?=$fila->email?>
              <br>
            </h3>
            <h3>Teléfono: <?=$fila->telefono?></h3>
            <h3>DNI: <?=$fila->dni?></h3>
            <h3>Curso: <?=$fila->nombre_curso?></h3>
            <h3>Turno: <?=$fila->turno?></h3>
          </div>
          <div class="col-md-3">
            <table class="table">
              <thead>
                <tr>
                  <th class="info">Presentismo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Pendiente</td>
                </tr>
              </tbody>
            </table>
             <table class="table">
              <thead>
                <tr>
                  <th class="info">Curriculum Vitae</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Pendiente</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
<?php } ?>