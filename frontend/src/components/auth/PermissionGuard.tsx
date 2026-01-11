'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';

interface PermissionGuardProps {
    permission: string; // Format: "action:resource:scope"
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
    permission,
    children,
    fallback = null,
}) => {
    const { hasPermission, loading } = useAuth();

    if (loading) return null; // Or a skeleton

    const parts = permission.split(':');
    if (parts.length !== 3) {
        console.error(`Invalid permission format: ${permission}. Expected action:resource:scope`);
        return <>{fallback}</>;
    }
    const [action, resource, scope] = parts;

    if (hasPermission(action, resource, scope)) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
};
