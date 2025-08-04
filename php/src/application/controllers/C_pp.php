<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class C_pp extends CI_Controller {

    public function __construct(){
        parent::__construct();
        $this->load->model('M_pp');
        
    }
        
    
    public function index()
	{   if(($this->input->post('email')!==null)and($this->input->post('pwd')!==null)){
            $identificacion=$this->M_pp->login($this->input->post('email'),(md5($this->input->post('pwd'))));
            if($identificacion=='alumno'){
        

                 redirect('C_perfil');
            }
            if($identificacion=='docente'){                
                redirect('C_theacher','refresh');
            }
            if($identificacion=='referente'){                
                redirect('C_referrer','refresh');
            }
            if($identificacion=='admin'){                
                redirect('C_admin','refresh');
            }
                
            if($identificacion==false){
               redirect(base_url().'?errores=Los datos no coinciden con ningun usuario!!!');;
            }
        }
        $this->load->view('v_pp_home'); 
	}
    public function registro(){
        $this->load->view('v_pp_home_registro');
    }
}

