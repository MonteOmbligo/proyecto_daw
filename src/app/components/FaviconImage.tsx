'use client';

import { useState } from 'react';
import Image from 'next/image';

interface FaviconImageProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Componente que muestra el favicon con una imagen de respaldo en caso de error
 */
const FaviconImage: React.FC<FaviconImageProps> = ({ 
  src, 
  alt, 
  fallbackSrc = '/window.svg', 
  width = 20, 
  height = 20,
  className = 'w-5 h-5 mr-2 object-contain'
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [error, setError] = useState(false);
  
  const handleError = () => {
    if (!error) {
      console.warn(`Error loading favicon: ${src}, using fallback`);
      setImgSrc(fallbackSrc);
      setError(true);
    }
  };

  return (
    <div className={className} style={{ position: 'relative', width, height }}>
      {/* Usamos un img estándar en lugar de Next/Image para evitar problemas de optimización */}
      <img
        src={imgSrc}
        alt={alt}
        onError={handleError}
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'contain' 
        }}
      />
    </div>
  );
};

export default FaviconImage;
