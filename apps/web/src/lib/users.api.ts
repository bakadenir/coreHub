import { api } from './api';
import type { UserProfile } from '../types';

interface UpdateProfileData {
    name?: string;
    bio?: string;
    location?: string;
    // Note: avatar is uploaded separately via uploadAvatar
}

interface UploadAvatarResponse {
    avatarUrl: string;
}

export const usersApi = {
    getMe: () => api.get<UserProfile>('/users/me'),

    updateProfile: (data: UpdateProfileData) =>
        api.patch<UserProfile>('/users/me', data),

    updateUsername: (username: string) =>
        api.patch<UserProfile>('/users/me/username', { username }),

    uploadAvatar: (base64Image: string) =>
        api.post<UploadAvatarResponse>('/upload/avatar', { image: base64Image }),

    deleteAccount: () => api.delete('/users/me'),
};
