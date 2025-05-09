import { NextRequest, NextResponse } from "next/server";
import { blogService } from "@/lib/db";

// GET /api/wordpress/diagnostico/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Resolver params como promesa
    const resolvedParams = await params;
    const blogId = parseInt(resolvedParams.id, 10);
    if (isNaN(blogId)) {
      return NextResponse.json({ error: "ID de blog no válido" }, { status: 400 });
    }
    
    // Obtener el blog
    const blogs = await blogService.getAll();
    const blog = blogs.find(b => b.id === blogId);
    
    if (!blog) {
      return NextResponse.json({ error: "Blog no encontrado" }, { status: 404 });
    }
    
    // Información diagnóstica sobre el blog
    const isProduction = process.env.NODE_ENV === 'production';
    const isLocalhost = blog.api_url ? (blog.api_url.includes('localhost') || blog.api_url.includes('127.0.0.1')) : false;
    
    const diagnostico = {
      id: blog.id,
      nombre: blog.nombre,
      api_url: blog.api_url,
      tiene_api_url: !!blog.api_url,
      tiene_user: !!blog.wp_user,
      tiene_api_key: !!blog.api_key,
      url_completa: blog.api_url ? `${blog.api_url}/wp-json/wp/v2/posts` : null,
      url_normalizada: blog.api_url ? 
        blog.api_url.endsWith('/') ? 
          blog.api_url.slice(0, -1) : 
          blog.api_url : 
        null,
      es_url_absoluta: blog.api_url ? blog.api_url.startsWith('http') : false,
      url_convertida: blog.api_url ? 
        (!blog.api_url.startsWith('http') ? `https://${blog.api_url.replace(/^\/+/, '')}` : blog.api_url) : 
        null,
      es_localhost: isLocalhost,
      advertencia_produccion: isProduction && isLocalhost ? 
        "Esta URL usa 'localhost', que no es accesible en entornos de producción. Por favor, use una URL pública." : 
        null,
      entorno: process.env.NODE_ENV || 'desarrollo',
      fecha_diagnostico: new Date().toISOString(),
      runtime: process.env.NEXT_RUNTIME || 'desconocido'
    };

    return NextResponse.json({
      success: true,
      mensaje: "Diagnóstico de conexión a WordPress",
      diagnostico
    });
    
  } catch (error) {
    console.error("Error en diagnóstico de WordPress:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Error al realizar diagnóstico de WordPress", 
        details: (error as Error).message,
        stack: (error as Error).stack
      },
      { status: 500 }
    );
  }
}
