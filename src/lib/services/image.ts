import config from '@/lib/config';
import type { ImageData } from '@/lib/types';

export interface ProcessedImageData {
  src: string;
  srcSet?: string;
  width: number;
  height: number;
  alt: string;
  placeholder?: string;
  blurDataURL?: string;
}

export interface ImageSize {
  width: number;
  height: number;
  suffix: string;
}

const IMAGE_SIZES: ImageSize[] = [
  { width: 64, height: 64, suffix: 'icon' },
  { width: 320, height: 180, suffix: 'thumb' },
  { width: 640, height: 360, suffix: 'cover' },
  { width: 1280, height: 720, suffix: 'large' },
  { width: 1920, height: 1080, suffix: 'xlarge' },
];

const DEFAULT_PLACEHOLDERS: Record<string, string> = {
  article: '/placeholders/article-cover.svg',
  tutorial: '/placeholders/tutorial-block.svg',
  avatar: '/placeholders/avatar.svg',
  category: '/placeholders/category.svg',
  author: '/placeholders/author.svg',
};

class ImageService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = config.mediaBaseUrl;
  }

  /**
   * Build full URL for an image path
   */
  getImageUrl(path?: string | null): string | null {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
      return path;
    }
    return `${this.baseUrl}/${path}`;
  }

  /**
   * Process image data from backend into optimized format for Next.js Image
   */
  processImageData(image: ImageData | null, fallbackType: keyof typeof DEFAULT_PLACEHOLDERS = 'article'): ProcessedImageData | null {
    if (!image?.path) {
      return this.getPlaceholder(fallbackType);
    }

    const baseUrl = this.getImageUrl(image.path);
    if (!baseUrl) return this.getPlaceholder(fallbackType);

    const thumbnails = image.thumbnails ?? {};
    const width = image.width ?? 1280;
    const height = image.height ?? 720;
    const alt = image.alt ?? image.caption ?? 'Immagine';

    const srcSet = IMAGE_SIZES.map((size) => {
      const thumbPath = thumbnails[size.suffix as keyof typeof thumbnails] ?? image.path;
      const thumbUrl = this.getImageUrl(thumbPath);
      return thumbUrl ? `${thumbUrl} ${size.width}w` : null;
    }).filter(Boolean).join(', ');

    return {
      src: baseUrl,
      srcSet: srcSet || undefined,
      width,
      height,
      alt,
      placeholder: 'blur',
      blurDataURL: thumbnails.icon ? this.getImageUrl(thumbnails.icon) ?? undefined : undefined,
    };
  }

  /**
   * Get optimized cover image path (prefers cover thumb, falls back to main image)
   */
  getCoverImagePath(
    image: ImageData | null,
    categoryImage: ImageData | null
  ): string | null {
    if (image?.thumbnails?.cover) return this.getImageUrl(image.thumbnails.cover);
    if (image?.thumbnails?.large) return this.getImageUrl(image.thumbnails.large);
    if (image?.path) return this.getImageUrl(image.path);
    if (categoryImage?.thumbnails?.cover) return this.getImageUrl(categoryImage.thumbnails.cover);
    if (categoryImage?.path) return this.getImageUrl(categoryImage.path);
    return null;
  }

  /**
   * Get loop/thumbnail image path for lists/grids
   */
  getLoopImagePath(
    image: ImageData | null,
    categoryImage: ImageData | null = null
  ): string | null {
    if (image?.thumbnails?.thumb) return this.getImageUrl(image.thumbnails.thumb);
    if (image?.thumbnails?.cover) return this.getImageUrl(image.thumbnails.cover);
    if (image?.path) return this.getImageUrl(image.path);
    if (categoryImage?.thumbnails?.thumb) return this.getImageUrl(categoryImage.thumbnails.thumb);
    if (categoryImage?.path) return this.getImageUrl(categoryImage.path);
    return null;
  }

  /**
   * Get avatar image path
   */
  getAvatarPath(avatar: string | null): string | null {
    if (!avatar) return null;
    return this.getImageUrl(avatar);
  }

  /**
   * Get placeholder for a given type
   */
  private getPlaceholder(type: keyof typeof DEFAULT_PLACEHOLDERS): ProcessedImageData {
    const src = DEFAULT_PLACEHOLDERS[type];
    return {
      src,
      width: 1280,
      height: 720,
      alt: '',
      placeholder: 'blur',
      blurDataURL: src,
    };
  }

  /**
   * Generate blur data URL for a small base64 image
   */
  generateBlurDataURL(width: number = 10, height: number = 10): string {
    const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
    if (!canvas) return '';
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    return canvas.toDataURL('image/jpeg', 0.1);
  }
}

const imageService = new ImageService();
export default imageService;