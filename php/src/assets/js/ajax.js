    function objetoAjax(){
        var xmlhttp=false;
        try {
            xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            try {
               xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (E) {
                xmlhttp = false;
            }
        }
     
        if (!xmlhttp && typeof XMLHttpRequest!='undefined') {
            xmlhttp = new XMLHttpRequest();
        }
        return xmlhttp;
    }
     
    function enviar(){
        //donde se mostrará el resultado
        divResultado = document.getElementById('resultado');
     
        //tomamos el valor de la lista desplegable
        dato=document.formulario.dato.value;
         
        //instanciamos el objetoAjax
        ajax=objetoAjax();
     
        //usamos el medoto POST
        //archivo que realizará la operacion
       
        ajax.open("POST", "archivo.php",true);
        ajax.onreadystatechange=function() {
            if (ajax.readyState==4) {
                //mostrar resultados en esta capa
                divResultado.innerHTML = ajax.responseText
            }
        }
        ajax.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
        //enviando los valores
        ajax.send("dato="+dato)
    }