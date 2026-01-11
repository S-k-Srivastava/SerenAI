'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ResourceNameContextType {
    resourceName: string | null;
    setResourceName: (name: string | null) => void;
}

const ResourceNameContext = createContext<ResourceNameContextType | undefined>(undefined);

export function ResourceNameProvider({ children }: { children: ReactNode }) {
    const [resourceName, setResourceName] = useState<string | null>(null);

    return (
        <ResourceNameContext.Provider value={{ resourceName, setResourceName }}>
            {children}
        </ResourceNameContext.Provider>
    );
}

export function useResourceName() {
    const context = useContext(ResourceNameContext);
    if (context === undefined) {
        throw new Error('useResourceName must be used within a ResourceNameProvider');
    }
    return context;
}
