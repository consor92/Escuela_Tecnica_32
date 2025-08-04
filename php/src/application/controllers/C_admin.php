<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class C_admin extends CI_Controller {

    public function __construct(){
        parent::__construct();
        $this->load->model('M_pp');
        
    }
    public function index(){
        echo "administrador";
    }




}