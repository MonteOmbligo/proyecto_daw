import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL || '');
    
    // Crear tabla de usuarios adaptada para PostgreSQL
    await sql`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        contraseña VARCHAR(255) NOT NULL,
        estilo_escritura VARCHAR(100),
        api_key_llm VARCHAR(255),
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Crear tabla de blogs adaptada para PostgreSQL
    await sql`
      CREATE TABLE IF NOT EXISTS blogs (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        api_url VARCHAR(255),
        wp_user VARCHAR(100),
        api_key VARCHAR(255),
        favicon VARCHAR(255),
        palabras_clave TEXT,
        tematica VARCHAR(100),
        usuario_id INTEGER NOT NULL,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      )
    `;
    
    // Comprobar si existe usuario demo, si no, crearlo
    const usuarios = await sql`SELECT * FROM usuarios WHERE id = 1`;
    if (usuarios.length === 0) {
      await sql`
        INSERT INTO usuarios (id, nombre, email, contraseña, estilo_escritura)
        VALUES (1, 'Usuario Demo', 'demo@example.com', 'password', 'Estándar')
      `;
    }
    
    // Insertar un blog de ejemplo para el usuario demo si no existe ninguno
    const blogs = await sql`SELECT * FROM blogs WHERE usuario_id = 1`;
    if (blogs.length === 0) {
      await sql`
        INSERT INTO blogs (nombre, api_url, wp_user, api_key, tematica, usuario_id, favicon)
        VALUES ('Blog de ejemplo', 'https://ejemplo.com/wp-json/wp/v2', 'admin', '12345', 'Tecnología', 1, 'https://www.google.com/s2/favicons?domain=ejemplo.com')
      `;
    }
    
    return NextResponse.json({
      success: true,
      message: 'Base de datos inicializada correctamente'
    });
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    return NextResponse.json({
      success: false,
      error: `Error al inicializar la base de datos: ${error instanceof Error ? error.message : String(error)}`
    }, { status: 500 });
  }
}
