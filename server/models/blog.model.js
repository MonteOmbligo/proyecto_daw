const { pool } = require('../config/db');

class Blog {
  // Crear un nuevo blog
  static async crear(blog) {
    try {
      const [result] = await pool.query(
        'INSERT INTO blogs (nombre, api_url, wp_user, api_key, favicon, palabras_clave, tematica, usuario_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [blog.nombre, blog.api_url, blog.wp_user, blog.api_key, blog.favicon, blog.palabras_clave, blog.tematica, blog.usuario_id]
      );
      
      return { id: result.insertId, ...blog };
    } catch (error) {
      console.error('Error al crear blog:', error);
      throw error;
    }
  }
  
  // Buscar blog por ID
  static async buscarPorId(id) {
    try {
      const [blogs] = await pool.query(
        'SELECT * FROM blogs WHERE id = ?',
        [id]
      );
      
      return blogs.length > 0 ? blogs[0] : null;
    } catch (error) {
      console.error('Error al buscar blog por ID:', error);
      throw error;
    }
  }
  
  // Buscar blogs por usuario ID
  static async buscarPorUsuarioId(usuarioId) {
    try {
      const [blogs] = await pool.query(
        'SELECT * FROM blogs WHERE usuario_id = ?',
        [usuarioId]
      );
      
      return blogs;
    } catch (error) {
      console.error('Error al buscar blogs por ID de usuario:', error);
      throw error;
    }
  }
  
  // Actualizar un blog
  static async actualizar(id, datosActualizados) {
    try {
      // Construir la consulta dinámicamente según los campos proporcionados
      const campos = Object.keys(datosActualizados);
      const valores = Object.values(datosActualizados);
      
      if (campos.length === 0) return null;
      
      const consulta = `
        UPDATE blogs 
        SET ${campos.map(campo => `${campo} = ?`).join(', ')} 
        WHERE id = ?
      `;
      
      const [result] = await pool.query(consulta, [...valores, id]);
      
      return result.affectedRows > 0 
        ? { id, ...datosActualizados } 
        : null;
    } catch (error) {
      console.error('Error al actualizar blog:', error);
      throw error;
    }
  }
  
  // Eliminar un blog
  static async eliminar(id) {
    try {
      const [result] = await pool.query('DELETE FROM blogs WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al eliminar blog:', error);
      throw error;
    }
  }
  
  // Listar todos los blogs
  static async listarTodos() {
    try {
      const [blogs] = await pool.query('SELECT * FROM blogs');
      return blogs;
    } catch (error) {
      console.error('Error al listar blogs:', error);
      throw error;
    }
  }
}

module.exports = Blog;