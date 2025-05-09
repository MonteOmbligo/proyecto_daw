// Configuración de la conexión a la base de datos
const mysql = require('mysql2/promise');
require('dotenv').config();

// Crear un pool de conexiones para mejor rendimiento
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME, // Usar la base de datos para operaciones normales
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Verificar la conexión
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Conexión a la base de datos MySQL establecida correctamente');
    connection.release();
    return true;
  } catch (error) {
    console.error('Error al conectar a la base de datos MySQL:', error);
    return false;
  }
};

module.exports = {
  pool,
  testConnection
};