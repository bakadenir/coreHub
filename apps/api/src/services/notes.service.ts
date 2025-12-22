import { db } from '../config/database';
import { notes } from '../db/schema';
import { eq, and, isNull, desc, asc } from 'drizzle-orm';

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

export class NotesService {
    async findAll(userId: string, filters: NoteFilters) {
        const conditions = [eq(notes.userId, userId), isNull(notes.deletedAt)];

        if (filters.tag) {
            conditions.push(eq(notes.tag, filters.tag));
        }

        let orderBy;
        switch (filters.sort) {
            case 'updated':
                orderBy = desc(notes.updatedAt);
                break;
            case 'title':
                orderBy = asc(notes.title);
                break;
            default:
                orderBy = desc(notes.createdAt);
        }

        const result = await db.query.notes.findMany({
            where: and(...conditions),
            orderBy: [desc(notes.isPinned), orderBy],
        });

        // Filter by search if provided (client-side for simplicity)
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            return result.filter(n =>
                n.title.toLowerCase().includes(searchLower) ||
                (n.content && n.content.toLowerCase().includes(searchLower))
            );
        }

        return result;
    }

    async create(userId: string, data: CreateNoteDto) {
        const [note] = await db.insert(notes).values({
            userId,
            ...data,
            reminderAt: data.reminderAt ? new Date(data.reminderAt) : null,
        }).returning();
        return note;
    }

    async findById(id: string, userId: string) {
        return db.query.notes.findFirst({
            where: and(eq(notes.id, id), eq(notes.userId, userId), isNull(notes.deletedAt)),
        });
    }

    async update(id: string, userId: string, data: UpdateNoteDto) {
        const updateData: any = { ...data, updatedAt: new Date() };
        if (data.reminderAt) updateData.reminderAt = new Date(data.reminderAt);

        const [note] = await db.update(notes)
            .set(updateData)
            .where(and(eq(notes.id, id), eq(notes.userId, userId)))
            .returning();
        return note;
    }

    async softDelete(id: string, userId: string) {
        await db.update(notes)
            .set({ deletedAt: new Date() })
            .where(and(eq(notes.id, id), eq(notes.userId, userId)));
    }

    async setPin(id: string, userId: string, isPinned: boolean, pinnedUntil?: string) {
        const [note] = await db.update(notes)
            .set({
                isPinned,
                pinnedUntil: pinnedUntil ? new Date(pinnedUntil) : null,
                updatedAt: new Date(),
            })
            .where(and(eq(notes.id, id), eq(notes.userId, userId)))
            .returning();
        return note;
    }
}
