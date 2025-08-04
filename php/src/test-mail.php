    <?php
        ini_set( 'display_errors', 2);
        error_reporting( E_ALL );
        $from = "desdeweb@encuentrotecnologico.com";
        $to = "martellicris@gmail.com";
        $subject = "Checking PHP mail";
        $message = "es una prueba para cris";
        $headers = "From:" . $from;
        mail($to,$subject,$message, $headers);
        echo "The email message was sent.";
    );