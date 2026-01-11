'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { IUser, IDecodedToken, IApiResponse, IMeResponse, IUsageQuota, IUsageStats } from '@/types/api';
import { ISubscription } from '@/types/subscription';

// Re-export for backward compatibility
export type { IUser as User };

interface AuthContextType {
    user: IUser | null;
    subscription?: ISubscription;
    quota?: IUsageQuota;
    usage?: IUsageStats;
    loading: boolean;
    login: (token: string, refreshToken: string, userData: IUser, redirectPath?: string) => void;
    logout: () => void;
    hasPermission: (action: string, resource: string, scope: string) => boolean;
    updateUser: (userData: Partial<IUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<IUser | null>(null);
    const [subscription, setSubscription] = useState<ISubscription | undefined>(undefined);
    const [quota, setQuota] = useState<IUsageQuota | undefined>(undefined);
    const [usage, setUsage] = useState<IUsageStats | undefined>(undefined);
    const [permissions, setPermissions] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        console.log("Current Permissions:", permissions);
    }, [permissions]);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Decode token to get permissions
                    const decoded: IDecodedToken = jwtDecode(token);
                    setPermissions(decoded.permissions || []);

                    const { data } = await api.get<IApiResponse<IMeResponse>>('/auth/me');
                    // data.data is { user: ..., subscription: ..., quota: ..., usage: ... }
                    setUser(data.data.user);
                    setSubscription(data.data.subscription);
                    setQuota(data.data.quota);
                    setUsage(data.data.usage);
                } catch (error) {
                    console.error('Failed to fetch user or decode token', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                }
            }
            setLoading(false);
        };

        void initAuth();

        const handleTokenRefresh = (event: Event) => {
            const customEvent = event as CustomEvent;
            const newToken = customEvent.detail?.token;
            if (newToken) {
                try {
                    const decoded: IDecodedToken = jwtDecode(newToken);
                    setPermissions(decoded.permissions || []);
                    // Optionally re-fetch full user profile to get updated subscription/quota if needed
                    // For now, updating permissions is the critical part for UI responsiveness
                    api.get<IApiResponse<IMeResponse>>('/auth/me').then(({ data }) => {
                        setUser(data.data.user);
                        setSubscription(data.data.subscription);
                        setQuota(data.data.quota);
                        setUsage(data.data.usage);
                    }).catch(console.error);
                } catch (e) {
                    console.error("Failed to process refreshed token", e);
                }
            }
        };

        window.addEventListener('auth:token-refreshed', handleTokenRefresh);

        return () => {
            window.removeEventListener('auth:token-refreshed', handleTokenRefresh);
        };
    }, []);

    const updateUser = (userData: Partial<IUser>) => {
        if (user) {
            setUser({ ...user, ...userData });
        }
    };

    const login = (token: string, refreshToken: string, userData: IUser, redirectPath?: string) => {
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);

        try {
            const decoded: IDecodedToken = jwtDecode(token);
            setPermissions(decoded.permissions || []);
        } catch (e) {
            console.error("Failed to decode token on login", e);
            setPermissions([]);
        }

        setUser(userData);
        // Login usually just sets user, we might want to fetch full profile or just redirect
        // Ideally we should fetch me after login to get subscription data if not returned in login
        // But for now, we leave as is, initAuth handles refresh.
        router.push(redirectPath || '/dashboard');
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setUser(null);
        setSubscription(undefined);
        setQuota(undefined);
        setUsage(undefined);
        setPermissions([]);
        router.push('/auth/login');
    };

    const hasPermission = (action: string, resource: string, scope: string) => {
        // Super admin bypass or custom logic if needed
        // For now, simple string check
        const permissionString = `${action}:${resource}:${scope}`;
        const has = permissions.includes(permissionString);
        // console.log(`Checking permission: ${permissionString} -> ${has}`);
        return has;
    };

    // Protect routes (basic client-side check)
    useEffect(() => {
        const isPublicRoute = pathname?.startsWith('/public-chat');
        if (!loading && !user && !pathname?.startsWith('/auth') && pathname !== '/' && !isPublicRoute) {
            router.push('/auth/login');
        }
    }, [user, loading, pathname, router]);


    return (
        <AuthContext.Provider value={{ 
            user, 
            subscription,
            quota,
            usage,
            loading, 
            login, 
            logout, 
            hasPermission, 
            updateUser 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
