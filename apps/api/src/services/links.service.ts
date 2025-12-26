import { supabase } from '../config/supabase';

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
        const { data, error } = await supabase
            .from('links')
            .select('*, link_tags(*)')
            .eq('user_id', userId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (error) throw error;

        let filtered = data || [];

        // Filter by tags
        if (filters.tags && filters.tags.length > 0) {
            filtered = filtered.filter(link =>
                (link.link_tags || []).some((t: any) => filters.tags!.includes(t.tag))
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
            id: link.id,
            url: link.url,
            title: link.title,
            description: link.description,
            image: link.image,
            isPinned: link.is_pinned,
            createdAt: link.created_at,
            updatedAt: link.updated_at,
            tags: (link.link_tags || []).map((t: any) => t.tag),
        }));
    }

    async create(userId: string, data: CreateLinkDto) {
        const { tags, ...linkData } = data;

        const { data: link, error } = await supabase
            .from('links')
            .insert({
                user_id: userId,
                url: linkData.url,
                title: linkData.title,
                description: linkData.description,
                image: linkData.image,
            })
            .select()
            .single();

        if (error) throw error;

        if (tags && tags.length > 0) {
            await supabase
                .from('link_tags')
                .insert(tags.map(tag => ({ link_id: link.id, tag })));
        }

        return { ...link, tags: tags || [] };
    }

    async findById(id: string, userId: string) {
        const { data: link, error } = await supabase
            .from('links')
            .select('*, link_tags(*)')
            .eq('id', id)
            .eq('user_id', userId)
            .is('deleted_at', null)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        if (!link) return null;

        return {
            ...link,
            tags: (link.link_tags || []).map((t: any) => t.tag),
        };
    }

    async update(id: string, userId: string, data: UpdateLinkDto) {
        const { tags, ...linkData } = data;

        const updateData: any = { updated_at: new Date().toISOString() };
        if (linkData.url !== undefined) updateData.url = linkData.url;
        if (linkData.title !== undefined) updateData.title = linkData.title;
        if (linkData.description !== undefined) updateData.description = linkData.description;
        if (linkData.image !== undefined) updateData.image = linkData.image;

        const { data: link, error } = await supabase
            .from('links')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        if (!link) return null;

        if (tags !== undefined) {
            // Remove existing tags and add new ones
            await supabase.from('link_tags').delete().eq('link_id', id);
            if (tags.length > 0) {
                await supabase.from('link_tags').insert(
                    tags.map(tag => ({ link_id: id, tag }))
                );
            }
        }

        return { ...link, tags: tags || [] };
    }

    async softDelete(id: string, userId: string) {
        const { error } = await supabase
            .from('links')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;
    }

    async fetchMetadata(url: string) {
        try {
            const response = await fetch(url, {
                headers: { 'User-Agent': 'Mozilla/5.0 coreHub Link Preview' },
                signal: AbortSignal.timeout(5000),
            });
            const html = await response.text();

            const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
            const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)['"]/i) ||
                html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)['"]/i);
            const imageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)['"]/i);

            return {
                title: titleMatch ? titleMatch[1].trim() : url,
                description: descMatch ? descMatch[1].trim() : '',
                image: imageMatch ? imageMatch[1] : '',
            };
        } catch {
            return { title: url, description: '', image: '' };
        }
    }

    async setPin(id: string, userId: string, isPinned: boolean) {
        const { data: link, error } = await supabase
            .from('links')
            .update({
                is_pinned: isPinned,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .eq('user_id', userId)
            .select('*, link_tags(*)')
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        if (!link) return null;

        return {
            id: link.id,
            url: link.url,
            title: link.title,
            description: link.description,
            image: link.image,
            isPinned: link.is_pinned,
            createdAt: link.created_at,
            updatedAt: link.updated_at,
            tags: (link.link_tags || []).map((t: any) => t.tag),
        };
    }
}
