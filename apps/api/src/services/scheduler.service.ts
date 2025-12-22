import cron, { ScheduledTask } from 'node-cron';
import { db } from '../config/database';
import { habits, scheduleEvents, notificationSettings } from '../db/schema';
import { eq, and, lte, gte, isNull } from 'drizzle-orm';
import { sendPushNotification } from './push.service';

// Store for scheduled jobs (null for notification markers, ScheduledTask for actual cron jobs)
const scheduledJobs: Map<string, ScheduledTask | null> = new Map();

// Check for upcoming schedule reminders
async function checkScheduleReminders() {
    try {
        const now = new Date();

        // Get all users with schedule reminders enabled
        const settings = await db.select()
            .from(notificationSettings)
            .where(eq(notificationSettings.scheduleReminders, true));

        for (const setting of settings) {
            const reminderWindow = new Date(now.getTime() + (setting.scheduleReminderMinutes || 15) * 60 * 1000);

            // Find events starting within the reminder window
            const upcomingEvents = await db.select()
                .from(scheduleEvents)
                .where(and(
                    eq(scheduleEvents.userId, setting.userId),
                    gte(scheduleEvents.startTime, now),
                    lte(scheduleEvents.startTime, reminderWindow),
                    isNull(scheduleEvents.deletedAt)
                ));

            for (const event of upcomingEvents) {
                // Create a unique notification key to avoid duplicates
                const notifKey = `schedule_${event.id}_${event.startTime.getTime()}`;

                // Check if we already sent a notification for this event
                // In production, we'd store this in the database
                if (!scheduledJobs.has(notifKey)) {
                    const minutesUntil = Math.round((event.startTime.getTime() - now.getTime()) / 60000);

                    await sendPushNotification(
                        setting.userId,
                        {
                            title: '📅 Upcoming Event',
                            body: `${event.title} starts in ${minutesUntil} minutes`,
                            tag: notifKey,
                            data: { type: 'schedule', id: event.id },
                        },
                        true,
                        'schedule_reminder',
                        event.id,
                        'schedule'
                    );

                    // Mark as notified (temporary in-memory)
                    scheduledJobs.set(notifKey, null);
                }
            }
        }
    } catch (error) {
        console.error('Error checking schedule reminders:', error);
    }
}

// Check for habit reminders
async function checkHabitReminders() {
    try {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentDay = now.getDay();

        // Get all users with habit reminders enabled
        const settings = await db.select()
            .from(notificationSettings)
            .where(eq(notificationSettings.habitReminders, true));

        for (const setting of settings) {
            // Get habits with reminders for this user
            const userHabits = await db.select()
                .from(habits)
                .where(and(
                    eq(habits.userId, setting.userId),
                    eq(habits.isArchived, false),
                    isNull(habits.deletedAt)
                ));

            for (const habit of userHabits) {
                // Check if habit should run today
                const shouldRunToday =
                    habit.frequency === 'daily' ||
                    (habit.frequency === 'weekly' && currentDay === 0) || // Sunday for weekly
                    (habit.frequency === 'specific_days' &&
                        habit.specificDays &&
                        (habit.specificDays as number[]).includes(currentDay));

                if (!shouldRunToday) continue;

                // Check if reminder time matches current time
                if (habit.reminderTime) {
                    const [hours, minutes] = habit.reminderTime.split(':').map(Number);

                    if (hours === currentHour && minutes === currentMinute) {
                        const notifKey = `habit_${habit.id}_${now.toDateString()}`;

                        if (!scheduledJobs.has(notifKey)) {
                            await sendPushNotification(
                                setting.userId,
                                {
                                    title: '✅ Habit Reminder',
                                    body: `Don't forget: ${habit.name}`,
                                    tag: notifKey,
                                    data: { type: 'habit', id: habit.id },
                                },
                                true,
                                'habit_reminder',
                                habit.id,
                                'habit'
                            );

                            scheduledJobs.set(notifKey, null);
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error checking habit reminders:', error);
    }
}

// Start the scheduler
export function startScheduler() {
    console.log('🕐 Starting notification scheduler...');

    // Check schedule reminders every minute
    cron.schedule('* * * * *', checkScheduleReminders);

    // Check habit reminders every minute
    cron.schedule('* * * * *', checkHabitReminders);

    // Clean up old notification keys every hour
    cron.schedule('0 * * * *', () => {
        scheduledJobs.clear();
        console.log('🧹 Cleared notification cache');
    });

    console.log('✅ Notification scheduler started');
}

// Stop the scheduler
export function stopScheduler() {
    scheduledJobs.forEach((job) => {
        if (job) job.stop();
    });
    scheduledJobs.clear();
    console.log('⏹️ Notification scheduler stopped');
}
