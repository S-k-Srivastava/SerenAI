"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface PremiumLoaderProps {
    className?: string;
    size?: "sm" | "md" | "lg" | "xl";
    color?: string;
    text?: string;
}

export function PremiumLoader({
    className,
    size = "md",
    color,
    text
}: PremiumLoaderProps) {
    const getSize = (s: string) => {
        switch (s) {
            case "sm": return { container: 24, ring: 20, center: 6 };
            case "md": return { container: 40, ring: 32, center: 10 };
            case "lg": return { container: 64, ring: 52, center: 16 };
            case "xl": return { container: 96, ring: 80, center: 24 };
            default: return { container: 40, ring: 32, center: 10 };
        }
    };

    const dims = getSize(size);
    const borderColor = color || "var(--primary)";

    return (
        <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
            <div 
                className="relative flex items-center justify-center"
                style={{ width: dims.container, height: dims.container }}
            >
                {/* Outer halo */}
                <motion.div
                    className="absolute inset-0 border-2 border-transparent rounded-full"
                    style={{ 
                        borderTopColor: borderColor,
                        borderRightColor: borderColor,
                        opacity: 0.8
                    }}
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
                
                {/* Inner pulsing core */}
                <motion.div
                    className="rounded-full"
                    style={{ 
                        width: dims.center, 
                        height: dims.center,
                        backgroundColor: borderColor,
                        boxShadow: `0 0 15px ${borderColor}`
                    }}
                    animate={{
                        scale: [1, 1.4, 1],
                        opacity: [0.6, 1, 0.6]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                {/* Decorative drifting particles (only for lg/xl) */}
                {(size === "lg" || size === "xl") && (
                    <div className="absolute inset-0 pointer-events-none">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="absolute rounded-full"
                                style={{ 
                                    width: 4, 
                                    height: 4, 
                                    backgroundColor: borderColor,
                                    top: "50%",
                                    left: "50%"
                                }}
                                animate={{
                                    x: [0, (i - 1) * 30, 0],
                                    y: [0, (i - 1) * -30, 0],
                                    scale: [0, 1, 0],
                                    opacity: [0, 0.5, 0]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: i * 0.4,
                                    ease: "circOut"
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
            
            {text && (
                <motion.p 
                    className="text-sm font-medium tracking-wide text-muted-foreground"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    {text}
                </motion.p>
            )}
        </div>
    );
}
