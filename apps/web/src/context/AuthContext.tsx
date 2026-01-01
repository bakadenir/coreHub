/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react';
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

    // Track last user ID to prevent unnecessary updates
    const lastUserIdRef = useRef<string | null>(null);

    useEffect(() => {
        // Handle OAuth callback hash fragment
        const handleOAuthCallback = async () => {
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            const accessToken = hashParams.get('access_token');

            if (accessToken) {
                console.log('OAuth callback detected, extracting session...');
                // Let Supabase handle the hash - it should auto-detect it
                // Just trigger a getSession which will pick up the hash
            }

            // Get initial session
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) {
                console.error('Error getting session:', error);
            }
            const newUser = mapSupabaseUser(session?.user ?? null);
            lastUserIdRef.current = newUser?.id ?? null;
            setSession(session);
            setUser(newUser);
            setIsLoading(false);
        };

        handleOAuthCallback();

        // Listen for auth changes - update on any auth event
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth event:', event, 'Session:', !!session);

            const newUser = mapSupabaseUser(session?.user ?? null);
            const newUserId = newUser?.id ?? null;

            // Always update session and user on SIGNED_IN or TOKEN_REFRESHED
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
                lastUserIdRef.current = newUserId;
                setSession(session);
                setUser(newUser);
            }
            // For other events, only update if user actually changed
            else if (newUserId !== lastUserIdRef.current) {
                lastUserIdRef.current = newUserId;
                setSession(session);
                setUser(newUser);
            }
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
