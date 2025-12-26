import { MetadataRoute } from 'next';
import { mockFailureCases } from '@/lib/mockData';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://llm-diagnosis.com'; // Replace with actual domain

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
