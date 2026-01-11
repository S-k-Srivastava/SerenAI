'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { ResourceNameProvider } from '@/context/ResourceNameContext';
import { LayoutProvider, useLayout } from '@/context/LayoutContext';
import { useAuth } from '@/context/AuthContext';
import { AppLoader } from '@/components/common/AppLoader';

function ProtectedLayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { mobileMenuOpen, setMobileMenuOpen } = useLayout();

    const { loading: authLoading } = useAuth();
    
    // Check if we are in a chat page (which has its own header)
    const isChatPage = pathname.startsWith('/chat/') && pathname.split('/').length > 2;

    // Close mobile menu when path changes
    React.useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname, setMobileMenuOpen]);

    if (authLoading) {
        return <AppLoader />;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Mobile Sidebar (Sheet) */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetContent side="left" className="p-0 w-[280px]">
                    <Sidebar className="flex w-full h-full border-none" />
                </SheetContent>
            </Sheet>

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {!isChatPage && (
                    <Header
                        onMobileMenuToggle={() => setMobileMenuOpen(true)}
                    />
                )}
                <div className="flex-1 overflow-y-auto relative flex flex-col">
                    {children}
                </div>
            </main>
        </div>
    );
}

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ResourceNameProvider>
            <LayoutProvider>
                <ProtectedLayoutContent>{children}</ProtectedLayoutContent>
            </LayoutProvider>
        </ResourceNameProvider>
    );
}
