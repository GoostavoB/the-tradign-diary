/**
 * Image Optimization Utilities
 * Handles responsive images, lazy loading, and format optimization
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  formats?: ('webp' | 'avif' | 'jpg' | 'png')[];
  sizes?: number[];
}

export interface ResponsiveImageSource {
  srcSet: string;
  sizes: string;
  type: string;
}

export interface ResponsiveImage {
  sources: ResponsiveImageSource[];
  fallback: string;
}

// Default responsive sizes (in pixels)
const DEFAULT_SIZES = [320, 640, 1024, 1920];

// Default formats (in priority order)
const DEFAULT_FORMATS: ('webp' | 'avif' | 'jpg' | 'png')[] = ['webp', 'avif', 'jpg'];

/**
 * Generate responsive image sources with multiple formats and sizes
 */
export function generateResponsiveImage(
  src: string,
  options: ImageOptimizationOptions = {}
): ResponsiveImage {
  const {
    width,
    height,
    quality = 80,
    formats = DEFAULT_FORMATS,
    sizes = DEFAULT_SIZES,
  } = options;

  // Generate sources for each format
  const sources: ResponsiveImageSource[] = formats.map((format) => {
    // Generate srcset with different sizes
    const srcSet = sizes
      .map((size) => {
        // In a real implementation, this would call an image optimization service
        // For now, we return the original with size parameter
        const url = addImageParams(src, { width: size, quality, format });
        return `${url} ${size}w`;
      })
      .join(', ');

    // Generate sizes attribute for responsive loading
    const sizesAttr = generateSizesAttribute(width);

    return {
      srcSet,
      sizes: sizesAttr,
      type: `image/${format}`,
    };
  });

  // Fallback to original image
  const fallback = addImageParams(src, { width, height, quality, format: 'jpg' });

  return {
    sources,
    fallback,
  };
}

/**
 * Add query parameters to image URL for optimization
 * Note: This assumes you're using an image CDN or service that supports these params
 */
function addImageParams(
  src: string,
  params: { width?: number; height?: number; quality?: number; format?: string }
): string {
  // If it's already an external URL with params, return as-is
  if (src.includes('?')) {
    return src;
  }

  // Build query string
  const queryParams: string[] = [];
  if (params.width) queryParams.push(`w=${params.width}`);
  if (params.height) queryParams.push(`h=${params.height}`);
  if (params.quality) queryParams.push(`q=${params.quality}`);
  if (params.format) queryParams.push(`fm=${params.format}`);

  // Return original if no params
  if (queryParams.length === 0) {
    return src;
  }

  // Append params
  const separator = src.includes('?') ? '&' : '?';
  return `${src}${separator}${queryParams.join('&')}`;
}

/**
 * Generate the sizes attribute for responsive images
 */
function generateSizesAttribute(maxWidth?: number): string {
  if (maxWidth) {
    // If max width specified, use it as the upper bound
    return `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, ${maxWidth}px`;
  }

  // Default responsive sizes
  return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
}

/**
 * Preload an image to improve perceived performance
 */
export function preloadImage(src: string, priority: 'high' | 'low' = 'high'): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  link.fetchPriority = priority;
  document.head.appendChild(link);
}

/**
 * Calculate optimal image size based on viewport and DPR
 */
export function getOptimalImageSize(
  containerWidth: number,
  devicePixelRatio: number = window.devicePixelRatio || 1
): number {
  // Calculate required size based on DPR
  const requiredSize = containerWidth * devicePixelRatio;

  // Find the next size up from our default sizes
  const optimalSize = DEFAULT_SIZES.find((size) => size >= requiredSize) || DEFAULT_SIZES[DEFAULT_SIZES.length - 1];

  return optimalSize;
}

/**
 * Lazy load an image using IntersectionObserver
 */
export function lazyLoadImage(
  img: HTMLImageElement,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLImageElement;
          
          // Set the src from data-src
          if (target.dataset.src) {
            target.src = target.dataset.src;
          }
          
          // Set srcset from data-srcset
          if (target.dataset.srcset) {
            target.srcset = target.dataset.srcset;
          }
          
          // Remove data attributes
          delete target.dataset.src;
          delete target.dataset.srcset;
          
          // Stop observing this image
          observer.unobserve(target);
        }
      });
    },
    {
      rootMargin: '50px', // Start loading 50px before visible
      threshold: 0.01,
      ...options,
    }
  );

  observer.observe(img);
  return observer;
}

/**
 * Compress image quality based on connection speed
 */
export function getAdaptiveQuality(): number {
  // Check connection type if available
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  if (!connection) {
    return 80; // Default quality
  }

  // Adjust quality based on effective connection type
  const effectiveType = connection.effectiveType;
  
  switch (effectiveType) {
    case '4g':
      return 90; // High quality for fast connections
    case '3g':
      return 70; // Medium quality for 3G
    case '2g':
    case 'slow-2g':
      return 50; // Low quality for slow connections
    default:
      return 80;
  }
}

/**
 * Check if browser supports a specific image format
 */
export function supportsImageFormat(format: 'webp' | 'avif'): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;

  // Check format support
  if (format === 'webp') {
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  if (format === 'avif') {
    return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
  }

  return false;
}
