// Script para inicializar la base de datos
const mysql = require('mysql2/promise');
const { pool } = require('../config/db');
require('dotenv').config();

// Función para crear las tablas en la base de datos
const initDatabase = async () => {
  try {
    // Crear conexión temporal sin base de datos
    const tempConnection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT
    });
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
    console.log(`Base de datos '${process.env.DB_NAME}' creada o ya existente.`);
    await tempConnection.end();

    // Ahora usar el pool normal para crear tablas
    const connection = await pool.getConnection();
    console.log('Conectado a MySQL. Inicializando base de datos...');
    
    await connection.query(`USE ${process.env.DB_NAME}`);
    
    // Crear tabla de usuarios
    await connection.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        contraseña VARCHAR(255) NOT NULL,
        estilo_escritura VARCHAR(100),
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Crear tabla de blogs
    await connection.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        api_url VARCHAR(255),
        wp_user VARCHAR(100),
        api_key VARCHAR(255),
        favicon VARCHAR(255),
        palabras_clave TEXT,
        tematica VARCHAR(100),
        usuario_id INT NOT NULL,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      )
    `);
    
    // Verificar si necesitamos añadir la columna api_key (para actualizaciones)
    const [columns] = await connection.query(`SHOW COLUMNS FROM blogs LIKE 'api_key'`);
    if (columns.length === 0) {
      await connection.query(`ALTER TABLE blogs ADD COLUMN api_key VARCHAR(255) AFTER api_url`);
      console.log('Columna api_key añadida a la tabla blogs');
    }

    // Verificar si necesitamos añadir la columna wp_user (para actualizaciones)
    const [wpUserColumns] = await connection.query(`SHOW COLUMNS FROM blogs LIKE 'wp_user'`);
    if (wpUserColumns.length === 0) {
      await connection.query(`ALTER TABLE blogs ADD COLUMN wp_user VARCHAR(100) AFTER api_url`);
      console.log('Columna wp_user añadida a la tabla blogs');
    }
    
    console.log('Base de datos inicializada correctamente');
    connection.release();
    return true;
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    return false;
  }
};

// Ejecutar la inicialización si este archivo se ejecuta directamente
if (require.main === module) {
  initDatabase()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Error durante la inicialización:', err);
      process.exit(1);
    });
}

module.exports = { initDatabase };