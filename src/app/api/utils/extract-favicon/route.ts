import { NextRequest, NextResponse } from "next/server";
import * as cheerio from 'cheerio';

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

    let faviconUrl = '';
    
    try {
      // Crear un objeto URL para obtener el origen (dominio base)
      const urlObj = new URL(url);
      const baseUrl = urlObj.origin;
      
      try {
        // Obtener el HTML de la página
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        
        if (!response.ok) {
          throw new Error(`No se pudo acceder a la página: ${response.status}`);
        }
        
        const html = await response.text();
        const $ = cheerio.load(html);
        
        // Diferentes elementos link donde podría estar el favicon
        const linkElements = [
          'link[rel="icon"]', 
          'link[rel="shortcut icon"]',
          'link[rel="apple-touch-icon"]',
          'link[rel="apple-touch-icon-precomposed"]'
        ];
        
        // Buscar el favicon en los diferentes tipos de enlaces
        for (const selector of linkElements) {
          const href = $(selector).attr('href');
          if (href) {
            // Construir la URL completa si es relativa
            faviconUrl = href.startsWith('http') ? 
              href : 
              `${baseUrl}${href.startsWith('/') ? '' : '/'}${href}`;
            break;
          }
        }
        
        // Si no se encontró ningún favicon, usar la ruta por defecto
        if (!faviconUrl) {
          faviconUrl = `${baseUrl}/favicon.ico`;
        }
        
        // Verificar si el favicon existe
        try {
          const faviconResponse = await fetch(faviconUrl, { method: 'HEAD' });
          if (!faviconResponse.ok) {
            // Si no se puede acceder, usar el servicio de Google
            faviconUrl = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`;
          }
        } catch (error) {
          // Error al acceder, usar el servicio de Google
          console.warn("No se pudo acceder al favicon encontrado:", error);
          faviconUrl = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`;
        }
        
      } catch (scrapingError) {
        // Error al hacer scraping de la página, usar el servicio de Google
        console.warn("Error al hacer scraping de la página:", scrapingError);
        faviconUrl = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`;
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
