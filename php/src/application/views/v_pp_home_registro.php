<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EncuentroTecnologico.com.ar</title>
  <link href="<?= ASSETS_URL; ?>assets/css/mi_style.css" >
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-KyZXEAg3QhqLMpG8r+8fhAXLRk2vvoC2f3B09zVXn8CA5QIVfZOJ3BCsw2P0p/We" crossorigin="anonymous">
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-U1DAWAznBHeqEIlVSCgzq+c9gqGAJn5c/t99JyeKa9xxaYpSvHU5awsuZVVFIhvj" crossorigin="anonymous"></script>
</head>
<style>
body {
background-image: url(<?= base_url(); ?>assets/img/400h.jpg);
background-position: center center;
background-repeat: no-repeat;
background-attachment: fixed;
background-size: cover;
background-color: #66999;
}
</style>
<body>

<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
  <div class="container-fluid">
    <a class="navbar-brand" href="#">
      <img height="20" alt="Brand" src="<?= ASSETS_URL; ?>assets/img/logo.png">
    </a>
        <ul class="navbar-nav d-flex">
          <li class="nav-item">
            <a class="btn btn-success" data-bs-toggle="modal" data-bs-target="#modallogin">Login</a>
          </li>
        <ul>
  </div>
</nav>
<div class="container bg-light mb-2 mt-2" >
<form class="form-horizontal" role="form" method="post" action="<?= base_url(); ?>C_perfil/insertar_datos">
      <div class="form-group">
                      <div class="col-sm-2">
                        <label class="control-label">Email</label>
                      </div>
                      <div class="col-sm-10">
                        <input type="email" class="form-control" id="email" name="email" placeholder="Email" required>
                      </div>
                    </div>
                    <div class="form-group">
                      <div class="col-sm-2">
                        <label for="inputPassword3" class="control-label">Password</label>
                      </div>
                      <div class="col-sm-6">
                        <input type="password" class="form-control" id="pwd" name="pwd" placeholder="Password" required>
                      </div>
                    </div>
                    <hr>
                    <div class="form-group">
                      <div class="col-sm-2">
                        <label class="control-label">Nombre</label>
                      </div>
                      <div class="col-sm-8">
                        <input type="text" class="form-control" id="nombre" name="nombre" placeholder="Nombre" required>
                      </div>
                    </div>
                    <div class="form-group">
                      <div class="col-sm-2">
                        <label class="control-label">Apellido</label>
                      </div>
                      <div class="col-sm-8">
                        <input type="text" class="form-control" id="apellido" name="apellido" placeholder="Apellido" required>
                      </div>
                    </div>
                    <div class="form-group">
                      <div class="col-sm-2">
                        <label class="control-label">Dirección</label>
                      </div>
                      <div class="col-sm-8">
                        <input type="text" class="form-control" id="direccion" name="direccion" placeholder="Dirección" required>
                      </div>
                    </div>
                    <div class="form-group">
                      <div class="col-sm-2">
                        <label class="control-label">Fecha de Nacimiento</label>
                      </div>
                      <div class="col-sm-6">
                        <input type="date" class="form-control" id="nacimiento"  name="nacimiento" placeholder="" required>
                      </div>
                    </div>
                    <div class="form-group">
                      <div class="col-sm-2">
                        <label class="control-label">CUIL</label>
                      </div>
                      <div class="col-sm-4">
                        <input type="text" class="form-control" id="cuil"  name="cuil" placeholder="CUIL" required>
                      </div>
                      <div class="col-sm-2"><a class="btn btn-success" href="https://www.anses.gob.ar/consulta/constancia-de-cuil" target="_blank">Obtenelo aquí</a></div>
                    </div>
                    <div class="form-group">
                      <div class="col-sm-2">
                        <label class="control-label">DNI</label>
                      </div>
                      <div class="col-sm-4">
                        <input type="text" class="form-control" id="dni"  name="dni" placeholder="DNI" required>
                      </div>
                    </div>
                    <div class="form-group">
                      <div class="col-sm-2">
                        <label class="control-label">Nacionalidad</label>
                      </div>
                      <div class="col-sm-4">
                          <select class="form-control" id="nacionalidad"  name="nacionalidad" required>
                            <option value="Afganistán">Afganistán</option>
                            <option value="Albania">Albania</option>
                            <option value="Alemania">Alemania</option>
                            <option value="Andorra">Andorra</option>
                            <option value="Angola">Angola</option>
                            <option value="Antigua y Barbuda">Antigua y Barbuda</option>
                            <option value="Arabia Saudita">Arabia Saudita</option>
                            <option value="Argelia">Argelia</option>
                            <option  selected="true" value="Argentina">Argentina</option>
                            <option value="Armenia">Armenia</option>
                            <option value="Australia">Australia</option>
                            <option value="Austria">Austria</option>
                            <option value="Azerbaiyán">Azerbaiyán</option>
                            <option value="Bahamas">Bahamas</option>
                            <option value="Bangladés">Bangladés</option>
                            <option value="Barbados">Barbados</option>
                            <option value="Baréin">Baréin</option>
                            <option value="Bélgica">Bélgica</option>
                            <option value="Belice">Belice</option>
                            <option value="Benín">Benín</option>
                            <option value="Bielorrusia">Bielorrusia</option>
                            <option value="Birmania">Birmania</option>
                            <option value="Bolivia">Bolivia</option>
                            <option value="Bosnia y Herzegovina">Bosnia y Herzegovina</option>
                            <option value="Botsuana">Botsuana</option>
                            <option value="Brasil">Brasil</option>
                            <option value="Brunéi">Brunéi</option>
                            <option value="Bulgaria">Bulgaria</option>
                            <option value="Burkina Faso">Burkina Faso</option>
                            <option value="Burundi">Burundi</option>
                            <option value="Bután">Bután</option>
                            <option value="Cabo Verde">Cabo Verde</option>
                            <option value="Camboya">Camboya</option>
                            <option value="Camerún">Camerún</option>
                            <option value="Canadá">Canadá</option>
                            <option value="Catar">Catar</option>
                            <option value="Chad">Chad</option>
                            <option value="Chile">Chile</option>
                            <option value="China">China</option>
                            <option value="Chipre">Chipre</option>
                            <option value="Ciudad del Vaticano">Ciudad del Vaticano</option>
                            <option value="Colombia">Colombia</option>
                            <option value="Comoras">Comoras</option>
                            <option value="Corea del Norte">Corea del Norte</option>
                            <option value="Corea del Sur">Corea del Sur</option>
                            <option value="Costa de Marfil">Costa de Marfil</option>
                            <option value="Costa Rica">Costa Rica</option>
                            <option value="Croacia">Croacia</option>
                            <option value="Cuba">Cuba</option>
                            <option value="Dinamarca">Dinamarca</option>
                            <option value="Dominica">Dominica</option>
                            <option value="Ecuador">Ecuador</option>
                            <option value="Egipto">Egipto</option>
                            <option value="El Salvador">El Salvador</option>
                            <option value="Emiratos Árabes Unidos">Emiratos Árabes Unidos</option>
                            <option value="Eritrea">Eritrea</option>
                            <option value="Eslovaquia">Eslovaquia</option>
                            <option value="Eslovenia">Eslovenia</option>
                            <option value="España">España</option>
                            <option value="Estados Unidos">Estados Unidos</option>
                            <option value="Estonia">Estonia</option>
                            <option value="Etiopía">Etiopía</option>
                            <option value="Filipinas">Filipinas</option>
                            <option value="Finlandia">Finlandia</option>
                            <option value="Fiyi">Fiyi</option>
                            <option value="Francia">Francia</option>
                            <option value="Gabón">Gabón</option>
                            <option value="Gambia">Gambia</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Ghana">Ghana</option>
                            <option value="Granada">Granada</option>
                            <option value="Grecia">Grecia</option>
                            <option value="Guatemala">Guatemala</option>
                            <option value="Guyana">Guyana</option>
                            <option value="Guinea">Guinea</option>
                            <option value="Guinea ecuatorial">Guinea ecuatorial</option>
                            <option value="Guinea-Bisáu">Guinea-Bisáu</option>
                            <option value="Haití">Haití</option>
                            <option value="Honduras">Honduras</option>
                            <option value="Hungría">Hungría</option>
                            <option value="India">India</option>
                            <option value="Indonesia">Indonesia</option>
                            <option value="Irak">Irak</option>
                            <option value="Irán">Irán</option>
                            <option value="Irlanda">Irlanda</option>
                            <option value="Islandia">Islandia</option>
                            <option value="Islas Marshall">Islas Marshall</option>
                            <option value="Islas Salomón">Islas Salomón</option>
                            <option value="Israel">Israel</option>
                            <option value="Italia">Italia</option>
                            <option value="Jamaica">Jamaica</option>
                            <option value="Japón">Japón</option>
                            <option value="Jordania">Jordania</option>
                            <option value="Kazajistán">Kazajistán</option>
                            <option value="Kenia">Kenia</option>
                            <option value="Kirguistán">Kirguistán</option>
                            <option value="Kiribati">Kiribati</option>
                            <option value="Kuwait">Kuwait</option>
                            <option value="Laos">Laos</option>
                            <option value="Lesoto">Lesoto</option>
                            <option value="Letonia">Letonia</option>
                            <option value="Líbano">Líbano</option>
                            <option value="Liberia">Liberia</option>
                            <option value="Libia">Libia</option>
                            <option value="Liechtenstein">Liechtenstein</option>
                            <option value="Lituania">Lituania</option>
                            <option value="Luxemburgo">Luxemburgo</option>
                            <option value="Macedonia del Norte">Macedonia del Norte</option>
                            <option value="Madagascar">Madagascar</option>
                            <option value="Malasia">Malasia</option>
                            <option value="Malaui">Malaui</option>
                            <option value="Maldivas">Maldivas</option>
                            <option value="Malí">Malí</option>
                            <option value="Malta">Malta</option>
                            <option value="Marruecos">Marruecos</option>
                            <option value="Mauricio">Mauricio</option>
                            <option value="Mauritania">Mauritania</option>
                            <option value="México">México</option>
                            <option value="Micronesia">Micronesia</option>
                            <option value="Moldavia">Moldavia</option>
                            <option value="Mónaco">Mónaco</option>
                            <option value="Mongolia">Mongolia</option>
                            <option value="Montenegro">Montenegro</option>
                            <option value="Mozambique">Mozambique</option>
                            <option value="Namibia">Namibia</option>
                            <option value="Nauru">Nauru</option>
                            <option value="Nepal">Nepal</option>
                            <option value="Nicaragua">Nicaragua</option>
                            <option value="Níger">Níger</option>
                            <option value="Nigeria">Nigeria</option>
                            <option value="Noruega">Noruega</option>
                            <option value="Nueva Zelanda">Nueva Zelanda</option>
                            <option value="Omán">Omán</option>
                            <option value="Países Bajos">Países Bajos</option>
                            <option value="Pakistán">Pakistán</option>
                            <option value="Palaos">Palaos</option>
                            <option value="Panamá">Panamá</option>
                            <option value="Papúa Nueva Guinea">Papúa Nueva Guinea</option>
                            <option value="Paraguay">Paraguay</option>
                            <option value="Perú">Perú</option>
                            <option value="Polonia">Polonia</option>
                            <option value="Portugal">Portugal</option>
                            <option value="Reino Unido">Reino Unido</option>
                            <option value="República Centroafricana">República Centroafricana</option>
                            <option value="República Checa">República Checa</option>
                            <option value="República del Congo">República del Congo</option>
                            <option value="República Democrática del Congo">República Democrática del Congo</option>
                            <option value="República Dominicana">República Dominicana</option>
                            <option value="Ruanda">Ruanda</option>
                            <option value="Rumanía">Rumanía</option>
                            <option value="Rusia">Rusia</option>
                            <option value="Samoa">Samoa</option>
                            <option value="San Cristóbal y Nieves">San Cristóbal y Nieves</option>
                            <option value="San Marino">San Marino</option>
                            <option value="San Vicente y las Granadinas">San Vicente y las Granadinas</option>
                            <option value="Santa Lucía">Santa Lucía</option>
                            <option value="Santo Tomé y Príncipe">Santo Tomé y Príncipe</option>
                            <option value="Senegal">Senegal</option>
                            <option value="Serbia">Serbia</option>
                            <option value="Seychelles">Seychelles</option>
                            <option value="Sierra Leona">Sierra Leona</option>
                            <option value="Singapur">Singapur</option>
                            <option value="Siria">Siria</option>
                            <option value="Somalia">Somalia</option>
                            <option value="Sri Lanka">Sri Lanka</option>
                            <option value="Suazilandia">Suazilandia</option>
                            <option value="Sudáfrica">Sudáfrica</option>
                            <option value="Sudán">Sudán</option>
                            <option value="Sudán del Sur">Sudán del Sur</option>
                            <option value="Suecia">Suecia</option>
                            <option value="Suiza">Suiza</option>
                            <option value="Surinam">Surinam</option>
                            <option value="Tailandia">Tailandia</option>
                            <option value="Tanzania">Tanzania</option>
                            <option value="Tayikistán">Tayikistán</option>
                            <option value="Timor Oriental">Timor Oriental</option>
                            <option value="Togo">Togo</option>
                            <option value="Tonga">Tonga</option>
                            <option value="Trinidad y Tobago">Trinidad y Tobago</option>
                            <option value="Túnez">Túnez</option>
                            <option value="Turkmenistán">Turkmenistán</option>
                            <option value="Turquía">Turquía</option>
                            <option value="Tuvalu">Tuvalu</option>
                            <option value="Ucrania">Ucrania</option>
                            <option value="Uganda">Uganda</option>
                            <option value="Uruguay">Uruguay</option>
                            <option value="Uzbekistán">Uzbekistán</option>
                            <option value="Vanuatu">Vanuatu</option>
                            <option value="Venezuela">Venezuela</option>
                            <option value="Vietnam">Vietnam</option>
                            <option value="Yemen">Yemen</option>
                            <option value="Yibuti">Yibuti</option>
                            <option value="Zambia">Zambia</option>
                            <option value="Zimbabue">Zimbabue</option>
                          </select>
                      </div>
                    </div>
                    <div class="form-group">
                      <div class="col-sm-2">
                        <label class="control-label">Teléfono</label>
                      </div>
                      <div class="col-sm-6">
                        <input type="text" class="form-control" id="telefono"  name="telefono" placeholder="Se recomienda Celular del Alumno"  required>
                      </div>
                    </div>
                    <div class="form-group">
                      <div class="col-sm-2">
                        <label class="control-label">Teléfono alternativo</label>
                      </div>
                      <div class="col-sm-6">
                        <input type="text" class="form-control" id="telefono_alt"  name="telefono_alt" placeholder="Se recomienda de Padre, Madre o tutor">
                      </div>
                    </div>

                    <div class="form-group">
                      <div class="col-sm-2">
                        <label class="control-label">Codigo&nbsp;</label>
                      </div>
                      <div class="col-sm-6">
                        <input type="text" class="form-control" id="codigo"  name="codigo" placeholder="Código de matriculación " required><label class="text-primary">Suministrado por Docente</label>
                      </div>
                    </div>
                    <div class="form-group">
                        <div class="col-sm-offset-0 col-sm-12">
                          <div class="checkbox">
                            <label>
                              <input type="checkbox" id="condiciones"  name="condiciones" required><a onclick="condiciones()">Acepta los términos y condiciones de la Materia Prácticas Profesionalizantes</a></label>
                          </div>
                        </div>
                    </div>
                    <br>
                    <div class="form-group">
                      <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Cerrar</button>
                      <button type="submit" class="active btn btn-success">Registrarse</button>
                    </div>
                </form> 

</div> 
      




</body>
</html>