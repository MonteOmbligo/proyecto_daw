import axios from 'axios';

interface WordPressPostData {
  title: string;
  content: string;
  excerpt: string;
  categories?: string;
  tags?: string;
  status: 'draft' | 'publish' | 'pending';
  featured_media?: File;
  wp_user?: string;      // Credencial de WordPress
  wp_password?: string;  // Password de aplicación de WordPress
}

interface Blog {
  id: number;
  nombre: string;
  api_url: string;
  api_key?: string;
  wp_user?: string;
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
      // Verificar si tenemos un archivo adjunto
    const hasFile = postData.featured_media !== undefined;
    
    interface RequestDataType {
      title: string;
      content: string;
      excerpt: string;
      status: string;
      categories?: string[];
      tags?: string[];
      wp_user?: string;
      wp_password?: string;
    }
    
    let requestData: RequestDataType | FormData;
    let headers: Record<string, string> = {};
    
    if (hasFile) {
      // Si hay un archivo, usamos FormData
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
  
      // Adjuntar imagen destacada
      if (postData.featured_media) {
        formData.append('featured_media', postData.featured_media);
      }
      
      // Agregar credenciales de WordPress si están disponibles
      if (blog.wp_user) {
        formData.append('wp_user', blog.wp_user);
      }
      if (blog.api_key) {
        formData.append('wp_password', blog.api_key);
      }
      
      headers = { 'Content-Type': 'multipart/form-data' };
      requestData = formData;
    } else {
      // Si no hay archivo, usamos JSON (más confiable en serverless)
      requestData = {
        title: postData.title,
        content: postData.content,
        excerpt: postData.excerpt,
        status: postData.status,
        categories: postData.categories ? 
          postData.categories.split(',').map(cat => cat.trim()) : 
          [],
        tags: postData.tags ? 
          postData.tags.split(',').map(tag => tag.trim()) : 
          []
      };
      
      // Agregar credenciales de WordPress si están disponibles
      if (blog.wp_user) {
        requestData.wp_user = blog.wp_user;
      }
      if (blog.api_key) {
        requestData.wp_password = blog.api_key;
      }
      
      headers = { 'Content-Type': 'application/json' };
    }
    
    // Realizar la petición
    console.log(`Enviando post al blog ${blog.nombre} (ID: ${blog.id})`);
    return await axios.post(
      `/api/wordpress/post/${blog.id}`,
      requestData,
      { headers }
    );
  },
  
  /**
   * Obtiene todos los blogs disponibles
   * @returns Lista de blogs
   */
  getBlogs: async () => {
    const response = await axios.get('/api/blogs');
    return response.data;
  }
};

export default wordpressService;
