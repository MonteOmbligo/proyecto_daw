'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useWordPressForm from '../hooks/useWordPressForm';
import useBlogManagement from '../hooks/useBlogManagement';
import AddBlogModal from './components/AddBlogModal';
import FaviconImage from './components/FaviconImage';
import Image from 'next/image';
import type { Blog } from '../services/blogService';

// ID del usuario actual (en una aplicación real, esto se obtendría del sistema de autenticación)
const CURRENT_USER_ID = 1;

export default function HomePage() {
  const [serverOnline, setServerOnline] = useState(true);
  // Estado para el blog seleccionado
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        await axios.get('/api/health');
        setServerOnline(true);
      } catch {
        setServerOnline(false);
      }
    };
    checkServerStatus();
  }, []);

  // Usar los hooks personalizados
  const {
    isLoading: wpLoading,
    message,
    formData: wpFormData,
    handleInputChange: handleWpInputChange,
    handleFileChange,
    publishToWordPress
  } = useWordPressForm(selectedBlog);
  
  // Hook para la gestión de blogs
  const {
    blogs: userBlogs,
    isLoading: blogsLoading,
    error: blogsError,
    showModal,
    formData: blogFormData,
    handleInputChange: handleBlogInputChange,
    handleSubmit: handleBlogSubmit,
    openModal,
    closeModal,
    deleteBlog
  } = useBlogManagement(CURRENT_USER_ID);

  // Manejar selección desde el sidebar
  const handleSidebarBlogClick = (blog: Blog) => {
    setSelectedBlog(blog);
  };

  // Manejar selección desde el selector
  const handleSelectorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const blog = userBlogs.find(b => b.id === Number(e.target.value));
    setSelectedBlog(blog || null);
  };

  return (
    <>
      {!serverOnline && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>El servidor backend no está disponible. Algunas funciones estarán limitadas.</p>
        </div>
      )}
      <div className="grid grid-cols-[auto_1fr_auto] h-screen">

        {/* Sidebar Izquierda */}
        <aside className="w-64 bg-gray-100 p-4 flex flex-col justify-between menu">
          {/* Logo Section */}
          <div>
            <div className="mb-8 text-center font-bold text-xl">
              <Image src="" alt="Logo" width={64} height={64} className="w-16 h-16 mx-auto mb-2" />
            </div>
            
            {/* Blog Management */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">Mis Blogs</h2>
                <button 
                  onClick={openModal}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                  disabled={blogsLoading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Añadir
                </button>
              </div>
              
              {/* List of user blogs with favicon */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {blogsLoading ? (
                  <p className="text-sm text-gray-500">Cargando blogs...</p>
                ) : userBlogs.length === 0 ? (
                  <p className="text-sm text-gray-500">No tienes blogs añadidos</p>
                ) : (
                  userBlogs.map((blog) => (
                    <div
                      key={blog.id}
                      className={`flex items-center p-2 border rounded hover:bg-gray-200 cursor-pointer ${selectedBlog?.id === blog.id ? 'bg-blue-100 border-blue-400' : ''}`}
                      onClick={() => handleSidebarBlogClick(blog)}
                    >                      <FaviconImage
                        src={blog.favicon || `https://www.google.com/s2/favicons?domain=${blog.api_url}&sz=64`}
                        alt={blog.nombre}
                      />
                      <span className="flex-grow text-sm truncate">{blog.nombre}</span>
                      <button 
                        onClick={e => { e.stopPropagation(); deleteBlog(blog.id!); }}
                        className="text-red-500 hover:text-red-700"
                        title="Eliminar blog"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Blog Selection Section */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Seleccionar Blog</h2>
            {/* Selector de blogs con datos reales */}
            <select 
              aria-label="Seleccionar Blog" 
              className="w-full p-2 border rounded"
              value={selectedBlog?.id || ''}
              onChange={handleSelectorChange}
            >
              <option value="">Seleccionar...</option>
              {userBlogs.map(blog => (
                <option key={blog.id} value={blog.id}>
                  {blog.nombre}
                </option>
              ))}
            </select>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-8 pb-0 overflow-y-auto my-auto">
          <div className="mt-8 mb-6">
            <h1 className="text-5xl font-bold mb-2">Crear nueva entrada</h1>
            <h2 className="text-3xl text-gray-600">
              Para {selectedBlog ? `'${selectedBlog.nombre}'` : 'el blog seleccionado'}
            </h2>
            
            {/* Mensaje de éxito/error */}
            {message.text && (
              <div className={`mt-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {message.text}
              </div>
            )}
          </div>
          
          {/* Formulario con layout de dos columnas */}
          <form className="flex flex-col md:flex-row gap-6" onSubmit={publishToWordPress}>
            {/* Columna izquierda - Campo de título y contenido (2/3 del ancho) */}
            <div className="md:w-2/3">
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input 
                  type="text" 
                  id="title" 
                  name="title" 
                  className="w-full p-2 border rounded" 
                  placeholder="Introduce el título" 
                  value={wpFormData.title}
                  onChange={handleWpInputChange}
                  required
                />
              </div>
              
              <div className="">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
                <textarea 
                  id="content" 
                  name="content" 
                  rows={33}
                  className="w-full p-2 border rounded h-full" 
                  placeholder="Escribe el contenido de la entrada"
                  value={wpFormData.content}
                  onChange={handleWpInputChange}
                  required
                ></textarea>
              </div>
            </div>
            
            {/* Columna derecha - Resto de campos (1/3 del ancho) */}
            <div className="md:w-1/3">
              <div className="mb-4">
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">Extracto (Resumen)</label>
                <textarea 
                  id="excerpt" 
                  name="excerpt" 
                  rows={3} 
                  className="w-full p-2 border rounded" 
                  placeholder="Escribe un resumen opcional"
                  value={wpFormData.excerpt}
                  onChange={handleWpInputChange}
                ></textarea>
              </div>

              <div className="mb-4">
                <label htmlFor="featured_image" className="block text-sm font-medium text-gray-700 mb-1">Imagen Destacada</label>
                <input 
                  type="file" 
                  id="featured_image" 
                  name="featured_image"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full p-2 border rounded file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="categories" className="block text-sm font-medium text-gray-700 mb-1">Categorías</label>
                <input 
                  type="text" 
                  id="categories" 
                  name="categories" 
                  className="w-full p-2 border rounded" 
                  placeholder="Separadas por comas" 
                  value={wpFormData.categories}
                  onChange={handleWpInputChange}
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">Etiquetas</label>
                <input 
                  type="text" 
                  id="tags" 
                  name="tags" 
                  className="w-full p-2 border rounded" 
                  placeholder="Separadas por comas" 
                  value={wpFormData.tags}
                  onChange={handleWpInputChange}
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select 
                  id="status" 
                  name="status" 
                  className="w-full p-2 border rounded"
                  value={wpFormData.status}
                  onChange={handleWpInputChange}
                >
                  <option value="draft">Borrador</option>
                  <option value="publish">Publicada</option>
                  <option value="pending">Pendiente de revisión</option>
                </select>
              </div>
              
              <button 
                type="submit" 
                className={`w-full px-4 py-2 rounded ${wpLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                disabled={wpLoading || !selectedBlog}
              >
                {wpLoading ? 'Publicando...' : 'Publicar Entrada'}
              </button>
            </div>
          </form>
        </main>

        {/* Sidebar Derecha */}
        <aside className="w-52 bg-gray-50 p-4">
          <h2 className="text-lg font-semibold mb-4">Funcionalidades Adicionales</h2>
          {/* Aquí se añadirán las tarjetas con funcionalidades futuras */}
          <div className="border border-dashed border-gray-300 p-4 rounded text-center text-gray-500">
            Próximamente: Tarjetas con funcionalidades
          </div>
        </aside>

        {/* Modal para añadir blogs */}
        <AddBlogModal
          show={showModal}
          onClose={closeModal}
          formData={blogFormData}
          onChange={handleBlogInputChange}
          onSubmit={handleBlogSubmit}
          isLoading={blogsLoading}
          error={blogsError}
        />
      </div>
    </>
  );
}

