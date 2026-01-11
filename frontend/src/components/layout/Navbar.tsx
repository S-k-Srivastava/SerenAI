'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { User } from 'lucide-react';

export const Navbar = () => {
    const { user } = useAuth();

    return (
        <header className="h-16 border-b border-white/5 flex items-center justify-end px-6 lg:px-8 bg-background/80 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                    <span className="text-sm font-medium text-foreground">
                        {user?.firstName || user?.email}
                    </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-muted border border-white/10 flex items-center justify-center text-muted-foreground">
                    <User className="w-5 h-5" />
                </div>
            </div>
        </header>
    );
};
