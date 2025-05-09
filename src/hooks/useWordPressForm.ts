import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import wordpressService from '../services/wordpressService';

// Interfaces
export interface Blog {
  id: number;
  nombre: string;
  api_url: string;
  api_key?: string;
  usuario_id: number;
  favicon: string;
}

export interface FormData {
  title: string;
  content: string;
  excerpt: string;
  featured_image: File | null;
  categories: string;
  tags: string;
  status: 'draft' | 'publish' | 'pending';
}

export interface Message {
  text: string;
  type: 'success' | 'error' | '';
}

/**
 * Hook personalizado para manejar la lógica del formulario de publicación en WordPress
 * Recibe el blog seleccionado y lo usa para publicar la entrada.
 */
export const useWordPressForm = (selectedBlog: Blog | null) => {
  // Estado para blogs (opcional, si quieres mostrar blogs desde aquí)
  // const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<Message>({
    text: '',
    type: '',
  });

  // Estado del formulario
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    excerpt: '',
    featured_image: null,
    categories: '',
    tags: '',
    status: 'draft'
  });

  // Manejadores de eventos
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        featured_image: e.target.files[0]
      });
    }
  };

  // Función para publicar en WordPress
  const publishToWordPress = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedBlog) {
      setMessage({
        text: 'Por favor, selecciona un blog primero.',
        type: 'error'
      });
      return;
    }
    setIsLoading(true);
    setMessage({ text: '', type: '' });
    try {
      await wordpressService.publishPost(selectedBlog, {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        categories: formData.categories,
        tags: formData.tags,
        status: formData.status,
        featured_media: formData.featured_image || undefined
      });
      setMessage({
        text: '¡Entrada publicada con éxito en WordPress!',
        type: 'success'
      });
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        featured_image: null,
        categories: '',
        tags: '',
        status: 'draft'
      });
    } catch (error) {
      console.error('Error al publicar en WordPress:', error);
      setMessage({
        text: 'Error al publicar en WordPress. Por favor, inténtalo de nuevo.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    message,
    formData,
    handleInputChange,
    handleFileChange,
    publishToWordPress
  };
};

export default useWordPressForm;