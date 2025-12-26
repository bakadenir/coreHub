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
}

export interface UpdateNoteDto extends Partial<CreateNoteDto> { }

// Helper to transform snake_case DB fields to camelCase for frontend
function transformNote(note: any) {
    if (!note) return null;
    return {
        id: note.id,
        title: note.title,
        content: note.content,
        tag: note.color, // Supabase uses 'color', frontend expects 'tag'
        isPinned: note.is_pinned,
        createdAt: note.created_at,
        updatedAt: note.updated_at,
    };
}

export class NotesService {
    async findAll(userId: string, filters: NoteFilters) {
        let query = supabase
            .from('notes')
            .select('*')
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
}
