/**
 * Optimizes Cloudinary URLs by injecting automatic formatting and quality transformations.
 * 
 * @param url The raw Cloudinary URL
 * @param type 'image' or 'video'
 * @returns Optimized Cloudinary URL
 */
export function optimizeCloudinaryUrl(url: string, type: 'image' | 'video' = 'image'): string {
  if (!url || !url.includes('res.cloudinary.com')) {
    return url;
  }

  // Check if transformations are already present
  if (url.includes('/upload/f_') || url.includes('/upload/q_') || url.includes('/upload/vc_')) {
    return url;
  }

  const transformations = type === 'video' 
    ? 'f_auto,q_auto,vc_auto' 
    : 'f_auto,q_auto';

  // Inject transformations right after '/upload/'
  return url.replace('/upload/', `/upload/${transformations}/`);
}
