import axios from 'axios';

interface WordPressPostData {
  title: string;
  content: string;
  excerpt: string;
  categories?: string;
  tags?: string;
  status: 'draft' | 'publish' | 'pending';
  featured_media?: File;
}

interface Blog {
  id: number;
  nombre: string;
  api_url: string;
  api_key?: string;
}

/**
 * Servicio para manejar las operaciones relacionadas con WordPress
 */
export const wordpressService = {
  /**
   * Publica un post en WordPress a través de la API de nuestro servidor
   * @param blog El blog seleccionado para publicar
   * @param postData Datos del post a publicar
   * @returns Respuesta de la API
   */
  publishPost: async (blog: Blog, postData: WordPressPostData) => {
    if (!blog) {
      throw new Error('No se ha seleccionado ningún blog');
    }
    
    // Crear objeto FormData para enviar archivos
    const formData = new FormData();
    formData.append('title', postData.title);
    formData.append('content', postData.content);
    formData.append('excerpt', postData.excerpt);
    formData.append('status', postData.status);
    
    // Procesar categorías y etiquetas
    if (postData.categories) {
      const categoriesArray = postData.categories.split(',').map(cat => cat.trim());
      formData.append('categories', JSON.stringify(categoriesArray));
    }
    
    if (postData.tags) {
      const tagsArray = postData.tags.split(',').map(tag => tag.trim());
      formData.append('tags', JSON.stringify(tagsArray));
    }

    // Si hay una imagen destacada
    if (postData.featured_media) {
      formData.append('featured_media', postData.featured_media);
    }

    // Configuración de la petición
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(blog.api_key && { 'Authorization': `Bearer ${blog.api_key}` })
      }
    };

    // Realizar la petición a nuestro servidor
    return await axios.post(
      `http://localhost:3001/api/wordpress/post/${blog.id}`,
      formData,
      config
    );
  },
  
  /**
   * Obtiene todos los blogs disponibles
   * @returns Lista de blogs
   */
  getBlogs: async () => {
    const response = await axios.get('http://localhost:3001/api/blogs');
    return response.data;
  }
};

export default wordpressService;