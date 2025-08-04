<html><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script type="text/javascript" src="<?= ASSETS_URL; ?>assets/js/jquery.min.js"></script>
<script type="text/javascript" src="<?= ASSETS_URL; ?>assets/js/bootstrap.min.js"></script>
<script type="text/javascript" src="<?= ASSETS_URL; ?>assets/js/ajax.js"></script>
<link href="<?= ASSETS_URL; ?>assets/css/font-awesome.min.css" rel="stylesheet" type="text/css">
<link href="<?= ASSETS_URL; ?>assets/css/bootstrap.css" rel="stylesheet" type="text/css">
<link rel="stylesheet" href="<?= ASSETS_URL;; ?>assets/css/animate.css" />
<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.2.0/css/all.css" integrity="sha384-hWVjflwFxL6sNzntih27bfxkr27PmbbK/iSvJ+a4+0owXq79v+lsFkW54bOGbiDQ" crossorigin="anonymous">
<link href="https://cdn.jsdelivr.net/gh/gitbrent/bootstrap4-toggle@3.6.1/css/bootstrap4-toggle.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/gh/gitbrent/bootstrap4-toggle@3.6.1/js/bootstrap4-toggle.min.js"></script>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
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
     <a class="navbar-brand"><img height="20" alt="Brand" src="<?= ASSETS_URL; ?>/assets/img/logo.png"></a>
    </div>
    <div class="collapse navbar-collapse" id="navbar-ex-collapse">
      <ul class="nav navbar-nav navbar-left">
        <li class="active">
          <a href="<?= base_url().'c_theacher'; ?>">Asistencia Manual</a>
        </li>
        <li class="active">
          <a href="<?= base_url('c_theacher/bitacoras'); ?>">Bitacoras</a>
        </li>
        <li class="active">
          <a href="<?= base_url('c_theacher/carpeta_de_campo'); ?>">Carpetas de Campo</a>
        </li>
        <li class="active">
          <a href="<?= base_url('c_theacher/blanqueo'); ?>">Blanqueo alumno</a>
        </li>
        <li class="active dropdown">
          <a class="dropdown-toggle" href="#" data-toggle="dropdown" role="button" aria-expanded="false">Total de Horas
             <i class="fa fa-caret-down">                  
          </i></a>
          <ul class="dropdown-menu" role="menu">
            <li>
              <a href="#">Por Curso</a>
            </li>
            <li>
              <a href="#">Por Alumno</a>
            </li>
            <li>
              <a href="#">Por Año</a>
            </li>
          </ul>
        </li>
      </ul>
      <ul class="nav navbar-nav navbar-right">
        <li class="active btn-danger">
          <a href="view/email_asistencia.php">Envio de Asistencia via Email</a>
        </li>
        <li class=" btn-danger">
          <a class="text-light" href="<?= base_url('c_theacher/logout'); ?>">salir</a>
        </li>

      </ul>

    </div>
  </div>
</div>

</body>
</html>