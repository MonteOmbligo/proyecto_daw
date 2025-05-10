import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// Función para actualizar la estructura de la base de datos
export async function GET(req: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL || '');

    console.log('Verificando estructura de tabla usuarios...');

    // Verificar si la columna clerk_id existe en la tabla usuarios
    const columnCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'usuarios' AND column_name = 'clerk_id'
    `;

    if (columnCheck.length === 0) {
      console.log('Columna clerk_id no existe, añadiéndola...');
      
      // Añadir la columna clerk_id a la tabla usuarios
      await sql`
        ALTER TABLE usuarios 
        ADD COLUMN clerk_id VARCHAR(100) UNIQUE
      `;
      
      return NextResponse.json({ 
        success: true, 
        message: 'Columna clerk_id añadida correctamente a la tabla usuarios' 
      });
    } else {
      return NextResponse.json({ 
        success: true, 
        message: 'La columna clerk_id ya existe en la tabla usuarios' 
      });
    }
  } catch (error) {
    console.error('Error actualizando estructura de la base de datos:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error actualizando estructura de la base de datos',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
