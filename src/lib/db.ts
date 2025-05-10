import { neon } from '@neondatabase/serverless';

// Interfaces basadas en la estructura de tu base de datos
export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  contraseña?: string;
  estilo_escritura?: string;
  api_key_llm?: string;
  clerk_id?: string;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

export interface Blog {
  id: number;
  nombre: string;
  api_url?: string;
  wp_user?: string;
  api_key?: string;
  favicon?: string;
  palabras_clave?: string;
  tematica?: string;
  usuario_id: number;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

// Función para conectar a la base de datos
const sql = neon(process.env.DATABASE_URL || '');

// Servicio de blogs
export const blogService = {
  getAll: async (): Promise<Blog[]> => {
    try {
      const blogs = await sql`
        SELECT * FROM blogs ORDER BY id DESC
      `;
      return blogs as unknown as Blog[];
    } catch (error) {
      console.error('Error al obtener todos los blogs:', error);
      return [];
    }
  },
  
  getByUserId: async (userId: number): Promise<Blog[]> => {
    try {
      const blogs = await sql`
        SELECT * FROM blogs WHERE usuario_id = ${userId} ORDER BY id DESC
      `;
      return blogs as unknown as Blog[];
    } catch (error) {
      console.error(`Error al obtener blogs del usuario ${userId}:`, error);
      return [];
    }
  },
  
  getById: async (id: number): Promise<Blog | null> => {
    try {
      const blogs = await sql`
        SELECT * FROM blogs WHERE id = ${id}
      `;
      if (blogs.length === 0) {
        return null;
      }
      return blogs[0] as unknown as Blog;
    } catch (error) {
      console.error(`Error al obtener blog ${id}:`, error);
      return null;
    }
  },
  
  create: async (blog: Omit<Blog, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>): Promise<Blog> => {
    try {
      const result = await sql`
        INSERT INTO blogs (
          nombre, api_url, wp_user, api_key, favicon, palabras_clave, tematica, usuario_id
        ) VALUES (
          ${blog.nombre},
          ${blog.api_url || null},
          ${blog.wp_user || null},
          ${blog.api_key || null},
          ${blog.favicon || null},
          ${blog.palabras_clave || null},
          ${blog.tematica || null},
          ${blog.usuario_id}
        )
        RETURNING *
      `;
      return result[0] as unknown as Blog;
    } catch (error) {
      console.error('Error al crear blog:', error);
      throw new Error('No se pudo crear el blog');
    }
  },
  
  update: async (id: number, blog: Partial<Blog>): Promise<Blog | null> => {
    try {
      // Primero obtenemos el blog actual
      const currentBlogs = await sql`
        SELECT * FROM blogs WHERE id = ${id}
      `;
      
      if (currentBlogs.length === 0) return null;
      const currentBlog = currentBlogs[0] as unknown as Blog;
      
      // Actualizamos solo los campos proporcionados y marcamos la fecha de actualización
      const updatedBlogs = await sql`
        UPDATE blogs SET
          nombre = ${blog.nombre !== undefined ? blog.nombre : currentBlog.nombre},
          api_url = ${blog.api_url !== undefined ? blog.api_url : currentBlog.api_url},
          wp_user = ${blog.wp_user !== undefined ? blog.wp_user : currentBlog.wp_user},
          api_key = ${blog.api_key !== undefined ? blog.api_key : currentBlog.api_key},
          favicon = ${blog.favicon !== undefined ? blog.favicon : currentBlog.favicon},
          palabras_clave = ${blog.palabras_clave !== undefined ? blog.palabras_clave : currentBlog.palabras_clave},
          tematica = ${blog.tematica !== undefined ? blog.tematica : currentBlog.tematica},
          fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
      
      return updatedBlogs.length > 0 ? updatedBlogs[0] as unknown as Blog : null;
    } catch (error) {
      console.error(`Error al actualizar blog ${id}:`, error);
      return null;
    }
  },
  
  delete: async (id: number): Promise<boolean> => {
    try {
      await sql`
        DELETE FROM blogs WHERE id = ${id}
      `;
      // Asumimos que fue exitoso si no se lanzaron excepciones
      return true;
    } catch (error) {
      console.error(`Error al eliminar blog ${id}:`, error);
      return false;
    }
  }
};

// Servicio de usuarios
export const userService = {
  getById: async (id: number): Promise<Usuario | null> => {
    try {
      const users = await sql`
        SELECT id, nombre, email, estilo_escritura, api_key_llm FROM usuarios WHERE id = ${id}
      `;
      return users.length > 0 ? users[0] as unknown as Usuario : null;
    } catch (error) {
      console.error(`Error al obtener usuario ${id}:`, error);
      return null;
    }
  },
  
  getAll: async (): Promise<Usuario[]> => {
    try {
      const users = await sql`
        SELECT id, nombre, email, estilo_escritura FROM usuarios
      `;
      return users as unknown as Usuario[];
    } catch (error) {
      console.error('Error al obtener todos los usuarios:', error);
      return [];
    }
  }
};

// Función para guardar un usuario de Clerk en la base de datos
export async function saveUserToDB({ 
  id, 
  name, 
  email 
}: { 
  id: string, 
  name?: string, 
  email?: string 
}): Promise<boolean> {
  try {
    // Comprobamos si el usuario ya existe por su id de Clerk
    const existingUsers = await sql`
      SELECT * FROM usuarios WHERE clerk_id = ${id}
    `;
    
    if (existingUsers.length > 0) {
      console.log(`Usuario con clerk_id ${id} ya existe en la base de datos`);
      return true;
    }
    
    // Creamos el nuevo usuario
    await sql`
      INSERT INTO usuarios 
        (nombre, email, clerk_id) 
      VALUES 
        (${name || 'Usuario'}, ${email || ''}, ${id})
    `;
    
    return true;
  } catch (error) {
    console.error('Error al guardar usuario de Clerk en la base de datos:', error);
    return false;
  }
};
