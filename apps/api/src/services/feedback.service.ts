import { supabase } from '../config/supabase';

export interface CreateFeedbackDto {
    name?: string;
    avatar?: string;
    rating: number;
    comment: string;
}

export class FeedbackService {
    async createOrUpdate(userId: string | null, data: CreateFeedbackDto) {
        if (userId) {
            const { data: existing } = await supabase
                .from('feedback')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (existing) {
                const { data: result, error } = await supabase
                    .from('feedback')
                    .update({
                        name: data.name || existing.name,
                        avatar: data.avatar !== undefined ? data.avatar : existing.avatar,
                        rating: Math.min(5, Math.max(1, data.rating)),
                        comment: data.comment,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', existing.id)
                    .select()
                    .single();

                if (error) throw error;
                return result;
            }
        }

        const { data: result, error } = await supabase
            .from('feedback')
            .insert({
                user_id: userId,
                name: data.name || 'Anonymous',
                avatar: data.avatar || null,
                rating: Math.min(5, Math.max(1, data.rating)),
                comment: data.comment,
                is_public: true,
                is_approved: true,
            })
            .select()
            .single();

        if (error) throw error;
        return result;
    }

    async update(id: string, userId: string, data: CreateFeedbackDto) {
        const { data: existing } = await supabase
            .from('feedback')
            .select('*')
            .eq('id', id)
            .single();

        if (!existing || existing.user_id !== userId) {
            return null;
        }

        const { data: result, error } = await supabase
            .from('feedback')
            .update({
                name: data.name || existing.name,
                avatar: data.avatar !== undefined ? data.avatar : existing.avatar,
                rating: Math.min(5, Math.max(1, data.rating)),
                comment: data.comment,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return result;
    }

    async getPublicReviews(limit: number = 10) {
        const { data, error } = await supabase
            .from('feedback')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    }

    async getAllForAdmin(filter?: 'pending' | 'approved' | 'all') {
        let query = supabase.from('feedback').select('*');

        if (filter === 'pending') {
            query = query.eq('is_approved', false);
        } else if (filter === 'approved') {
            query = query.eq('is_approved', true);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    async approve(id: string) {
        const { data, error } = await supabase
            .from('feedback')
            .update({ is_approved: true, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async delete(id: string) {
        const { error } = await supabase.from('feedback').delete().eq('id', id);
        if (error) throw error;
    }

    async getByUser(userId: string) {
        const { data, error } = await supabase
            .from('feedback')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }
}
