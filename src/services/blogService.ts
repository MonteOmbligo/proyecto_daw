import axios from 'axios';

export interface Blog {
  id: number;
  nombre: string;
  api_url: string;
  api_key?: string;
  usuario_id: number;
  favicon: string;
  palabras_clave?: string;
  tematica: string;
  wp_user?: string;
}

/**
 * Servicio para manejar las operaciones relacionadas con los blogs
 */
export const blogService = {
  /**
   * Obtener todos los blogs
   */
  getBlogs: async () => {
    const response = await axios.get('/api/blogs');
    return response.data;
  },

  /**
   * Obtener blogs de un usuario específico
   * @param userId ID del usuario
   */
  getBlogsByUser: async (userId: number) => {
    const response = await axios.get(`/api/usuarios/${userId}/blogs`);
    return response.data;
  },
  /**
   * Crear un nuevo blog
   * @param blog Datos del nuevo blog
   */
  createBlog: async (blog: Omit<Blog, 'id'>) => {
    const response = await axios.post('/api/blogs', blog);
    return response.data;
  },

  /**
   * Actualizar un blog existente
   * @param id ID del blog a actualizar
   * @param blog Datos actualizados del blog
   */
  updateBlog: async (id: number, blog: Partial<Blog>) => {
    const response = await axios.put(`/api/blogs/${id}`, blog);
    return response.data;
  },

  /**
   * Eliminar un blog
   * @param id ID del blog a eliminar
   */
  deleteBlog: async (id: number) => {
    const response = await axios.delete(`/api/blogs/${id}`);
    return response.data;
  },
  /**
   * Extraer el favicon de una URL
   * @param url URL del sitio web
   */
  extractFavicon: async (url: string) => {
    try {
      const response = await axios.post('/api/utils/extract-favicon', { url });
      return response.data.favicon || 'https://www.google.com/s2/favicons?domain=' + url;
    } catch (error) {
      console.error('Error al extraer el favicon:', error);
      // URL por defecto para favicon si falla la extracción
      return 'https://www.google.com/s2/favicons?domain=' + url;
    }
  }
};

export default blogService;