import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useSession as useBetterAuthSession, signOut as betterAuthSignOut } from '../lib/auth';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string;
    bio?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    signOut: () => Promise<void>;
    refetch: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const { data: session, isPending, refetch } = useBetterAuthSession();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(isPending);
    }, [isPending]);

    const user: User | null = session?.user ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: (session.user as any).role || 'user',
        avatar: (session.user as any).avatar,
        bio: (session.user as any).bio,
    } : null;

    const handleSignOut = async () => {
        await betterAuthSignOut();
        refetch();
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                signOut: handleSignOut,
                refetch,
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
