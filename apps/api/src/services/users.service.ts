import { supabase } from '../config/supabase';

export interface UpdateUserDto {
    name?: string;
    bio?: string;
    image?: string;
}

export class UsersService {
    async findById(id: string) {
        // User data is now managed by Supabase Auth
        // We can get user from auth.users or create a profiles table
        const { data, error } = await supabase.auth.admin.getUserById(id);
        if (error) throw error;
        return data.user;
    }

    async update(id: string, data: UpdateUserDto) {
        // Update user metadata in Supabase Auth
        const { data: userData, error } = await supabase.auth.admin.updateUserById(id, {
            user_metadata: {
                name: data.name,
                bio: data.bio,
                image: data.image,
            },
        });
        if (error) throw error;
        return userData.user;
    }

    async updateUsername(id: string, username: string) {
        // Check if username is already taken by listing users
        const { data: users, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) throw listError;

        const existing = users.users.find(u =>
            u.user_metadata?.username === username && u.id !== id
        );

        if (existing) {
            throw new Error('Username already taken');
        }

        const { data: userData, error } = await supabase.auth.admin.updateUserById(id, {
            user_metadata: { username },
        });
        if (error) throw error;
        return userData.user;
    }

    async softDelete(id: string) {
        const { error } = await supabase.auth.admin.deleteUser(id);
        if (error) throw error;
    }
}
