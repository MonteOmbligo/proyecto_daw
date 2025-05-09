'use client';

import React from 'react';
import { BlogFormData } from '../../hooks/useBlogManagement';

interface AddBlogModalProps {
  show: boolean;
  onClose: () => void;
  formData: BlogFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AddBlogModal: React.FC<AddBlogModalProps> = ({
  show,
  onClose,
  formData,
  onChange,
  onSubmit,
  isLoading,
  error
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Añadir Nuevo Blog</h2>
        
        {error && (
          <div className="bg-red-100 text-red-800 p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="nombre">
              Nombre del Blog
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={onChange}
              className="w-full p-2 border rounded"
              placeholder="Nombre de tu blog"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="api_url">
              URL del blog
            </label>
            <input
              type="url"
              id="api_url"
              name="api_url"
              value={formData.api_url}
              onChange={onChange}
              className="w-full p-2 border rounded"
              placeholder="https://tuweb.com"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Introduce la URL de tu sitio WordPress (el favicon se extraerá automáticamente)
            </p>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="wp_user">
              Usuario de WordPress
            </label>
            <input
              type="text"
              id="wp_user"
              name="wp_user"
              value={formData.wp_user}
              onChange={onChange}
              className="w-full p-2 border rounded"
              placeholder="Usuario de WordPress"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="api_key">
              Contraseña de Aplicación
            </label>
            <input
              type="password"
              id="api_key"
              name="api_key"
              value={formData.api_key}
              onChange={onChange}
              className="w-full p-2 border rounded"
              placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Crea una contraseña de aplicación en WordPress: Tu perfil → Contraseñas de aplicación
            </p>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="tematica">
              Temática del Blog
            </label>
            <input
              type="text"
              id="tematica"
              name="tematica"
              value={formData.tematica}
              onChange={onChange}
              className="w-full p-2 border rounded"
              placeholder="Tecnología, Viajes, Cocina, etc."
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="palabras_clave">
              Palabras Clave (Opcional)
            </label>
            <textarea
              id="palabras_clave"
              name="palabras_clave"
              value={formData.palabras_clave || ''}
              onChange={onChange}
              className="w-full p-2 border rounded"
              placeholder="Palabras clave separadas por comas"
              rows={2}
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
              disabled={isLoading}
            >
              {isLoading ? 'Guardando...' : 'Guardar Blog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBlogModal;