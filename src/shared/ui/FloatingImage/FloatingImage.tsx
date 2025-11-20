import { h } from '@jsx/html';

interface FloatingImageProps {
  src: string; // Base filename without extension (e.g., 'CPU')
  alt: string;
  position: {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
  };
  stickyTop: string;
  maxWidth: string;
  className?: string;
  basePath?: string;
}

export function FloatingImage({ 
  src, 
  alt, 
  position, 
  stickyTop, 
  maxWidth,
  className = '',
  basePath = '/'
}: FloatingImageProps): string {
  // Normalize basePath - ensure it doesn't end with / for asset paths
  const normalizedBase = basePath === '/' ? '' : basePath.replace(/\/$/, '');
  const assetsPath = `${normalizedBase}/assets`;
  
  // Generate style attribute from position object
  const positionStyles = Object.entries(position)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ');
  
  // Combine all styles - don't override position values
  const style = `${positionStyles}; max-width: ${maxWidth}; z-index: 10;`;
  
  return (
    <div class={`floating-image ${className}`} style={style}>
      <picture>
        {/* WebP sources for modern browsers - Large */}
        <source
          media="(min-width: 1024px)"
          srcset={`${assetsPath}/large/${src}.webp`}
          type="image/webp"
        />
        {/* WebP sources - Medium */}
        <source
          media="(min-width: 768px)"
          srcset={`${assetsPath}/medium/${src}.webp`}
          type="image/webp"
        />
        {/* WebP sources - Small */}
        <source
          media="(min-width: 480px)"
          srcset={`${assetsPath}/small/${src}.webp`}
          type="image/webp"
        />
        
        {/* PNG fallback sources - Large */}
        <source
          media="(min-width: 1024px)"
          srcset={`${assetsPath}/large/${src}.png`}
          type="image/png"
        />
        {/* PNG fallback - Medium */}
        <source
          media="(min-width: 768px)"
          srcset={`${assetsPath}/medium/${src}.png`}
          type="image/png"
        />
        {/* PNG fallback - Small */}
        <source
          media="(min-width: 480px)"
          srcset={`${assetsPath}/small/${src}.png`}
          type="image/png"
        />
        
        {/* Default fallback image with blur placeholder */}
        <img
          src={`${assetsPath}/small/${src}.png`}
          alt={alt}
          loading="lazy"
          decoding="async"
          onload="this.style.backgroundImage='none'"
          style={`background-image: url('${assetsPath}/tiny/${src}.jpg'); background-size: cover; background-position: center;`}
          class="floating-image__img"
        />
      </picture>
    </div>
  );
}
