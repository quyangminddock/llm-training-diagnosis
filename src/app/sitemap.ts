import { MetadataRoute } from 'next';
import { mockFailureCases } from '@/lib/mockData';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://ltd.minddock.ai';

    const staticRoutes = [
        '',
        '/cases',
        '/diagnose',
        '/calculator',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    const caseRoutes = mockFailureCases.map((c) => ({
        url: `${baseUrl}/cases/${c.id}`,
        lastModified: new Date(c.created_at),
        changeFrequency: 'monthly' as const,
        priority: 0.9, // High priority for long-tail SEO
    }));

    return [...staticRoutes, ...caseRoutes];
}
