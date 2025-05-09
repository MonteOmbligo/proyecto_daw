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
    let faviconUrl = "";
    
    try {
      const urlObject = new URL(url);
      
      // Primero intentamos el favicon.ico estándar
      faviconUrl = `${urlObject.protocol}//${urlObject.hostname}/favicon.ico`;
      
      // Como alternativa, usar el servicio de Google para obtener el favicon
      const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${urlObject.hostname}&sz=128`;
      
      // Verificar si el favicon existe
      try {
        const response = await fetch(faviconUrl, { method: 'HEAD' });
        if (!response.ok) {
          // Si no se encuentra el favicon.ico, usar el servicio de Google
          faviconUrl = googleFaviconUrl;
        }
      } catch (fetchError) {
        // Si hay error al acceder al favicon.ico, usar el servicio de Google
        console.warn("No se pudo acceder al favicon directo, usando Google:", fetchError);
        faviconUrl = googleFaviconUrl;
      }
    } catch (urlError) {
      console.error("URL inválida:", urlError);
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
