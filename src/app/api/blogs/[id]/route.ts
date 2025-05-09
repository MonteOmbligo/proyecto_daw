import { NextRequest, NextResponse } from "next/server";
import { blogService } from "@/lib/db";

// Gestiona las rutas /api/blogs/[id]
// GET: Obtener blog por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID no válido" }, { status: 400 });
    }
    
    const blogs = await blogService.getAll();
    const blog = blogs.find(b => b.id === id);
    
    if (!blog) {
      return NextResponse.json({ error: "Blog no encontrado" }, { status: 404 });
    }
    
    return NextResponse.json(blog);
  } catch (error) {
    console.error("Error al obtener blog:", error);
    return NextResponse.json(
      { error: "Error al obtener blog" },
      { status: 500 }
    );
  }
}

// PUT: Actualizar blog por ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID no válido" }, { status: 400 });
    }
    
    const blogData = await request.json();
    const updatedBlog = await blogService.update(id, blogData);
    
    if (!updatedBlog) {
      return NextResponse.json({ error: "Blog no encontrado" }, { status: 404 });
    }
    
    return NextResponse.json(updatedBlog);
  } catch (error) {
    console.error("Error al actualizar blog:", error);
    return NextResponse.json(
      { error: "Error al actualizar blog" },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar blog por ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID no válido" }, { status: 400 });
    }
    
    const success = await blogService.delete(id);
    
    if (!success) {
      return NextResponse.json({ error: "Blog no encontrado" }, { status: 404 });
    }
    
    return NextResponse.json({ message: "Blog eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar blog:", error);
    return NextResponse.json(
      { error: "Error al eliminar blog" },
      { status: 500 }
    );
  }
}
