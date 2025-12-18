import { api } from './api';
import type { UserProfile } from '../types';

interface UpdateProfileData {
    name?: string;
    bio?: string;
    // Note: avatar is uploaded separately via uploadAvatar
}

interface UploadAvatarResponse {
    avatarUrl: string;
}

export const usersApi = {
    getMe: () => api.get<UserProfile>('/api/users/me'),

    updateProfile: (data: UpdateProfileData) =>
        api.patch<UserProfile>('/api/users/me', data),

    updateUsername: (username: string) =>
        api.patch<UserProfile>('/api/users/me/username', { username }),

    uploadAvatar: (base64Image: string) =>
        api.post<UploadAvatarResponse>('/api/upload/avatar', { image: base64Image }),

    deleteAccount: () => api.delete('/api/users/me'),
};
