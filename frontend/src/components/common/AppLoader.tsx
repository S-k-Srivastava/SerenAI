"use client";

import React from "react";
import Image from "next/image";

/**
 * Premium full-screen application loader.
 * Displayed during the initial authentication check (hard refresh).
 */
export function AppLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 animate-blink-smooth">
        {/* Logo */}
        <div className="relative w-24 h-24">
            <Image 
                src="/logo.png" 
                alt="SerenAI Logo" 
                fill
                className="object-contain"
                priority
            />
        </div>
        
        {/* Brand Name */}
        <h1 className="text-3xl font-bold tracking-tight text-primary">
            SerenAI
        </h1>
      </div>

      <style jsx>{`
        @keyframes blink-smooth {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(0.98);
          }
        }
        .animate-blink-smooth {
          animation: blink-smooth 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
