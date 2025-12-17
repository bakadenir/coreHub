import { db } from '../config/database';
import { users } from '../db/schema';
import { eq, and, isNull } from 'drizzle-orm';

export interface UpdateUserDto {
    name?: string;
    bio?: string;
    avatar?: string;
}

export class UsersService {
    async findById(id: string) {
        return db.query.users.findFirst({
            where: and(eq(users.id, id), isNull(users.deletedAt)),
        });
    }

    async update(id: string, data: UpdateUserDto) {
        const [user] = await db.update(users)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(users.id, id))
            .returning();
        return user;
    }

    async updateUsername(id: string, username: string) {
        // Check if username is already taken
        const existing = await db.query.users.findFirst({
            where: eq(users.username, username),
        });

        if (existing && existing.id !== id) {
            throw new Error('Username already taken');
        }

        const [user] = await db.update(users)
            .set({ username, updatedAt: new Date() })
            .where(eq(users.id, id))
            .returning();
        return user;
    }

    async softDelete(id: string) {
        await db.update(users)
            .set({ deletedAt: new Date() })
            .where(eq(users.id, id));
    }
}
