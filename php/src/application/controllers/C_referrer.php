<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class C_referrer extends CI_Controller {

    public function __construct(){
        parent::__construct();
        $this->load->model('M_referrer');
        $this->load->library('export_excel');
        $anio=0;
        
    }
    public function index(){
        if ($this->session->userdata( 'logged_in') == TRUE){
            if(($this->input->post('anio')!=null)and($this->input->post('anio')!=0)){
                $anio=$this->input->post('anio');
            }else{
                $anio=date('Y');
            } 
            
            $data['cursos']=$this->M_referrer->cursos($anio); 
            $this->load->view('referrer/menu');
            $this->load->view('referrer/inicio',$data);
        }
        else{    
            redirect(base_url());
        }
    }
    public function excel(){
        $aux=$this->input->get('curso');
        
        $data['alumnos']=$this->M_referrer->datos_usuario_completo($aux);
        $data['curse']=$this->M_referrer->curso_datos($aux);
        
        $this->load->view('tools/excel',$data);
    }



}