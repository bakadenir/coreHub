import { db } from '../config/database';
import { feedback } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

export interface CreateFeedbackDto {
    name?: string;
    avatar?: string; // user avatar URL
    rating: number; // 1-5
    comment: string;
}

export class FeedbackService {
    // Create or update feedback - one review per user
    async createOrUpdate(userId: string | null, data: CreateFeedbackDto) {
        // If user is logged in, check if they already have a review
        if (userId) {
            const existing = await db.query.feedback.findFirst({
                where: eq(feedback.userId, userId),
            });

            if (existing) {
                // Update existing review
                const [result] = await db.update(feedback)
                    .set({
                        name: data.name || existing.name,
                        rating: Math.min(5, Math.max(1, data.rating)),
                        comment: data.comment,
                        updatedAt: new Date(),
                    })
                    .where(eq(feedback.id, existing.id))
                    .returning();
                return result;
            }
        }

        // Create new review
        const [result] = await db.insert(feedback).values({
            userId,
            name: data.name || 'Anonymous',
            avatar: data.avatar || null,
            rating: Math.min(5, Math.max(1, data.rating)),
            comment: data.comment,
            isPublic: true,
            isApproved: true,
        }).returning();
        return result;
    }

    // Update existing review by ID
    async update(id: string, userId: string, data: CreateFeedbackDto) {
        // Verify ownership
        const existing = await db.query.feedback.findFirst({
            where: eq(feedback.id, id),
        });

        if (!existing || existing.userId !== userId) {
            return null; // Not found or not owner
        }

        const [result] = await db.update(feedback)
            .set({
                name: data.name || existing.name,
                rating: Math.min(5, Math.max(1, data.rating)),
                comment: data.comment,
                updatedAt: new Date(),
            })
            .where(eq(feedback.id, id))
            .returning();
        return result;
    }

    // Get all public reviews (transparent - no approval needed)
    async getPublicReviews(limit: number = 10) {
        const results = await db.query.feedback.findMany({
            orderBy: [desc(feedback.createdAt)],
            limit,
            with: {
                user: true, // Include user relation to get avatar
            },
        });

        // Map user image to avatar for each review
        return results.map((r: any) => ({
            ...r,
            avatar: r.user?.image || r.avatar || null, // Prefer user's image, fallback to stored avatar
            user: undefined, // Don't expose full user object
        }));
    }

    // Get all feedback for admin review
    async getAllForAdmin(filter?: 'pending' | 'approved' | 'all') {
        let condition;
        if (filter === 'pending') {
            condition = eq(feedback.isApproved, false);
        } else if (filter === 'approved') {
            condition = eq(feedback.isApproved, true);
        }

        const results = await db.query.feedback.findMany({
            where: condition,
            orderBy: [desc(feedback.createdAt)],
        });
        return results;
    }

    // Approve feedback (admin)
    async approve(id: string) {
        const [result] = await db.update(feedback)
            .set({ isApproved: true, updatedAt: new Date() })
            .where(eq(feedback.id, id))
            .returning();
        return result;
    }

    // Reject/delete feedback (admin)
    async delete(id: string) {
        await db.delete(feedback).where(eq(feedback.id, id));
    }

    // Get feedback by user
    async getByUser(userId: string) {
        const results = await db.query.feedback.findMany({
            where: eq(feedback.userId, userId),
            orderBy: [desc(feedback.createdAt)],
        });
        return results;
    }
}
