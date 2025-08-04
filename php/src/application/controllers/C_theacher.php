<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class C_theacher extends CI_Controller {

    public function __construct(){
        parent::__construct();
        $this->load->model('M_docentes');
        
    }
    public function index(){
        if ($this->session->userdata( 'logged_in') == TRUE){
            $curso=$this->input->post('curso');
            $data['cursos']=$this->M_docentes->cursos(); 
            if ($curso!=null){
                $data['alumnos']= $this->M_docentes->alumnos($curso);
                $data['curso_id']=$curso;
                
            }
            $this->load->view('docentes/menu');
            $this->load->view('docentes/presentismo',$data);
        }
        else{    
            redirect(base_url());
        }
    }
    public function presentes(){
        if ($this->session->userdata( 'logged_in') == TRUE){
            $presentes=$this->input->post('alumno');
            $cursote=$this->input->post('cursote');
            $this->M_docentes->actualizar_presentes($presentes,$cursote); 
    
            redirect('C_theacher','refresh');
        }
        else{    
            redirect(base_url());
        }
        
    }
    public function bitacoras(){
        if ($this->session->userdata( 'logged_in') == TRUE){
            $curso=$this->input->post('curso');
        
            $data['cursos']=$this->M_docentes->cursos();
            if ($curso!=null){
                $data['bitacoras']=$this->M_docentes->alumno_bitacoras($curso);
                $data['alumnos']= $this->M_docentes->alumnos($curso);
                $data['curso_id']=$curso;
                
            }
            $this->load->view('docentes/menu');
            $this->load->view('docentes/bitacoras',$data);
        }
        else{    
            redirect(base_url());
        }
    }
    public function blanqueo(){
        if ($this->session->userdata( 'logged_in') == TRUE){
            $curso=$this->input->post('curso');
            $alumno_blanqueo=$this->input->get('a');
            $data['cursos']=$this->M_docentes->cursos(); 
            if ($curso!=null){
                $data['alumnos']= $this->M_docentes->alumnos($curso);
                $data['curso_id']=$curso;
                
            }
            if ($alumno_blanqueo!=null){
                $data['pwd_change']= $this->M_docentes->blanqueo($alumno_blanqueo);
            }
            $this->load->view('docentes/menu');
            $this->load->view('docentes/blanqueo',$data);
        }
        else{    
            redirect(base_url());
        }
    }
    public function carpeta_de_campo(){
        if ($this->session->userdata( 'logged_in') == TRUE){
            $curso=$this->input->post('curso');
        
            $data['cursos']=$this->M_docentes->cursos();
            if ($curso!=null){
                $data['campo']=$this->M_docentes->alumno_campo($curso);
                $data['curso_id']=$curso;
                
            }
            $this->load->view('docentes/menu');
            $this->load->view('docentes/carpetas_de_campo',$data);
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