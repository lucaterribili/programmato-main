import { localeSitemapResponse } from '@/lib/sitemap/locale-route';

export const revalidate = 3600;

export async function GET() {
  return localeSitemapResponse('it');
}
