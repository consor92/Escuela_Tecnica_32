<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class M_pp extends CI_Model {

    public function __construct(){
        parent::__construct();
}
    public function login($email,$pwd){
        $query = $this->db->get_where('usuarios', array('email' => $email));

        if($query->num_rows()==1){
            $row=$query->row();
            if($pwd == $row->pwd)
            {
                $data=array(
                        'nombre'=>$row->nombre,
                        'id'=>$row->id,
                        'email'=>$row->email,
                        'logged_in' => TRUE
                );
                $this->session->set_userdata($data);
                if($row->rol==0){ return 'alumno';}
                if($row->rol==1){ return 'docente';}
                if($row->rol==2){ return 'referente';}
                if($row->rol==3){ return 'admin';}
               
            }
            else{        
                return false;
            }

        }else{
          
            return false;
        };

    }
    public function datos_usuario($id){
        $this->db->where('id',$id);
        $q = $this->db->get('usuarios');
        
        if($q->num_rows()>0){
           
            return $q->result();
        }
    }

    public function datos_usuario_completo($id){
        $this->db->select('usuarios.id id, usuarios.usuario usuario, usuarios.pwd pwd, usuarios.email email, usuarios.telefono telefono, usuarios.dni dni, usuarios.nombre nombre, usuarios.apellido apellido, usuarios.curso curso, curso.nombre_curso nombre_curso, curso.anio anio, curso.turno turno');
        $this->db->from('usuarios');
        $this->db->join('curso', 'curso.id = usuarios.curso','left');
        $this->db->where('usuarios.id',$id); 
        $q = $this->db->get();
        
        if($q->num_rows()>0){
           
            return $q->result();
        }
    }
    public function usuario_valido($email){
        $this->db->where('email',$email);
        $q = $this->db->get('usuarios');
        
        if($q->num_rows()>0){
           
            return true;
        }else return false;
    }
    public function codigo_valido($codigo){
        $this->db->where('matricula_auto',$codigo);
        $q = $this->db->get('curso');
        if($q->num_rows()==1){
            $row=$query->row();
            if($row->activar_matriculados==true){
                return true;
            }else return false;
            
        }else return false;


    }
    public function usuario_id($usuario){
        $this->db->where('usuario',$usuario);
        $q = $this->db->get('usuarios');
        
        if($q->num_rows()>0){
           
            foreach ($q->result() as $aux)
            {
                $s = $aux->id;
            }
            return $s;
    }
    }
    
    public function update_datos($pwd,$nombre,$apellido,$email,$telefono,$dni,$codigo,$telefono_alt,$nacimiento,$direccion,$cuil,$nacionalidad){
        $id=$this->session->userdata('id');
        if(($pwd!='')and($pwd!=null)){
        $sql='UPDATE usuarios set pwd = "'.md5($pwd).'", email = "'.$email.'", telefono = "'.$telefono.'", dni = '.$dni.', nombre = "'.$nombre.'", apellido = "'.$apellido.'", telefono_alternativo = "'.$telefono_alt.'", nacimiento = "'.$nacimiento.'", direccion = "'.$direccion.'", cuil ="'.$cuil.'" , nacionalidad ="'.$nacionalidad.'"  WHERE id = '.$id;
        
        }else{
        $sql='UPDATE usuarios set email = "'.$email.'", telefono = "'.$telefono.'", dni = '.$dni.', nombre = "'.$nombre.'", apellido = "'.$apellido.'", telefono_alternativo = "'.$telefono_alt.'", nacimiento = "'.$nacimiento.'", direccion = "'.$direccion.'", cuil ="'.$cuil.'" , nacionalidad ="'.$nacionalidad.'" WHERE id = '.$id;           
        }

            $inser_user=$this->db->query($sql);
                if ($this->db->affected_rows()>0)
                    {
                    return true;     
                    }
                else{ 
                    return false;
                   }
    }
    
    public function insertar_usuario($pwd,$nombre,$apellido,$email,$telefono,$dni,$codigo,$telefono_alt,$nacimiento,$direccion,$cuil,$nacionalidad){
        $this->db->where('matricula_auto',$codigo);
        $q = $this->db->get('curso');
        if($q->num_rows()>0)
        { 
        foreach($q->result()as $fila)
            {$sql='INSERT INTO usuarios (pwd, email, telefono, dni, nombre, apellido, curso,nacimiento,telefono_alternativo,direccion,cuil,nacionalidad) VALUES ( "'.md5($pwd).'", "'.$email.'", "'.$telefono.'", '.$dni.', "'.$nombre.'", "'.$apellido.'", '.$fila->id.',"'.$nacimiento.'", "'.$telefono_alt.'", "'.$direccion.'","'.$cuil.'","'.$nacionalidad.'")';
           
            $inser_user=$this->db->query($sql);
                if ($this->db->affected_rows()>0)
                    {
                    return true;     
                    }
                else{ 
                    return false;
                   }
                }
            }
        }
    public function modificar_bitacora($titulo, $descripcion){
        $id=$this->session->userdata('id');
        $sql='UPDATE bitacora set titulo = "'.$titulo.'", descripcion = "'.$descripcion.'" WHERE ((alumno = '.$id.' )and (fecha_de_carga = curdate()))';
            $inser_user=$this->db->query($sql);
                if ($this->db->affected_rows()>0)
                    {
                    return true;     
                    }
                else{ 
                    return false;
                   }        
    }
    public function insertar_bitacora($alumno, $titulo, $descripcion, $fecha_de_carga){
            {$sql='INSERT INTO bitacora (alumno, titulo, descripcion, fecha_de_carga) 
                    VALUES ( "'.$alumno.'","'.$titulo.'", "'.$descripcion.'","'.$fecha_de_carga.'")';
           
            $inser_user=$this->db->query($sql);
                if ($this->db->affected_rows()>0)
                    {
                    return true;     
                    }
                else{ 
                    return false;
                   }
            }
        
    }
    public function bitacora_usuario($id){
        $this->db->select('bitacora.id, bitacora.fecha_de_carga, bitacora.titulo, bitacora.descripcion');
        $this->db->from('usuarios');
        $this->db->join('bitacora', 'bitacora.alumno = usuarios.id');
        $this->db->where('usuarios.id',$id); 
        $this->db->order_by('bitacora.fecha_de_carga', 'DESC');
        $q = $this->db->get();

        
        if($q->num_rows()>0){
           
            return $q->result();
        }else return $q->result();
    }
    public function concat_usuario($id){
        $q= $this->db->query("SELECT CONCAT( REPLACE(apellido,' ','_'),REPLACE(nombre,' ','_')) AS name FROM usuarios WHERE usuarios.id=".$id);
        if($q->num_rows()>0){
           
            $row = $q->row();
            return hash('sha512',$row->name);
        }else return 0;
    }
    
    public function carpeta_de_campo($usuario,$nombre_archivo){
        $this->db->from('carpeta_de_campo');
        $this->db->where('carpeta_de_campo.usuario',$usuario); 
        $q = $this->db->get();
        if($q->num_rows()>0){
            $sql='UPDATE carpeta_de_campo SET nombre_archivo="'.$nombre_archivo.'",fecha=NOW() WHERE usuario='.$usuario; 
            $this->db->query($sql);

        }else{$sql='INSERT INTO carpeta_de_campo (usuario,nombre_archivo,fecha) 
                    VALUES ( '.$usuario.',"'.$nombre_archivo.'",NOW())';
           
            $this->db->query($sql);

            }

        
    }
     
    public function extrae_carpeta_de_campo($id){
        $this->db->select("usuarios.apellido apellido, carpeta_de_campo.nombre_archivo nombre_archivo, carpeta_de_campo.fecha fecha");
        $this->db->from('usuarios');
        $this->db->join('carpeta_de_campo', 'carpeta_de_campo.usuario = usuarios.id');
        $this->db->where('usuarios.id',$id); 
        $q = $this->db->get();

        
    return $q->result();

    }
       
    
    

    public function ultima_bitacora_usuario($id){
        @$fecha = date("Y-m-d",time());
        $date = new DateTime($fecha, new DateTimeZone('America/Argentina/Buenos_Aires'));
        date_default_timezone_set('America/Argentina/Buenos_Aires');
        $zonahoraria = date_default_timezone_get();
        @$fecha=date("Y-m-d",time());
        $this->db->select('bitacora.titulo, bitacora.descripcion');
        $this->db->from('usuarios');
        $this->db->join('bitacora', 'bitacora.alumno = usuarios.id');
        $this->db->where('usuarios.id',$id); 
        $this->db->where('fecha_de_carga',$fecha); 
        $q = $this->db->get();

        
        if($q->num_rows()>0){
           
            return $q->result();
        }else return $q->result();
    }
    public function alumno_presente($id){
        @$fecha = date("Y-m-d",time());
        $date = new DateTime($fecha, new DateTimeZone('America/Argentina/Buenos_Aires'));
        date_default_timezone_set('America/Argentina/Buenos_Aires');
        $zonahoraria = date_default_timezone_get();
        @$fecha=date("Y-m-d",time());
        $this->db->select('*');
        $this->db->from('asistencia');
        $this->db->where('asistencia.usuario',$id); 
        $this->db->where('fecha',$fecha); 
        $q = $this->db->get();
        if($q->num_rows()>0){
           
            return true;
        }else return false;
    }





}