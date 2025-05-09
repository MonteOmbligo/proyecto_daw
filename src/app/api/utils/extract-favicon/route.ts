import { NextRequest, NextResponse } from "next/server";

// POST /api/utils/extract-favicon
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { error: "URL requerida" },
        { status: 400 }
      );
    }
      // Definir la URL base para la extracción de favicon
    let faviconUrl = "";    try {
      const urlObject = new URL(url);
      faviconUrl = `${urlObject.protocol}//${urlObject.hostname}/favicon.ico`;
    } catch {
      return NextResponse.json(
        { error: "URL inválida" },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ favicon: faviconUrl });
  } catch (error) {
    console.error("Error al extraer favicon:", error);
    return NextResponse.json(
      { error: "Error al extraer favicon" },
      { status: 500 }
    );
  }
}
