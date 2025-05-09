import { NextRequest, NextResponse } from "next/server";
import { blogService } from "@/lib/db";

// GET /api/usuarios/[id]/blogs
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "ID de usuario no válido" }, { status: 400 });
    }
    
    const blogs = await blogService.getByUserId(userId);
    return NextResponse.json(blogs);
  } catch (error) {
    console.error("Error al obtener blogs del usuario:", error);
    return NextResponse.json(
      { error: "Error al obtener blogs" },
      { status: 500 }
    );
  }
}
