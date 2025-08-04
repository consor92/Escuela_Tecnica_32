<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class C_perfil extends CI_Controller {

    public function __construct(){
        parent::__construct();
        $this->load->model('M_pp');
        
    }
        
    
    public function index()
	{  

        if ($this->session->userdata( 'logged_in') == TRUE){
            $id=$this->session->userdata('id');
            $data['datos_user_all']=$this->M_pp->datos_usuario_completo($id);
            $this->load->view('v_pp_perfil');  
            $this->load->view('v_pp_informacion',$data);
        
        }
    else{    
        redirect(base_url());
        }

    }
  
    public function insertar_datos(){
    
    $email = $this->input->post('email');
    if ($this->M_pp->usuario_valido($email)==false){

            $pwd = htmlspecialchars($this->input->post('pwd'));
            $nombre = htmlspecialchars($this->input->post('nombre'));
            $apellido = htmlspecialchars($this->input->post('apellido'));
            $direccion = htmlspecialchars($this->input->post('direccion'));
            $cuil = htmlspecialchars($this->input->post('cuil'));
            $nacionalidad = htmlspecialchars($this->input->post('nacionalidad'));
            $nacimiento = htmlspecialchars($this->input->post('nacimiento'));
            $telefono = htmlspecialchars($this->input->post('telefono'));
            $telefono_alt = htmlspecialchars($this->input->post('telefono_alt'));
            $dni = htmlspecialchars($this->input->post('dni'));
            $codigo = htmlspecialchars($this->input->post('codigo'));                    
            $condiciones = htmlspecialchars($this->input->post('condiciones'));

            $resultado=$this->M_pp->insertar_usuario($pwd,$nombre,$apellido,$email,$telefono,$dni,$codigo,$telefono_alt,$nacimiento,$direccion,$cuil,$nacionalidad);

                if ($resultado){
                    $identificacion=$this->M_pp->login($this->input->post('email'),(md5($this->input->post('pwd'))));
                    redirect('C_perfil');
                }else{

                   redirect(base_url().'?errores=Es imposible generar el usuario!!!');

                }    
    }else{redirect(base_url().'?errores=El usuario ya existe!!!');}    

    }
    

    
    public function update_datos(){
        if ($this->session->userdata( 'logged_in') == TRUE){
            $id=$this->session->userdata('id');
            $pwd = htmlspecialchars($this->input->post('pwd'));
            $email = htmlspecialchars($this->input->post('email'));
            $nombre = htmlspecialchars($this->input->post('nombre'));
            $apellido = htmlspecialchars($this->input->post('apellido'));
            $direccion = htmlspecialchars($this->input->post('direccion'));
            $cuil = htmlspecialchars($this->input->post('cuil'));
            $nacionalidad = htmlspecialchars($this->input->post('nacionalidad'));
            $nacimiento = htmlspecialchars($this->input->post('nacimiento'));
            $telefono = htmlspecialchars($this->input->post('telefono'));
            $telefono_alt = htmlspecialchars($this->input->post('telefono_alt'));
            $dni = htmlspecialchars($this->input->post('dni'));
            $codigo = htmlspecialchars($this->input->post('codigo'));                    

            $resultado=$this->M_pp->update_datos($pwd,$nombre,$apellido,$email,$telefono,$dni,$codigo,$telefono_alt,$nacimiento,$direccion,$cuil,$nacionalidad);
                                                
                if ($resultado){

                redirect('C_perfil?aceptado=Cambios realizados con exito!!!');
                }else{

                  redirect('C_perfil?errores=No se realizaron cambios el usuario!!!');

                }    
        
        }
        else{    
            redirect(base_url());
            }
    }
    public function modificar_datos(){
        if ($this->session->userdata( 'logged_in') == TRUE){
            $id=$this->session->userdata('id');
            $data['datos_user']=$this->M_pp->datos_usuario($id);
        
            $this->load->view('v_pp_perfil'); 
            $this->load->view('v_pp_datos_usuario',$data);  
        }
        else{    
            redirect(base_url());
            }

    }

    public function bitacora_all(){

        if ($this->session->userdata( 'logged_in') == TRUE){
            $id=$this->session->userdata('id');
            $data['bitacora_user']=$this->M_pp->bitacora_usuario($id);
            $data['asistencia']=$this->M_pp->alumno_presente($id);
            $this->load->view('v_pp_perfil'); 
            $this->load->view('v_pp_bitacora_listar',$data); 
        
        }
        else{    
            redirect(base_url());
            }
    }
    public function add_bitacora(){
        if ($this->session->userdata( 'logged_in') == TRUE){
            $id=$this->session->userdata('id');
            $data['asistencia']=$this->M_pp->alumno_presente($id);
            $this->load->view('v_pp_perfil'); 
            $this->load->view('v_pp_bitacora_add',$data);
        
        }
        else{    
            redirect(base_url());
            }
    }
    public function carpeta_de_campo(){
        if ($this->session->userdata( 'logged_in') == TRUE){
            $id=$this->session->userdata('id');
            $data['datos_carpeta_de_campo']=$this->M_pp->extrae_carpeta_de_campo($id); 
            $this->load->view('v_pp_perfil'); 
            $this->load->view('v_pp_carpeta_de_campo',$data);  
        
        }
        else{    
            redirect(base_url());
            }
    }    
  
       public function cargar_carpeta_de_campo(){

        if ($this->session->userdata( 'logged_in') == TRUE){
            $id=$this->session->userdata('id');
            $nombre_archivo=$this->M_pp->concat_usuario($id);    
            
            $mi_archivo = 'mi_carpeta';
            $config['upload_path'] = "assets/carpetas/";
            $config['file_name'] = $nombre_archivo;
            $config['allowed_types'] = "doc|docx|pdf";
            $config['max_size'] = "50000";
    
            $this->load->library('upload', $config);
            $this->upload->overwrite = true;
            if (!$this->upload->do_upload($mi_archivo)) {
                //*** ocurrio un error
                $data['uploadError'] = $this->upload->display_errors();
                redirect('C_perfil/carpeta_de_campo?errores=No se pudo subir el archivito!!!');
            }else{
                $allData=$this->upload->data();
                $myFile = $allData['file_name'];   
                $valor=$this->M_pp->carpeta_de_campo($id,$myFile);
                redirect('C_perfil/carpeta_de_campo?aceptado=Archivo cargado Correctamente!!!');
            }
    

        
        }
        else{    
            redirect(base_url());
            }
    }  




    public function insertar_bitacora(){

        if ($this->session->userdata( 'logged_in') == TRUE){
            $id=$this->session->userdata('id');
            $titulo = htmlspecialchars($this->input->post('tarea'));
            $descripcion = htmlspecialchars($this->input->post('descripcion'));
        
            @$fecha = date("Y-m-d",time());
            $date = new DateTime($fecha, new DateTimeZone('America/Argentina/Buenos_Aires'));
            date_default_timezone_set('America/Argentina/Buenos_Aires');
            $zonahoraria = date_default_timezone_get();
            @$fecha=date("Y-m-d",time());
        
            $fecha_de_carga = $fecha;
        
            $alumno =$id;
            $resultado=$this->M_pp->insertar_bitacora($alumno, $titulo, $descripcion, $fecha_de_carga);
        
                if ($resultado){
                  redirect('C_perfil?aceptado=Se agregó correctamente a la Bitacora !!!');
                }else{

                   redirect('C_perfil?errores=Problemas para grabar el nuevo registro!!!');

                } 
        
        }
        else{    
            redirect(base_url());
            }
    }
    public function  modificar_bitacora_hoy(){
        if ($this->session->userdata( 'logged_in') == TRUE){
            $id=$this->session->userdata('id');
            $titulo = htmlspecialchars($this->input->post('tarea'));
            $descripcion = htmlspecialchars($this->input->post('descripcion'));        
            $resultado=$this->M_pp->modificar_bitacora($titulo, $descripcion);
        
                if ($resultado){

                  redirect('C_perfil/bitacora_all?aceptado=Se Actualizo correctamente a la Bitacora !!!');
                }else{

                   redirect('C_perfil/?errores=No se realizaron cambios en la bitacora!!!');

                }   
        
        }
        else{    
            redirect(base_url());
            }
    }
     public function evaluacion_personal(){
        if ($this->session->userdata( 'logged_in') == TRUE){
            $this->load->view('v_pp_perfil'); 
            $this->load->view('v_pp_eval_per'); 
        }
        else{    
            redirect(base_url());
            }
    }   
    
    
    
    
    public function ultima_bitacora(){
        if ($this->session->userdata( 'logged_in') == TRUE){
            $id=$this->session->userdata('id');
            $data['bitacora_hoy']=$this->M_pp->ultima_bitacora_usuario($id);
        
            $this->load->view('v_pp_perfil'); 
            $this->load->view('v_pp_bitacora_mod',$data);    
        
        }
        else{    
            redirect(base_url());
            }
    }
public function logout(){
    if ($this->session->userdata( 'logged_in') == TRUE){
        $array_items = array('nombre','id', 'email','logged_in');

        $this->session->unset_userdata($array_items);
        $this->session->sess_destroy();
        redirect(base_url());
    }
    else{    
        redirect(base_url());
        }
}
}