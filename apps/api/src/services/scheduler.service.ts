import cron, { ScheduledTask } from 'node-cron';
import { supabase } from '../config/supabase';
import { sendPushNotification } from './push.service';

// Store for scheduled jobs (null for notification markers, ScheduledTask for actual cron jobs)
const scheduledJobs: Map<string, ScheduledTask | null> = new Map();

// Check for upcoming schedule reminders
async function checkScheduleReminders() {
    try {
        const now = new Date();

        const { data: settings } = await supabase
            .from('notification_settings')
            .select('*')
            .eq('schedule_reminders', true);

        for (const setting of settings || []) {
            const reminderWindow = new Date(now.getTime() + (setting.schedule_reminder_minutes || 15) * 60 * 1000);

            const { data: upcomingEvents } = await supabase
                .from('schedule_events')
                .select('*')
                .eq('user_id', setting.user_id)
                .gte('start_time', now.toISOString())
                .lte('start_time', reminderWindow.toISOString())
                .is('deleted_at', null);

            for (const event of upcomingEvents || []) {
                const notifKey = `schedule_${event.id}_${new Date(event.start_time).getTime()}`;

                if (!scheduledJobs.has(notifKey)) {
                    const minutesUntil = Math.round((new Date(event.start_time).getTime() - now.getTime()) / 60000);

                    await sendPushNotification(
                        setting.user_id,
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

        const { data: settings } = await supabase
            .from('notification_settings')
            .select('*')
            .eq('habit_reminders', true);

        for (const setting of settings || []) {
            const { data: userHabits } = await supabase
                .from('habits')
                .select('*')
                .eq('user_id', setting.user_id)
                .eq('is_archived', false)
                .is('deleted_at', null);

            for (const habit of userHabits || []) {
                const shouldRunToday =
                    habit.frequency === 'daily' ||
                    (habit.frequency === 'weekly' && currentDay === 0) ||
                    (habit.frequency === 'specific_days' &&
                        habit.specific_days &&
                        (habit.specific_days as number[]).includes(currentDay));

                if (!shouldRunToday) continue;

                if (habit.reminder_time) {
                    const [hours, minutes] = habit.reminder_time.split(':').map(Number);

                    if (hours === currentHour && minutes === currentMinute) {
                        const notifKey = `habit_${habit.id}_${now.toDateString()}`;

                        if (!scheduledJobs.has(notifKey)) {
                            await sendPushNotification(
                                setting.user_id,
                                {
                                    title: '✅ Habit Reminder',
                                    body: `Don't forget: ${habit.title}`,
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

    cron.schedule('* * * * *', checkScheduleReminders);
    cron.schedule('* * * * *', checkHabitReminders);

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
