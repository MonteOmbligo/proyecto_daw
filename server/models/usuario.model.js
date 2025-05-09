const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

class Usuario {
  // Crear un nuevo usuario
  static async crear(usuario) {
    try {
      // Hash de la contraseña antes de guardarla
      const salt = await bcrypt.genSalt(10);
      const contraseñaHash = await bcrypt.hash(usuario.contraseña, salt);
      
      const [result] = await pool.query(
        'INSERT INTO usuarios (nombre, email, contraseña, estilo_escritura) VALUES (?, ?, ?, ?)',
        [usuario.nombre, usuario.email, contraseñaHash, usuario.estilo_escritura]
      );
      
      return { id: result.insertId, ...usuario, contraseña: undefined };
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }
  
  // Buscar usuario por ID
  static async buscarPorId(id) {
    try {
      const [usuarios] = await pool.query(
        'SELECT id, nombre, email, estilo_escritura, fecha_creacion, fecha_actualizacion FROM usuarios WHERE id = ?',
        [id]
      );
      
      return usuarios.length > 0 ? usuarios[0] : null;
    } catch (error) {
      console.error('Error al buscar usuario por ID:', error);
      throw error;
    }
  }
  
  // Buscar usuario por email (para login)
  static async buscarPorEmail(email) {
    try {
      const [usuarios] = await pool.query(
        'SELECT * FROM usuarios WHERE email = ?',
        [email]
      );
      
      return usuarios.length > 0 ? usuarios[0] : null;
    } catch (error) {
      console.error('Error al buscar usuario por email:', error);
      throw error;
    }
  }
  
  // Actualizar un usuario
  static async actualizar(id, datosActualizados) {
    try {
      // Si hay nueva contraseña, la hasheamos
      if (datosActualizados.contraseña) {
        const salt = await bcrypt.genSalt(10);
        datosActualizados.contraseña = await bcrypt.hash(datosActualizados.contraseña, salt);
      }
      
      // Construir la consulta dinámicamente según los campos proporcionados
      const campos = Object.keys(datosActualizados);
      const valores = Object.values(datosActualizados);
      
      if (campos.length === 0) return null;
      
      const consulta = `
        UPDATE usuarios 
        SET ${campos.map(campo => `${campo} = ?`).join(', ')} 
        WHERE id = ?
      `;
      
      const [result] = await pool.query(consulta, [...valores, id]);
      
      return result.affectedRows > 0 
        ? { id, ...datosActualizados } 
        : null;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  }
  
  // Eliminar un usuario
  static async eliminar(id) {
    try {
      const [result] = await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  }
  
  // Listar todos los usuarios
  static async listarTodos() {
    try {
      const [usuarios] = await pool.query(
        'SELECT id, nombre, email, estilo_escritura, fecha_creacion, fecha_actualizacion FROM usuarios'
      );
      return usuarios;
    } catch (error) {
      console.error('Error al listar usuarios:', error);
      throw error;
    }
  }
}

module.exports = Usuario;