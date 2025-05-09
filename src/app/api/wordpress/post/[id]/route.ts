import { NextRequest,NextResponse } from "next/server";
import { blogService } from "@/lib/db";

// POST /api/wordpress/post/[id]
export async function POST(
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
    
    // Verificar si el blog tiene URL de API y credenciales
    if (!blog.api_url) {
      return NextResponse.json(
        { error: "El blog no tiene configurada la URL de la API de WordPress" },
        { status: 400 }
      );
    }

    // Detectar entorno de producción y comprobar URLs de localhost
    const isProduction = process.env.NODE_ENV === 'production';
    const isLocalhost = blog.api_url.includes('localhost') || blog.api_url.includes('127.0.0.1');
    
    if (isProduction && isLocalhost) {
      return NextResponse.json({
        success: false,
        error: "Error de configuración",
        details: "No se puede acceder a URLs de localhost en un entorno de producción. Por favor, actualice la URL del blog con una dirección accesible públicamente.",
        environment: process.env.NODE_ENV,
        url: blog.api_url,
      }, { status: 400 });
    }

    // Datos del post
    // En entornos serverless, la request.json() puede fallar con FormData
    interface PostData {
      title: string;
      content: string;
      excerpt: string;
      status: string;
      categories?: string[] | null;
      tags?: string[] | null;
      wp_user?: string;
      wp_password?: string;
    }
    
    let postData: PostData;
    let formData: FormData | null = null;
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Esto es FormData
      formData = await request.formData();
      postData = {
        title: formData.get('title') as string,
        content: formData.get('content') as string,
        excerpt: formData.get('excerpt') as string,
        status: formData.get('status') as string,
        categories: formData.get('categories') ? JSON.parse(formData.get('categories') as string) : [],
        tags: formData.get('tags') ? JSON.parse(formData.get('tags') as string) : [],
      };
    } else {
      // Es JSON normal
      postData = await request.json();
    }
    
    // Normalizar la URL de la API de WordPress
    let wpApiUrl = blog.api_url;
    
    // Asegurarse de que la URL no termina en /
    if (wpApiUrl.endsWith('/')) {
      wpApiUrl = wpApiUrl.slice(0, -1);
    }
    
    // Construir la URL completa de la API
    wpApiUrl = `${wpApiUrl}/wp-json/wp/v2/posts`;
    
    // Preparar los headers con autenticación si existe
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    
    // Obtener credenciales de autenticación
    let wp_user: string | null | undefined = null;
    let wp_password: string | null | undefined = null;
    
    if (contentType.includes('multipart/form-data') && formData) {
      wp_user = formData.get('wp_user') as string;
      wp_password = formData.get('wp_password') as string;
    } else {
      wp_user = postData.wp_user;
      wp_password = postData.wp_password;
    }
    
    // Si no hay credenciales en los datos, usar las del blog
    if (!wp_user && blog.wp_user) {
      wp_user = blog.wp_user;
    }
    
    if (!wp_password && blog.api_key) {
      wp_password = blog.api_key;
    }
    
    if (wp_user && wp_password) {
      // Autenticación básica
      const authString = `${wp_user}:${wp_password}`;
      const base64Auth = Buffer.from(authString).toString('base64');
      headers.append('Authorization', `Basic ${base64Auth}`);
    }
      // Preparar los datos para WordPress - formato simple para mayor compatibilidad
    const wpPostData = {
      title: postData.title,
      content: postData.content,
      excerpt: postData.excerpt,
      status: postData.status || 'draft',
    };
    
    console.log(`Publicando en WordPress: ${wpApiUrl}`);
    console.log('Datos para WordPress:', JSON.stringify(wpPostData));
    console.log('Headers:', JSON.stringify(Object.fromEntries(headers.entries())));
    
    // Hacer que la URL sea absoluta para evitar problemas en Vercel
    if (!wpApiUrl.startsWith('http')) {
      console.warn('URL de WordPress no absoluta, añadiendo https://', wpApiUrl);
      wpApiUrl = `https://${wpApiUrl.replace(/^\/+/, '')}`;
    }
    
    // Realizar la petición a WordPress con un timeout más largo pero razonable para Vercel
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos de timeout (más adecuado para Vercel)
    
    try {
      // Añadir timeout y opciones para mejorar comportamiento en entornos serverless
      const wpResponse = await fetch(wpApiUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(wpPostData),
        signal: controller.signal,
        cache: 'no-store',
        keepalive: true
      });
      
      clearTimeout(timeoutId);
      
      // Comprobar si la respuesta es exitosa
      if (!wpResponse.ok) {
        let errorDetails = '';
        try {
          // Intentar analizar la respuesta como JSON
          const errorJson = await wpResponse.json();
          errorDetails = JSON.stringify(errorJson);
          console.error('Error de WordPress (JSON):', errorJson);
        } catch {
          // Si no es JSON, obtener como texto
          try {
            errorDetails = await wpResponse.text();
            console.error('Error de WordPress (texto):', errorDetails);
          } catch (err) {
            errorDetails = 'No se pudo obtener información del error';
            console.error('Error al leer la respuesta:', err);
          }
        }
        
        return NextResponse.json(
          { 
            error: "Error al publicar en WordPress", 
            details: errorDetails,
            status: wpResponse.status,
            statusText: wpResponse.statusText
          },
          { status: wpResponse.status }
        );
      }
      
      // Obtener la respuesta exitosa
      const wpResponseData = await wpResponse.json();
      console.log('Respuesta exitosa de WordPress:', wpResponseData);
      
      return NextResponse.json({
        id: wpResponseData.id,
        link: wpResponseData.link || wpResponseData.guid?.rendered,
        status: wpResponseData.status,
        message: "Entrada publicada con éxito en WordPress"
      });
    } catch (fetchError) {
      console.error('Error en fetch WordPress:', fetchError);
      return NextResponse.json(
        { 
          error: "Error de conexión con WordPress", 
          details: (fetchError as Error).message,
          stack: (fetchError as Error).stack
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error general al publicar en WordPress:", error);
    return NextResponse.json(
      { 
        error: "Error al publicar en WordPress", 
        details: (error as Error).message,
        stack: (error as Error).stack
      },
      { status: 500 }
    );
  }
}