const mysql = require('mysql2/promise');
async function run() {
  const conn = await mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'scrum_eval' });
  await conn.execute(`CREATE TABLE IF NOT EXISTS annual_closing_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cell_id INT NOT NULL,
    user_id INT NOT NULL,
    mvp_group_score DECIMAL(5,1) DEFAULT NULL,
    individual_work_score DECIMAL(5,1) DEFAULT NULL,
    group_work_score DECIMAL(5,1) DEFAULT NULL,
    defense_score DECIMAL(5,1) DEFAULT NULL,
    documentation_ok TINYINT(1) DEFAULT NULL,
    certifications_ok TINYINT(1) DEFAULT NULL,
    notebook_pages INT DEFAULT NULL,
    attendance_hours DECIMAL(5,1) DEFAULT NULL,
    final_score DECIMAL(5,1) DEFAULT NULL,
    approved TINYINT(1) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_cell_user (cell_id, user_id)
  )`);
  console.log('Tabla annual_closing_data creada exitosamente');
  await conn.end();
}
run().catch(e => console.error(e.message));
