const axios = require('axios');
const Blog = require('../models/blog.model');

/**
 * Controlador para manejar operaciones con WordPress
 */
const WordPressController = {
  /**
   * Publica una entrada en WordPress utilizando la API REST
   * @param {Object} req - Objeto de solicitud de Express
   * @param {Object} res - Objeto de respuesta de Express
   */
  publishPost: async (req, res) => {
    try {
      const blogId = req.params.blogId;
      
      // Buscar el blog por ID para obtener la URL de la API
      const blog = await Blog.buscarPorId(blogId);
      
      if (!blog) {
        return res.status(404).json({ mensaje: 'Blog no encontrado' });
      }
      
      // Verificar que el blog tiene una URL de API
      if (!blog.api_url) {
        return res.status(400).json({ mensaje: 'Este blog no tiene configurada una URL de API de WordPress' });
      }
      
      // Preparar autenticación básica para WordPress
      if (!blog.wp_user || !blog.api_key) {
        return res.status(400).json({ mensaje: 'El blog no tiene usuario o contraseña de aplicación configurados.' });
      }
      const basicAuth = Buffer.from(`${blog.wp_user}:${blog.api_key}`).toString('base64');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${basicAuth}`
        }
      };
      
      // Preparar los datos para la API de WordPress
      const postData = {
        title: req.body.title,
        content: req.body.content,
        excerpt: req.body.excerpt,
        status: req.body.status || 'draft',
      };
      
      // Procesar categorías y etiquetas si existen
      if (req.body.categories) {
        try {
          postData.categories = JSON.parse(req.body.categories);
        } catch (e) {
          console.error('Error al procesar categorías:', e);
        }
      }
      
      if (req.body.tags) {
        try {
          postData.tags = JSON.parse(req.body.tags);
        } catch (e) {
          console.error('Error al procesar etiquetas:', e);
        }
      }
      
      // Realizar la petición a WordPress
      const wpEndpoint = `${blog.api_url}/wp-json/wp/v2/posts`;
      
      // Si hay imagen destacada, subirla con autenticación básica
      if (req.file) {
        const mediaFormData = new FormData();
        mediaFormData.append('file', req.file.buffer, {
          filename: req.file.originalname,
          contentType: req.file.mimetype
        });
        
        const mediaResponse = await axios.post(
          `${blog.api_url}/wp-json/wp/v2/media`, 
          mediaFormData,
          {
            ...config,
            headers: {
              ...config.headers,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        // Añadir la ID de la media al post
        if (mediaResponse.data && mediaResponse.data.id) {
          postData.featured_media = mediaResponse.data.id;
        }
      }
      
      // Crear el post
      const response = await axios.post(wpEndpoint, postData, config);
      
      res.status(201).json({
        mensaje: 'Entrada publicada correctamente en WordPress',
        postId: response.data.id,
        postUrl: response.data.link
      });
      
    } catch (error) {
      console.error('Error al publicar en WordPress:', error.message);
      res.status(500).json({
        mensaje: 'Error al publicar en WordPress',
        error: error.message,
        detalle: error.response ? error.response.data : undefined
      });
    }
  }
};

module.exports = WordPressController;