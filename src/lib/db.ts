// Simulación de base de datos en memoria para serverless
import { Blog } from '../hooks/useWordPressForm';

interface UserType {
  id: number;
  nombre: string;
  email: string;
  password: string;
}

// Estado inicial (puedes cargarlo desde localStorage para persistencia)
let blogs: Blog[] = [];
let usuarios: UserType[] = [{ id: 1, nombre: "Usuario Demo", email: "demo@example.com", password: "password" }];

// Intentar cargar datos previos desde localStorage (solo funciona en cliente)
const loadFromStorage = () => {
  if (typeof window !== 'undefined') {
    const storedBlogs = localStorage.getItem('blogs');
    const storedUsers = localStorage.getItem('usuarios');
    
    if (storedBlogs) blogs = JSON.parse(storedBlogs);
    if (storedUsers) usuarios = JSON.parse(storedUsers);
  }
};

// Guardar datos en localStorage (solo funciona en cliente)
const saveToStorage = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('blogs', JSON.stringify(blogs));
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
  }
};

// Servicio de blogs
export const blogService = {
  getAll: async (): Promise<Blog[]> => {
    loadFromStorage();
    return blogs;
  },
  
  getByUserId: async (userId: number): Promise<Blog[]> => {
    loadFromStorage();
    return blogs.filter(blog => blog.usuario_id === userId);
  },
  
  create: async (blog: Omit<Blog, 'id'>): Promise<Blog> => {
    loadFromStorage();
    const newId = blogs.length > 0 ? Math.max(...blogs.map(b => b.id)) + 1 : 1;
    const newBlog = { ...blog, id: newId } as Blog;
    blogs.push(newBlog);
    saveToStorage();
    return newBlog;
  },
  
  update: async (id: number, blog: Partial<Blog>): Promise<Blog | null> => {
    loadFromStorage();
    const index = blogs.findIndex(b => b.id === id);
    if (index === -1) return null;
    
    blogs[index] = { ...blogs[index], ...blog };
    saveToStorage();
    return blogs[index];
  },
  
  delete: async (id: number): Promise<boolean> => {
    loadFromStorage();
    const initialLength = blogs.length;
    blogs = blogs.filter(b => b.id !== id);
    saveToStorage();
    return blogs.length < initialLength;
  }
};

// Servicio de usuarios
export const userService = {
  getById: async (id: number): Promise<UserType | null> => {
    loadFromStorage();
    return usuarios.find(u => u.id === id) || null;
  },
  
  getAll: async (): Promise<UserType[]> => {
    loadFromStorage();
    return usuarios;
  }
};

// Inicializar cargando datos
loadFromStorage();
