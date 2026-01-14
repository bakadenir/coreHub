import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { supabase } from '../config/supabase';
import { successResponse, serverErrorResponse } from '../utils/response';

const router = Router();

router.use(authMiddleware);

interface SearchResult {
    type: 'habit' | 'note' | 'link' | 'schedule' | 'todo';
    id: string;
    title: string;
    subtitle?: string;
    icon: string;
    url?: string;
}

// GET /api/search?q=query - Global search across all modules
router.get('/', async (req, res) => {
    try {
        const { q } = req.query;
        const userId = req.user!.id;

        if (!q || typeof q !== 'string' || q.trim().length < 2) {
            return successResponse(res, []);
        }

        const searchTerm = `%${q.trim()}%`;
        const results: SearchResult[] = [];

        // Search habits
        const { data: habitResults } = await supabase
            .from('habits')
            .select('id, name, category, icon')
            .eq('user_id', userId)
            .is('deleted_at', null)
            .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},category.ilike.${searchTerm}`)
            .limit(5);

        for (const habit of habitResults || []) {
            results.push({
                type: 'habit',
                id: habit.id,
                title: habit.name,
                subtitle: habit.category || undefined,
                icon: habit.icon || 'self_improvement',
            });
        }

        // Search notes
        const { data: noteResults } = await supabase
            .from('notes')
            .select('id, title, tag')
            .eq('user_id', userId)
            .is('deleted_at', null)
            .or(`title.ilike.${searchTerm},content.ilike.${searchTerm},tag.ilike.${searchTerm}`)
            .limit(5);

        for (const note of noteResults || []) {
            results.push({
                type: 'note',
                id: note.id,
                title: note.title,
                subtitle: note.tag || undefined,
                icon: 'description',
            });
        }

        // Search links
        const { data: linkResults } = await supabase
            .from('links')
            .select('id, title, url')
            .eq('user_id', userId)
            .is('deleted_at', null)
            .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},url.ilike.${searchTerm}`)
            .limit(5);

        for (const link of linkResults || []) {
            results.push({
                type: 'link',
                id: link.id,
                title: link.title || link.url,
                subtitle: link.url,
                icon: 'link',
                url: link.url,
            });
        }

        // Search schedules
        const { data: scheduleResults } = await supabase
            .from('schedule_events')
            .select('id, title, location')
            .eq('user_id', userId)
            .is('deleted_at', null)
            .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},location.ilike.${searchTerm}`)
            .limit(5);

        for (const event of scheduleResults || []) {
            results.push({
                type: 'schedule',
                id: event.id,
                title: event.title,
                subtitle: event.location || undefined,
                icon: 'event',
            });
        }

        // Search todos
        const { data: todoResults } = await supabase
            .from('todos')
            .select('id, title, priority, is_completed')
            .eq('user_id', userId)
            .is('deleted_at', null)
            .ilike('title', searchTerm)
            .limit(5);

        for (const todo of todoResults || []) {
            const priorityLabel = todo.priority === 'high' ? '🔴 High' : todo.priority === 'medium' ? '🟡 Medium' : '🟢 Low';
            results.push({
                type: 'todo',
                id: todo.id,
                title: todo.title,
                subtitle: todo.is_completed ? '✓ Completed' : priorityLabel,
                icon: todo.is_completed ? 'check_circle' : 'checklist',
            });
        }

        return successResponse(res, results);
    } catch (error) {
        console.error('Error in global search:', error);
        return serverErrorResponse(res);
    }
});

export default router;
