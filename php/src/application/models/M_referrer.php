<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class M_referrer extends CI_Model {
    
    public function __construct(){
        parent::__construct();
}


public function cursos($anio){
    $id=$this->session->userdata('id');
    
    $sql='SELECT curso.id c_i, curso.nombre_curso nombre_curso, curso.descripcion_curso descripcion_curso,
    curso.activar_matriculados activar_matriculados, curso.descripcion_curso descripcion_curso,
    curso.lun lun,curso.mar mar,curso.mie mie,curso.jue jue,curso.vie vie,curso.sab sab, curso.dom dom,
    usuarios.apellido apellido,usuarios.nombre nombre
    FROM curso 
    JOIN usuarios
    ON curso.profesor = usuarios.id WHERE curso.anio = '.$anio; 
    
    $query=$this->db->query($sql);

    if($query->num_rows()>0){
        return $query->result();
        
    }else{
        return false;}
}
public function datos_usuario_completo($curso){
    $this->db->select('email, telefono, dni, nombre, apellido, curso, nacimiento, telefono_alternativo, direccion, cuil, nacionalidad');
    $this->db->from('usuarios');
    $this->db->join('curso', 'curso.id = usuarios.curso','left');
    $this->db->where('curso.id',$curso);
    $this->db->order_by('apellido','ASC'); 
    $q = $this->db->get();
    
    if($q->num_rows()>0){
       
        return $q->result();
    }
}
public function curso_datos($curso_id){
    $this->db->select('curso.id c_i,curso.anio, curso.nombre_curso nombre_curso, curso.descripcion_curso descripcion_curso,
    curso.activar_matriculados activar_matriculados, curso.descripcion_curso descripcion_curso,
    curso.lun lun,curso.mar mar,curso.mie mie,curso.jue jue,curso.vie vie,curso.sab sab, curso.dom dom');
    $this->db->from('curso');
    $this->db->where('curso.id',$curso_id);
    $this->db->order_by('curso.anio','ASC'); 
    $q = $this->db->get();
    
    if($q->num_rows()>0){
       
        return $q->result();
    }
}


}