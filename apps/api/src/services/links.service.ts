import { db } from '../config/database';
import { links, linkTags } from '../db/schema';
import { eq, and, isNull, desc } from 'drizzle-orm';

export interface LinkFilters {
    tags?: string[];
    search?: string;
}

export interface CreateLinkDto {
    url: string;
    title?: string;
    description?: string;
    image?: string;
    tags?: string[];
}

export interface UpdateLinkDto extends Partial<Omit<CreateLinkDto, 'tags'>> {
    tags?: string[];
}

export class LinksService {
    async findAll(userId: string, filters: LinkFilters) {
        const result = await db.query.links.findMany({
            where: and(eq(links.userId, userId), isNull(links.deletedAt)),
            orderBy: desc(links.createdAt),
            with: {
                tags: true,
            },
        });

        let filtered = result;

        // Filter by tags
        if (filters.tags && filters.tags.length > 0) {
            filtered = filtered.filter(link =>
                link.tags.some(t => filters.tags!.includes(t.tag))
            );
        }

        // Filter by search
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(link =>
                (link.title && link.title.toLowerCase().includes(searchLower)) ||
                (link.description && link.description.toLowerCase().includes(searchLower)) ||
                link.url.toLowerCase().includes(searchLower)
            );
        }

        return filtered.map(link => ({
            ...link,
            tags: link.tags.map(t => t.tag),
        }));
    }

    async create(userId: string, data: CreateLinkDto) {
        const { tags, ...linkData } = data;

        const [link] = await db.insert(links).values({
            userId,
            ...linkData,
        }).returning();

        if (tags && tags.length > 0) {
            await db.insert(linkTags).values(
                tags.map(tag => ({ linkId: link.id, tag }))
            );
        }

        return { ...link, tags: tags || [] };
    }

    async findById(id: string, userId: string) {
        const link = await db.query.links.findFirst({
            where: and(eq(links.id, id), eq(links.userId, userId), isNull(links.deletedAt)),
            with: {
                tags: true,
            },
        });

        if (!link) return null;

        return {
            ...link,
            tags: link.tags.map(t => t.tag),
        };
    }

    async update(id: string, userId: string, data: UpdateLinkDto) {
        const { tags, ...linkData } = data;

        const [link] = await db.update(links)
            .set({ ...linkData, updatedAt: new Date() })
            .where(and(eq(links.id, id), eq(links.userId, userId)))
            .returning();

        if (!link) return null;

        if (tags !== undefined) {
            // Remove existing tags and add new ones
            await db.delete(linkTags).where(eq(linkTags.linkId, id));
            if (tags.length > 0) {
                await db.insert(linkTags).values(
                    tags.map(tag => ({ linkId: id, tag }))
                );
            }
        }

        return { ...link, tags: tags || [] };
    }

    async softDelete(id: string, userId: string) {
        await db.update(links)
            .set({ deletedAt: new Date() })
            .where(and(eq(links.id, id), eq(links.userId, userId)));
    }

    async fetchMetadata(url: string) {
        // Simple metadata fetching - in production, use a proper library like metascraper
        try {
            const response = await fetch(url, {
                headers: { 'User-Agent': 'Mozilla/5.0 coreHub Link Preview' },
                signal: AbortSignal.timeout(5000),
            });
            const html = await response.text();

            const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
            const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
                html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
            const imageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i);

            return {
                title: titleMatch ? titleMatch[1].trim() : url,
                description: descMatch ? descMatch[1].trim() : '',
                image: imageMatch ? imageMatch[1] : '',
            };
        } catch {
            return { title: url, description: '', image: '' };
        }
    }
}
