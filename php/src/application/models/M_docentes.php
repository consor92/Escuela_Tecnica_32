<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class M_docentes extends CI_Model {
    
    public function __construct(){
        parent::__construct();
}


public function cursos(){
    $id=$this->session->userdata('id');
    $sql='Select * from curso where profesor = '.$id.' or profesor2 ='.$id; 
    
    $query=$this->db->query($sql);

    if($query->num_rows()>0){
        return $query->result();
        
    }else{return false;}
}
public function esta_presente($alumno,$fecha){
    $query=$this->db->get_where('asistencia',array('fecha' => $fecha,'usuario'=>$alumno));

    if($query->num_rows()>0){
        
        return true;
        
    }else{return false;}    
}
public function alumnos($curso){
    $id=$this->session->userdata('id');
    $sql='SELECT usuarios.id, usuarios.nombre, usuarios.apellido, @aux:= 0  as presentismo, usuarios.email 
            FROM usuarios
            WHERE (usuarios.curso = '.$curso.')
            ORDER BY usuarios.apellido, usuarios.nombre';
    $query=$this->db->query($sql);

    if($query->num_rows()>0){
        foreach($query->result() as $aux){
            if($this->esta_presente($aux->id, date("Y-m-d"))==true){
                $aux->presentismo=1;
            }
        }
      
        return $query->result() ;
        
    }else{
            return false;  

    }
}

public function actualizar_presentes($presentes,$cursote){
    //borrar todo presente del curso
    $con2="DELETE asistencia FROM asistencia 
    JOIN usuarios on asistencia.usuario = usuarios.id
    where asistencia.fecha = CURDATE() and usuarios.curso=".$cursote;
    $query=$this->db->query($con2);  
    if ($presentes!=null){
        foreach($presentes as $usuario){
            $con="INSERT INTO asistencia (usuario, fecha) VALUES ('".$usuario."',CURDATE())";
            $query=$this->db->query($con);

        }
    }

}
public function alumno_bitacoras($curso){
    $id=$this->session->userdata('id');
    $sql="SELECT DISTINCT A.id, A.nombre, A.apellido,B.id id_b,B.titulo,B.descripcion,B.fecha_de_carga
    FROM usuarios A
    JOIN bitacora B 
    ON A.id = B.alumno
    WHERE A.curso = ".$curso." 
    ORDER BY B.fecha_de_carga DESC";
    
    $query=$this->db->query($sql);

    if($query->num_rows()>0){
        return $query->result();
        
    }else{return false;}

}
public function blanqueo($usuario){
    $id=$this->session->userdata('id');
    $sql= "UPDATE usuarios SET pwd='25d55ad283aa400af464c76d713c07ad' WHERE id=".$usuario;
    $query=$this->db->query($sql);
    if ($this->db->affected_rows()>0){
        return true;
    }else{return false;}
}
public function alumno_campo($curso){
    $id=$this->session->userdata('id');
    $sql="SELECT usuarios.apellido apellido, usuarios.nombre nombre, carpeta_de_campo.nombre_archivo nombre_archivo, carpeta_de_campo.fecha fecha 
    from usuarios 
    join carpeta_de_campo 
    on carpeta_de_campo.usuario = usuarios.id 
    WHERE usuarios.curso = ".$curso."
    ORDER BY usuarios.apellido ASC";
    
    $query=$this->db->query($sql);

    if($query->num_rows()>0){
        return $query->result();
        
    }else{return false;}
}

}
