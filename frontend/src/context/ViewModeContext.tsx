'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type ViewMode = 'grid' | 'table';

interface ViewModeContextType {
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    toggleViewMode: () => void;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
    const [viewMode, setViewModeState] = useState<ViewMode>(() => {
        if (typeof window !== 'undefined') {
            const savedMode = localStorage.getItem('viewMode') as ViewMode;
            if (savedMode && (savedMode === 'grid' || savedMode === 'table')) {
                return savedMode;
            }
        }
        return 'grid';
    });

    useEffect(() => {
        // No longer needed to set state here as it is initialized from localStorage
    }, []);

    const setViewMode = (mode: ViewMode) => {
        setViewModeState(mode);
        localStorage.setItem('viewMode', mode);
    };

    const toggleViewMode = () => {
        const newMode = viewMode === 'grid' ? 'table' : 'grid';
        setViewMode(newMode);
    };

    return (
        <ViewModeContext.Provider value={{ viewMode, setViewMode, toggleViewMode }}>
            {children}
        </ViewModeContext.Provider>
    );
}

export function useViewMode() {
    const context = useContext(ViewModeContext);
    if (context === undefined) {
        throw new Error('useViewMode must be used within a ViewModeProvider');
    }
    return context;
}
