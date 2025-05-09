import { NextRequest, NextResponse } from "next/server";
import { blogService } from "@/lib/db";

// Gestiona las rutas /api/blogs
// GET: Obtener todos los blogs
export async function GET() {
  try {
    const blogs = await blogService.getAll();
    return NextResponse.json(blogs);
  } catch (error) {
    console.error("Error al obtener blogs:", error);
    return NextResponse.json(
      { error: "Error al obtener blogs" },
      { status: 500 }
    );
  }
}

// POST: Crear un nuevo blog
export async function POST(request: NextRequest) {
  try {
    const blogData = await request.json();
    
    if (!blogData.nombre || !blogData.api_url || !blogData.usuario_id) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }
    
    const newBlog = await blogService.create(blogData);
    return NextResponse.json(newBlog, { status: 201 });
  } catch (error) {
    console.error("Error al crear blog:", error);
    return NextResponse.json(
      { error: "Error al crear blog" },
      { status: 500 }
    );
  }
}
