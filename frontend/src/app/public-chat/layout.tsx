'use client';

import React from 'react';
import { LayoutProvider } from '@/context/LayoutContext';

export default function PublicChatLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <LayoutProvider>
            <div className="flex h-screen overflow-hidden bg-background">
                <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                    <div className="flex-1 overflow-y-auto relative flex flex-col">
                        {children}
                    </div>
                </main>
            </div>
        </LayoutProvider>
    );
}
