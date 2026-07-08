import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_ENCUENTRO_HOST || 'localhost',
  user: process.env.DB_ENCUENTRO_USER || 'root',
  password: process.env.DB_ENCUENTRO_PASSWORD !== undefined ? process.env.DB_ENCUENTRO_PASSWORD : '',
  database: process.env.DB_ENCUENTRO_NAME || 'epiz_27864677_encuentro',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
});

export default pool;
