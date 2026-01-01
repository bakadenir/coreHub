// Supabase Auth exports for backwards compatibility with existing imports
import { supabase } from './supabaseClient';

// Re-export commonly used auth methods
export const signIn = {
    email: async ({ email, password }: { email: string; password: string }) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { data: data.session ? { user: data.user, session: data.session } : null, error };
    },
    google: async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/home`,
            },
        });
        return { data, error };
    },
    github: async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: `${window.location.origin}/home`,
            },
        });
        return { data, error };
    },
};

export const signUp = {
    email: async ({ email, password, name }: { email: string; password: string; name: string }) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name, username: name },
            },
        });
        return { data: data.user ? { user: data.user } : null, error };
    },
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
};

export const getSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    return { data: data.session, error };
};

// For components that still use useSession hook pattern
export const useSession = () => {
    // This is a placeholder - actual session management is in AuthContext
    // Components should use useAuth() instead
    console.warn('useSession is deprecated, use useAuth() from AuthContext instead');
    return { data: null, isPending: false, refetch: () => { } };
};

export default supabase;

