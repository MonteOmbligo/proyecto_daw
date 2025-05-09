import { NextRequest, NextResponse } from "next/server";
import { blogService } from "@/lib/db";

// POST /api/wordpress/post/[id]
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
    
    // Datos del post
    // En entornos serverless, la request.json() puede fallar con FormData
    let postData;
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Esto es FormData
      const formData = await request.formData();
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
    
    // Simular publicación en WordPress
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
      { error: "Error al publicar en WordPress", details: (error as Error).message },
      { status: 500 }
    );
  }
}
