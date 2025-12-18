import { db } from '../config/database';
import { user } from '../db/schema';  // Use 'user' table from better-auth, not 'users'
import { eq } from 'drizzle-orm';

export interface UpdateUserDto {
    name?: string;
    bio?: string;
    image?: string;  // Changed from 'avatar' to 'image' to match schema
}

export class UsersService {
    async findById(id: string) {
        return db.query.user.findFirst({
            where: eq(user.id, id),
        });
    }

    async update(id: string, data: UpdateUserDto) {
        const [updatedUser] = await db.update(user)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(user.id, id))
            .returning();
        return updatedUser;
    }

    async updateUsername(id: string, username: string) {
        // Check if username is already taken
        const existing = await db.query.user.findFirst({
            where: eq(user.username, username),
        });

        if (existing && existing.id !== id) {
            throw new Error('Username already taken');
        }

        const [updatedUser] = await db.update(user)
            .set({ username, updatedAt: new Date() })
            .where(eq(user.id, id))
            .returning();
        return updatedUser;
    }

    async softDelete(id: string) {
        // For better-auth, we should delete the user entirely
        // or add a deletedAt field to the schema
        await db.delete(user).where(eq(user.id, id));
    }
}
