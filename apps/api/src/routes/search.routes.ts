import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { db } from '../config/database';
import { habits, notes, links, scheduleEvents } from '../db/schema';
import { and, eq, ilike, or, isNull } from 'drizzle-orm';
import { successResponse, serverErrorResponse } from '../utils/response';

const router = Router();

router.use(authMiddleware);

interface SearchResult {
    type: 'habit' | 'note' | 'link' | 'schedule';
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
        const habitResults = await db
            .select({
                id: habits.id,
                name: habits.name,
                category: habits.category,
                icon: habits.icon,
            })
            .from(habits)
            .where(
                and(
                    eq(habits.userId, userId),
                    isNull(habits.deletedAt),
                    or(
                        ilike(habits.name, searchTerm),
                        ilike(habits.description, searchTerm),
                        ilike(habits.category, searchTerm)
                    )
                )
            )
            .limit(5);

        for (const habit of habitResults) {
            results.push({
                type: 'habit',
                id: habit.id,
                title: habit.name,
                subtitle: habit.category || undefined,
                icon: habit.icon || 'self_improvement',
            });
        }

        // Search notes
        const noteResults = await db
            .select({
                id: notes.id,
                title: notes.title,
                tag: notes.tag,
            })
            .from(notes)
            .where(
                and(
                    eq(notes.userId, userId),
                    isNull(notes.deletedAt),
                    or(
                        ilike(notes.title, searchTerm),
                        ilike(notes.content, searchTerm),
                        ilike(notes.tag, searchTerm)
                    )
                )
            )
            .limit(5);

        for (const note of noteResults) {
            results.push({
                type: 'note',
                id: note.id,
                title: note.title,
                subtitle: note.tag || undefined,
                icon: 'description',
            });
        }

        // Search links
        const linkResults = await db
            .select({
                id: links.id,
                title: links.title,
                url: links.url,
            })
            .from(links)
            .where(
                and(
                    eq(links.userId, userId),
                    isNull(links.deletedAt),
                    or(
                        ilike(links.title, searchTerm),
                        ilike(links.description, searchTerm),
                        ilike(links.url, searchTerm)
                    )
                )
            )
            .limit(5);

        for (const link of linkResults) {
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
        const scheduleResults = await db
            .select({
                id: scheduleEvents.id,
                title: scheduleEvents.title,
                location: scheduleEvents.location,
            })
            .from(scheduleEvents)
            .where(
                and(
                    eq(scheduleEvents.userId, userId),
                    isNull(scheduleEvents.deletedAt),
                    or(
                        ilike(scheduleEvents.title, searchTerm),
                        ilike(scheduleEvents.description, searchTerm),
                        ilike(scheduleEvents.location, searchTerm)
                    )
                )
            )
            .limit(5);

        for (const event of scheduleResults) {
            results.push({
                type: 'schedule',
                id: event.id,
                title: event.title,
                subtitle: event.location || undefined,
                icon: 'event',
            });
        }

        return successResponse(res, results);
    } catch (error) {
        console.error('Error in global search:', error);
        return serverErrorResponse(res);
    }
});

export default router;
