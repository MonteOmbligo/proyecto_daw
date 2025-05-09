const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Controlador para funciones de utilidad
 */
const UtilsController = {
  /**
   * Extrae el favicon de una URL
   * @param {Object} req - Objeto de solicitud de Express
   * @param {Object} res - Objeto de respuesta de Express
   */
  extractFavicon: async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ mensaje: 'Se requiere una URL' });
      }
      
      const baseUrl = new URL(url).origin;
      let faviconUrl = '';
      
      try {
        // Intentar obtener el HTML de la página
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);
        
        // Buscar en diferentes elementos link donde podría estar el favicon
        const linkElements = [
          'link[rel="icon"]', 
          'link[rel="shortcut icon"]',
          'link[rel="apple-touch-icon"]',
          'link[rel="apple-touch-icon-precomposed"]'
        ];
        
        for (const selector of linkElements) {
          const href = $(selector).attr('href');
          if (href) {
            faviconUrl = href.startsWith('http') ? href : `${baseUrl}${href.startsWith('/') ? '' : '/'}${href}`;
            break;
          }
        }
        
        // Si no se encontró ningún favicon, usar la ruta por defecto
        if (!faviconUrl) {
          faviconUrl = `${baseUrl}/favicon.ico`;
        }
        
        // Verificar si el favicon existe
        try {
          await axios.head(faviconUrl);
        } catch (error) {
          // Si no se puede acceder, usar el servicio de Google
          faviconUrl = `https://www.google.com/s2/favicons?domain=${url}`;
        }
        
      } catch (error) {
        // Si hay un error al obtener la página, usar el servicio de Google
        faviconUrl = `https://www.google.com/s2/favicons?domain=${url}`;
      }
      
      res.status(200).json({ faviconUrl });
      
    } catch (error) {
      console.error('Error al extraer el favicon:', error);
      res.status(500).json({ 
        mensaje: 'Error al extraer el favicon', 
        error: error.message 
      });
    }
  }
};

module.exports = UtilsController;