import { api } from './api';
import type { UserProfile } from '../types';

interface UpdateProfileData {
    name?: string;
    bio?: string;
    avatar?: string;
}

export const usersApi = {
    getMe: () => api.get<UserProfile>('/api/users/me'),

    updateProfile: (data: UpdateProfileData) =>
        api.patch<UserProfile>('/api/users/me', data),

    updateUsername: (username: string) =>
        api.patch<UserProfile>('/api/users/me/username', { username }),

    deleteAccount: () => api.delete('/api/users/me'),
};
