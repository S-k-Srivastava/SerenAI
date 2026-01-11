"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { IResolvedTheme } from "@/types/chatbot"

interface ThemeToggleProps {
    customTheme?: IResolvedTheme
}

export function ThemeToggle({ customTheme }: ThemeToggleProps) {
    const { setTheme } = useTheme()

    const buttonStyle = customTheme ? {
        backgroundColor: customTheme.header_color,
        color: customTheme.header_icon_color
    } : undefined

    const dropdownStyle = customTheme ? {
        backgroundColor: customTheme.header_color,
        color: customTheme.header_text_color,
        borderColor: customTheme.header_separator_color
    } : undefined

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant={customTheme ? "ghost" : "ghost-premium"}
                    size="icon"
                    style={buttonStyle}
                >
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" style={dropdownStyle}>
                <DropdownMenuItem
                    onClick={() => setTheme("light")}
                    style={customTheme ? { color: customTheme.header_text_color } : undefined}
                >
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme("dark")}
                    style={customTheme ? { color: customTheme.header_text_color } : undefined}
                >
                    Dark
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme("system")}
                    style={customTheme ? { color: customTheme.header_text_color } : undefined}
                >
                    System
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
