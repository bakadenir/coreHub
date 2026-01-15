import { supabase } from '../config/supabase';

export interface NoteFilters {
    tag?: string;
    search?: string;
    sort?: 'created' | 'updated' | 'title';
}

export interface CreateNoteDto {
    title: string;
    content?: string;
    tag?: string;
    reminderAt?: string;
    contentType?: 'rich' | 'markdown';
}

export interface UpdateNoteDto extends Partial<CreateNoteDto> { }

// Helper to generate URL-friendly slug
function generateSlug(title: string): string {
    const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 50);
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `${slug}-${randomSuffix}`;
}

// Helper to transform snake_case DB fields to camelCase for frontend
function transformNote(note: any) {
    if (!note) return null;
    return {
        id: note.id,
        title: note.title,
        content: note.content,
        tag: note.color, // Supabase uses 'color', frontend expects 'tag'
        contentType: note.content_type || 'rich', // Default to rich for existing notes
        isPinned: note.is_pinned,
        isPublic: note.is_public || false,
        publicSlug: note.public_slug || null,
        createdAt: note.created_at,
        updatedAt: note.updated_at,
    };
}

export class NotesService {
    async findAll(userId: string, filters: NoteFilters & { limit?: number; offset?: number }) {
        // Optimized: Select only needed columns instead of *
        let query = supabase
            .from('notes')
            .select('id, title, content, color, content_type, is_pinned, is_public, public_slug, created_at, updated_at')
            .eq('user_id', userId)
            .is('deleted_at', null);

        if (filters.tag) {
            query = query.eq('tag', filters.tag);
        }

        // Order by pinned first, then by sort preference
        query = query.order('is_pinned', { ascending: false });

        switch (filters.sort) {
            case 'updated':
                query = query.order('updated_at', { ascending: false });
                break;
            case 'title':
                query = query.order('title', { ascending: true });
                break;
            default:
                query = query.order('created_at', { ascending: false });
        }

        // Pagination support
        const limit = filters.limit || 100; // Default limit
        const offset = filters.offset || 0;
        query = query.range(offset, offset + limit - 1);

        const { data, error } = await query;

        if (error) throw error;

        let result = data || [];

        // Filter by search if provided
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter(n =>
                n.title.toLowerCase().includes(searchLower) ||
                (n.content && n.content.toLowerCase().includes(searchLower))
            );
        }

        return result.map(transformNote);
    }

    async create(userId: string, data: CreateNoteDto) {
        const { data: note, error } = await supabase
            .from('notes')
            .insert({
                user_id: userId,
                title: data.title,
                content: data.content,
                tag: data.tag,
                reminder_at: data.reminderAt,
                content_type: data.contentType || 'rich',
            })
            .select()
            .single();

        if (error) throw error;
        return transformNote(note);
    }

    async findById(id: string, userId: string) {
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .is('deleted_at', null)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return transformNote(data);
    }

    async update(id: string, userId: string, data: UpdateNoteDto) {
        const updateData: any = { updated_at: new Date().toISOString() };
        if (data.title !== undefined) updateData.title = data.title;
        if (data.content !== undefined) updateData.content = data.content;
        if (data.tag !== undefined) updateData.tag = data.tag;
        if (data.reminderAt !== undefined) updateData.reminder_at = data.reminderAt;
        if (data.contentType !== undefined) updateData.content_type = data.contentType;

        const { data: note, error } = await supabase
            .from('notes')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        return transformNote(note);
    }

    async softDelete(id: string, userId: string) {
        const { error } = await supabase
            .from('notes')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;
    }

    async setPin(id: string, userId: string, isPinned: boolean) {
        const { data: note, error } = await supabase
            .from('notes')
            .update({
                is_pinned: isPinned,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        // PGRST116 means no rows returned (note not found)
        if (error && error.code !== 'PGRST116') throw error;
        return transformNote(note);
    }

    // Publish a note - make it public and generate slug
    async publish(id: string, userId: string) {
        // First get the note to generate slug from title
        const existing = await this.findById(id, userId);
        if (!existing) return null;

        const slug = generateSlug(existing.title);

        const { data: note, error } = await supabase
            .from('notes')
            .update({
                is_public: true,
                public_slug: slug,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        return transformNote(note);
    }

    // Unpublish a note - make it private and clear slug
    async unpublish(id: string, userId: string) {
        const { data: note, error } = await supabase
            .from('notes')
            .update({
                is_public: false,
                public_slug: null,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        return transformNote(note);
    }

    // Find public note by slug (no auth required)
    async findBySlug(slug: string) {
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('public_slug', slug)
            .eq('is_public', true)
            .is('deleted_at', null)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        if (!data) return null;

        // Get author info from Supabase Auth
        let authorName = 'Anonymous';
        let authorImage: string | null = null;
        if (data.user_id) {
            try {
                const { data: userData } = await supabase.auth.admin.getUserById(data.user_id);
                if (userData?.user?.user_metadata?.name) {
                    authorName = userData.user.user_metadata.name;
                } else if (userData?.user?.email) {
                    // Fallback to email username
                    authorName = userData.user.email.split('@')[0];
                }
                if (userData?.user?.user_metadata?.image) {
                    authorImage = userData.user.user_metadata.image;
                }
            } catch (e) {
                console.error('Error fetching author:', e);
            }
        }

        return {
            id: data.id,
            title: data.title,
            content: data.content,
            contentType: data.content_type || 'rich',
            authorName,
            authorImage,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
    }
}



