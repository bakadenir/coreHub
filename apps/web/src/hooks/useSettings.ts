import useSWR from 'swr';
import { usersApi, notificationsApi } from '../lib';

interface UserSettings {
    name: string;
    bio: string;
    location: string;
    image: string;
    email?: string;
    role?: string;
}

interface NotificationSettings {
    habitReminders: boolean;
    scheduleReminders: boolean;
    todoReminders: boolean;
    scheduleReminderMinutes: number;
}

interface SettingsData {
    profile: UserSettings;
    notifications: NotificationSettings;
}

const fetcher = async (): Promise<SettingsData> => {
    const [userResult, notifResult] = await Promise.all([
        usersApi.getMe(),
        notificationsApi.getSettings()
    ]);

    const profile: UserSettings = {
        name: userResult.data?.name || '',
        bio: userResult.data?.bio || '',
        location: userResult.data?.location || '',
        image: userResult.data?.image || '',
        email: userResult.data?.email,
        role: userResult.data?.role,
    };

    const notifications: NotificationSettings = {
        habitReminders: notifResult.data?.habitReminders ?? true,
        scheduleReminders: notifResult.data?.scheduleReminders ?? true,
        todoReminders: notifResult.data?.todoReminders ?? true,
        scheduleReminderMinutes: notifResult.data?.scheduleReminderMinutes ?? 15,
    };

    return { profile, notifications };
};

export function useSettings() {
    const { data, error, isLoading, mutate } = useSWR<SettingsData>('settings', fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 5000,
    });

    return {
        profile: data?.profile || { name: '', bio: '', location: '', image: '' },
        notifications: data?.notifications || { habitReminders: true, scheduleReminders: true, todoReminders: true, scheduleReminderMinutes: 15 },
        isLoading,
        error: error?.message || null,
        mutate,
    };
}
