import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string;
    bio?: string;
    username?: string;
}

interface AuthContextType {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    signOut: () => Promise<void>;
    refetch: () => void;
    refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapSupabaseUser(supabaseUser: SupabaseUser | null): User | null {
    if (!supabaseUser) return null;
    return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || 'User',
        role: supabaseUser.user_metadata?.role || 'user',
        avatar: supabaseUser.user_metadata?.image || supabaseUser.user_metadata?.avatar_url,
        bio: supabaseUser.user_metadata?.bio,
        username: supabaseUser.user_metadata?.username,
    };
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(mapSupabaseUser(session?.user ?? null));
            setIsLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(mapSupabaseUser(session?.user ?? null));
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        setIsLoading(true);
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setIsLoading(false);
    };

    const refetch = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(mapSupabaseUser(session?.user ?? null));
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                isLoading,
                isAuthenticated: !!user,
                signOut: handleSignOut,
                refetch,
                refreshUser: refetch,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
