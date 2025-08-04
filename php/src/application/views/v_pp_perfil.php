 <html>
  
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script type="text/javascript" src="<?= ASSETS_URL; ?>assets/js/jquery.min.js"></script>
    <script type="text/javascript" src="<?= ASSETS_URL; ?>assets/js/bootstrap.min.js"></script>
    <script type="text/javascript" src="<?= ASSETS_URL; ?>assets/js/ajax.js"></script>
    <link href="<?= ASSETS_URL; ?>assets/css/font-awesome.min.css" rel="stylesheet" type="text/css">
    <link href="<?= ASSETS_URL; ?>assets/css/bootstrap.css" rel="stylesheet" type="text/css">
    <link rel="stylesheet" href="<?= ASSETS_URL; ?>assets/css/animate.css" />
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
    <script src="http://code.jquery.com/jquery-1.11.0.min.js"></script>
<script src="http://code.jquery.com/jquery-migrate-1.2.1.min.js"></script>
<link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css">
<script src="//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/js/bootstrap.min.js"></script>
  </head>
  
  <body>
    <div class="navbar navbar-default navbar-inverse navbar-static-top">
      <div class="container">
        <div class="navbar-header">
          <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#navbar-ex-collapse">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <a class="navbar-brand"><img height="20" alt="Brand" src="<?= ASSETS_URL; ?>assets/img/logo.png"></a>
        </div>
        <div class="collapse navbar-collapse" id="navbar-ex-collapse">
          <ul class="nav navbar-left navbar-nav">
            <li class="active">
              <a href="<?= base_url(); ?>c_perfil/">Información</a>
            </li>
            <li class="active">
              <a href="<?= base_url(); ?>c_perfil/bitacora_all">Bitacoras</a>
            </li>
            <li class="active">
              <a href="<?= base_url(); ?>c_perfil/carpeta_de_campo">Carpeta de campo</a>
            </li>
            <li class="active">
              <a href="<?= base_url(); ?>c_perfil/evaluacion_personal">Evaluación Personal</a>
            </li>
            <li class="active">
              <a href="#">Calificá a tu grupo</a>
            </li>
          </ul>
          <ul class=" nav navbar-nav navbar-right">
            <li class="dropdown">
              <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button"
              aria-expanded="false"><span class="glyphicon glyphicon-user"></span>&nbsp;<?= $this->session->userdata('nombre'); ?>&nbsp;<i class="glyphicon glyphicon-chevron-down"></i></a>
              <ul class="dropdown-menu" role="menu">
                <li>
                  <a href="<?= base_url(); ?>c_perfil/modificar_datos">Modificar datos <span class="glyphicon glyphicon-pencil"></span></a>
                </li>
                <li>
                  <a href="<?= base_url(); ?>c_perfil/logout">Salir <span class="glyphicon glyphicon-off"></span></a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </div>



<?php 
if(isset($_GET['errores'])&&($_GET['errores']!=''))
{echo '
  <div class="container"> 
  <div class="alert alert-danger alert-dismissible">
  <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
  <strong>Alerta!</strong> '.$_GET['errores'].'
  </div>
  </div>';

}

if(isset($_GET['aceptado'])&&($_GET['aceptado']!=''))
{echo '
  <div class="container"> 
  <div class="alert alert-success alert-dismissible">
  <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
  <strong>Perfecto!</strong> '.$_GET['aceptado'].'
  </div>
  </div>';
  
}
?>
  </body>

</html>
