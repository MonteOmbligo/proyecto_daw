import { NextRequest, NextResponse } from "next/server";
import { blogService } from "@/lib/db";

// GET /api/wordpress/test/[id]
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
    
    // Verificar si el blog tiene URL de API
    if (!blog.api_url) {
      return NextResponse.json(
        { error: "El blog no tiene configurada la URL de la API de WordPress" },
        { status: 400 }
      );
    }

    // Normalizar la URL de la API de WordPress
    let wpApiUrl = blog.api_url;
    
    // Asegurarse de que la URL no termina en /
    if (wpApiUrl.endsWith('/')) {
      wpApiUrl = wpApiUrl.slice(0, -1);
    }
    
    // Detectar entorno de producción y comprobar URLs de localhost
    const isProduction = process.env.NODE_ENV === 'production';
    const isLocalhost = wpApiUrl.includes('localhost') || wpApiUrl.includes('127.0.0.1');
    
    if (isProduction && isLocalhost) {
      return NextResponse.json({
        success: false,
        error: "Error de configuración",
        details: "No se puede acceder a URLs de localhost en un entorno de producción. Por favor, actualice la URL del blog con una dirección accesible públicamente.",
        environment: process.env.NODE_ENV,
        url: wpApiUrl,
      }, { status: 400 });
    }
    
    // Construir la URL para prueba (endpoint básico)
    wpApiUrl = `${wpApiUrl}/wp-json`;
    
    console.log(`Probando conexión con WordPress: ${wpApiUrl}`);
    
    // Preparar los headers
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    
    // Credenciales si están disponibles
    if (blog.wp_user && blog.api_key) {
      const authString = `${blog.wp_user}:${blog.api_key}`;
      const base64Auth = Buffer.from(authString).toString('base64');
      headers.append('Authorization', `Basic ${base64Auth}`);
    }
      // Hacer que la URL sea absoluta para evitar problemas en Vercel
    if (!wpApiUrl.startsWith('http')) {
      console.warn('URL de WordPress no absoluta, añadiendo https://', wpApiUrl);
      wpApiUrl = `https://${wpApiUrl.replace(/^\/+/, '')}`;
    }

    // Realizar petición de prueba con opciones de timeout y error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos de timeout

    console.log(`Probando conexión a WordPress: ${wpApiUrl}`);
    
    const response = await fetch(wpApiUrl, {
      method: 'GET',
      headers: headers,
      cache: 'no-cache',
      signal: controller.signal,
      keepalive: true
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      let errorDetails = '';
      try {
        const errorJson = await response.json();
        errorDetails = JSON.stringify(errorJson);
      } catch {
        try {
          errorDetails = await response.text();
        } catch {
          errorDetails = 'No se pudo obtener información del error';
        }
      }
      
      return NextResponse.json({
        success: false,
        error: "Error al conectar con WordPress",
        details: errorDetails,
        status: response.status,
        statusText: response.statusText
      });
    }
    
    // Respuesta exitosa
    const data = await response.json();
    return NextResponse.json({
      success: true,
      message: "Conexión exitosa con WordPress",
      name: data.name,
      description: data.description,
      routes: Object.keys(data.routes || {}).slice(0, 10)
    });
    
  } catch (error) {
    console.error("Error al probar la conexión con WordPress:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Error al probar la conexión con WordPress", 
        details: (error as Error).message,
        stack: (error as Error).stack
      },
      { status: 500 }
    );
  }
}
