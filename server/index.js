// Importar el framework Express
const express = require('express');
require('dotenv').config();
const { testConnection } = require('./config/db');
const { initDatabase } = require('./models/db.init');
const Usuario = require('./models/usuario.model');
const Blog = require('./models/blog.model');
const WordPressController = require('./controllers/wordpress.controller');
const UtilsController = require('./controllers/utils.controller');
const multer = require('multer');

// Configurar multer para almacenar archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo tamaño de archivo
  }
});

// Crear una instancia de la aplicación Express
const app = express();

// Definir el puerto en el que escuchará el servidor
// Usar el puerto proporcionado por el entorno (si existe) o el puerto 3001 por defecto
const PORT = process.env.PORT || 3001;

// Middleware para parsear JSON en las solicitudes entrantes
app.use(express.json());

// Middleware para habilitar CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Ruta de ejemplo para la raíz de la API
app.get('/', (req, res) => {
  res.send('¡Hola desde el servidor Node.js!');
});

// Añadir un endpoint para verificar la salud del servidor
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Rutas para usuarios
app.post('/api/usuarios', async (req, res) => {
  try {
    const nuevoUsuario = await Usuario.crear(req.body);
    res.status(201).json(nuevoUsuario);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ mensaje: 'Error al crear usuario', error: error.message });
  }
});

app.get('/api/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.listarTodos();
    res.status(200).json(usuarios);
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ mensaje: 'Error al listar usuarios', error: error.message });
  }
});

app.get('/api/usuarios/:id', async (req, res) => {
  try {
    const usuario = await Usuario.buscarPorId(req.params.id);
    if (usuario) {
      res.status(200).json(usuario);
    } else {
      res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error('Error al buscar usuario:', error);
    res.status(500).json({ mensaje: 'Error al buscar usuario', error: error.message });
  }
});

app.put('/api/usuarios/:id', async (req, res) => {
  try {
    const usuarioActualizado = await Usuario.actualizar(req.params.id, req.body);
    if (usuarioActualizado) {
      res.status(200).json(usuarioActualizado);
    } else {
      res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ mensaje: 'Error al actualizar usuario', error: error.message });
  }
});

app.delete('/api/usuarios/:id', async (req, res) => {
  try {
    const resultado = await Usuario.eliminar(req.params.id);
    if (resultado) {
      res.status(200).json({ mensaje: 'Usuario eliminado correctamente' });
    } else {
      res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ mensaje: 'Error al eliminar usuario', error: error.message });
  }
});

// Rutas para blogs
app.post('/api/blogs', async (req, res) => {
  try {
    console.log('Datos recibidos en /api/blogs:', req.body); // LOG para depuración
    if (!req.body.api_key || typeof req.body.api_key !== 'string' || req.body.api_key.trim() === '') {
      return res.status(400).json({ mensaje: 'El campo api_key es obligatorio y no puede estar vacío.' });
    }
    if (!req.body.wp_user || typeof req.body.wp_user !== 'string' || req.body.wp_user.trim() === '') {
      return res.status(400).json({ mensaje: 'El campo wp_user es obligatorio y no puede estar vacío.' });
    }
    const nuevoBlog = await Blog.crear(req.body);
    res.status(201).json(nuevoBlog);
  } catch (error) {
    console.error('Error al crear blog:', error);
    res.status(500).json({ mensaje: 'Error al crear blog', error: error.message });
  }
});

app.get('/api/blogs', async (req, res) => {
  try {
    const blogs = await Blog.listarTodos();
    res.status(200).json(blogs);
  } catch (error) {
    console.error('Error al listar blogs:', error);
    res.status(500).json({ mensaje: 'Error al listar blogs', error: error.message });
  }
});

app.get('/api/blogs/:id', async (req, res) => {
  try {
    const blog = await Blog.buscarPorId(req.params.id);
    if (blog) {
      res.status(200).json(blog);
    } else {
      res.status(404).json({ mensaje: 'Blog no encontrado' });
    }
  } catch (error) {
    console.error('Error al buscar blog:', error);
    res.status(500).json({ mensaje: 'Error al buscar blog', error: error.message });
  }
});

app.get('/api/usuarios/:id/blogs', async (req, res) => {
  try {
    const blogs = await Blog.buscarPorUsuarioId(req.params.id);
    res.status(200).json(blogs);
  } catch (error) {
    console.error('Error al buscar blogs de usuario:', error);
    res.status(500).json({ mensaje: 'Error al buscar blogs de usuario', error: error.message });
  }
});

app.put('/api/blogs/:id', async (req, res) => {
  try {
    const blogActualizado = await Blog.actualizar(req.params.id, req.body);
    if (blogActualizado) {
      res.status(200).json(blogActualizado);
    } else {
      res.status(404).json({ mensaje: 'Blog no encontrado' });
    }
  } catch (error) {
    console.error('Error al actualizar blog:', error);
    res.status(500).json({ mensaje: 'Error al actualizar blog', error: error.message });
  }
});

app.delete('/api/blogs/:id', async (req, res) => {
  try {
    const resultado = await Blog.eliminar(req.params.id);
    if (resultado) {
      res.status(200).json({ mensaje: 'Blog eliminado correctamente' });
    } else {
      res.status(404).json({ mensaje: 'Blog no encontrado' });
    }
  } catch (error) {
    console.error('Error al eliminar blog:', error);
    res.status(500).json({ mensaje: 'Error al eliminar blog', error: error.message });
  }
});

// Rutas para WordPress
// Ruta para publicar un post en WordPress
app.post('/api/wordpress/post/:blogId', upload.single('featured_media'), WordPressController.publishPost);

// Rutas para utilidades
app.post('/api/utils/extract-favicon', UtilsController.extractFavicon);

// Inicializar la base de datos y arrancar el servidor
const iniciarServidor = async () => {
  try {
    // Verificar la conexión a la base de datos
    const dbConectada = await testConnection();
    if (!dbConectada) {
      console.error('No se pudo conectar a la base de datos MySQL. Revise sus credenciales.');
      process.exit(1);
    }
    
    // Inicializar la base de datos
    await initDatabase();
    
    // Iniciar el servidor y hacer que escuche en el puerto especificado
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};



iniciarServidor();
