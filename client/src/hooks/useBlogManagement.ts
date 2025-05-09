import { useState, useEffect } from 'react';
import blogService, { Blog } from '../services/blogService';
import axios from 'axios';

export interface BlogFormData {
  nombre: string;
  api_url: string;
  wp_user: string; // Usuario de WordPress
  api_key: string;
  tematica: string;
  palabras_clave?: string;
  usuario_id: number;
}

export interface UseBlogManagementResult {
  blogs: Blog[];
  isLoading: boolean;
  error: string | null;
  showModal: boolean;
  formData: BlogFormData;
  resetFormData: () => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  openModal: () => void;
  closeModal: () => void;
  deleteBlog: (id: number) => Promise<void>;
}

/**
 * Hook personalizado para gestionar los blogs
 * @param userId ID del usuario actual
 */
export const useBlogManagement = (userId: number = 1): UseBlogManagementResult => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [formData, setFormData] = useState<BlogFormData>({
    nombre: '',
    api_url: '',
    wp_user: '',
    api_key: '',
    tematica: '',
    palabras_clave: '',
    usuario_id: userId
  });
  
  // Cargar blogs cuando cambia el userId
  useEffect(() => {
    const fetchBlogs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await blogService.getBlogsByUser(userId);
        setBlogs(data);
      } catch (err) {
        console.error('Error al cargar blogs:', err);
        setError('Error al cargar los blogs. Por favor, inténtalo de nuevo.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, [userId]);
  
  // Reset del formulario a valores iniciales
  const resetFormData = () => {
    setFormData({
      nombre: '',
      api_url: '',
      wp_user: '',
      api_key: '',
      tematica: '',
      palabras_clave: '',
      usuario_id: userId
    });
  };
  
  // Manejar cambios en los campos del formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  // Enviar formulario para crear un nuevo blog
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Extraer el favicon de la URL
      const faviconUrl = await blogService.extractFavicon(formData.api_url);
      
      // Crear el blog con el favicon
      const newBlog = await blogService.createBlog({
        ...formData,
        favicon: faviconUrl
      });
      
      // Actualizar la lista de blogs
      setBlogs([...blogs, newBlog]);
      resetFormData();
      setShowModal(false);
    } catch (err) {
      console.error('Error al crear blog:', err);
      setError('Error al crear el blog. Por favor, verifica los datos e inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Eliminar un blog
  const deleteBlog = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este blog?')) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await blogService.deleteBlog(id);
      setBlogs(blogs.filter(blog => blog.id !== id));
    } catch (err) {
      console.error('Error al eliminar blog:', err);
      setError('Error al eliminar el blog. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Controladores de modal
  const openModal = () => setShowModal(true);
  const closeModal = () => {
    resetFormData();
    setShowModal(false);
  };
  
  return {
    blogs,
    isLoading,
    error,
    showModal,
    formData,
    resetFormData,
    handleInputChange,
    handleSubmit,
    openModal,
    closeModal,
    deleteBlog
  };
};

// Modificar el servicio para manejar errores y usar datos simulados
const mockBlogs = [
  { id: 1, nombre: 'Blog de prueba', api_url: 'https://ejemplo.com', favicon: '/img/default-favicon.png' }
];

// Define API_URL at the top of the file or import it from your config
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const getBlogsByUser = async (userId: number) => {
  try {
    const response = await axios.get(`${API_URL}/usuarios/${userId}/blogs`);
    return response.data;
  } catch (error) {
    console.warn('Error al obtener blogs del usuario:', error);
    return mockBlogs;
  }
};

export default useBlogManagement;