import { NextRequest, NextResponse } from "next/server";
import { blogService } from "@/lib/db";

// POST /api/wordpress/post/[id]
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const blogId = parseInt(params.id, 10);
    if (isNaN(blogId)) {
      return NextResponse.json({ error: "ID de blog no válido" }, { status: 400 });
    }
    
    // Obtener el blog
    const blogs = await blogService.getAll();
    const blog = blogs.find(b => b.id === blogId);
    
    if (!blog) {
      return NextResponse.json({ error: "Blog no encontrado" }, { status: 404 });
    }
    
    // Datos del post
    const postData = await request.json();
    
    // Simular publicación en WordPress
    // En una implementación real, aquí harías la petición a la API de WordPress
    
    console.log(`Simulando publicación en WordPress para blog ${blog.nombre}`);
    console.log("Post data:", postData);
    
    // Respuesta simulada exitosa
    return NextResponse.json({
      id: Math.floor(Math.random() * 10000),
      link: `https://example.com/post-${Date.now()}`,
      status: postData.status || "publish"
    });
  } catch (error) {
    console.error("Error al publicar en WordPress:", error);
    return NextResponse.json(
      { error: "Error al publicar en WordPress" },
      { status: 500 }
    );
  }
}
