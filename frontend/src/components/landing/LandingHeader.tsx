'use client';

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, LayoutDashboard, LogOut, Github } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/layout/ThemeToggle"

export function LandingHeader() {
    const { user, logout } = useAuth();
    const [open, setOpen] = React.useState(false);

    return (
        <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
            <div className="container px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="flex-shrink-0 transition-transform group-hover:scale-110">
                        <Image
                            src="/logo.png"
                            alt="SerenAI Logo"
                            width={40}
                            height={40}
                            priority
                            className="object-contain"
                        />
                    </div>
                    <span className="font-bold text-xl tracking-tight">SerenAI</span>
                </Link>

                <nav className="hidden lg:flex gap-4 xl:gap-6 items-center">
                    <Link href="https://github.com/S-k-Srivastava/SerenAI#%EF%B8%8F-features" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</Link>
                    <Link href="https://github.com/S-k-Srivastava/SerenAI/blob/master/docs/content.md" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Docs</Link>
                    <Link href="https://github.com/S-k-Srivastava/SerenAI/blob/master/README.md" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</Link>
                    <Link href="https://github.com/S-k-Srivastava/SerenAI" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                        <Github className="w-5 h-5" />
                        <span className="text-sm font-medium">Star on GitHub</span>
                    </Link>
                    <div className="h-4 w-[1px] bg-border mx-1 xl:mx-2"></div>

                    {user ? (
                        <>
                            <Link href="/dashboard">
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <LayoutDashboard className="w-4 h-4" />
                                    Dashboard
                                </Button>
                            </Link>
                            <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-destructive">
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link href="/auth/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Login</Link>
                            <Link href="/auth/register">
                                <Button size="sm">Get Started</Button>
                            </Link>
                        </>
                    )}
                    <div className="h-4 w-[1px] bg-border mx-2"></div>
                    <ThemeToggle />
                </nav>

                {/* Mobile Menu */}
                <div className="lg:hidden">
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost-premium" size="icon">
                                <Menu className="w-5 h-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                            <SheetHeader className="text-left px-4">
                                <SheetTitle className="flex items-center gap-2">
                                    <Image
                                        src="/logo.png"
                                        alt="SerenAI Logo"
                                        width={30}
                                        height={30}
                                        className="object-contain"
                                    />
                                    SerenAI
                                </SheetTitle>
                            </SheetHeader>
                            <nav className="flex flex-col gap-4 mt-8 px-4">
                                <Link href="https://github.com/S-k-Srivastava/SerenAI#%EF%B8%8F-features" target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className="text-lg font-medium text-foreground/80 hover:text-primary transition-colors">
                                    Features
                                </Link>
                                <Link href="https://github.com/S-k-Srivastava/SerenAI/blob/master/docs/content.md" target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className="text-lg font-medium text-foreground/80 hover:text-primary transition-colors">
                                    Docs
                                </Link>
                                <Link href="https://github.com/S-k-Srivastava/SerenAI/blob/master/README.md" target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className="text-lg font-medium text-foreground/80 hover:text-primary transition-colors">
                                    About
                                </Link>
                                <Link href="https://github.com/S-k-Srivastava/SerenAI" target="_blank" rel="noopener noreferrer" className="text-lg font-medium text-foreground/80 hover:text-primary transition-colors flex items-center gap-2">
                                    <Github className="w-5 h-5" />
                                    GitHub
                                </Link>
                                <div className="h-[1px] bg-border my-2"></div>
                                {user ? (
                                    <>
                                        <Link href="/dashboard" onClick={() => setOpen(false)} className="w-full">
                                            <Button className="w-full justify-start gap-2" variant="outline">
                                                <LayoutDashboard className="w-4 h-4" />
                                                Dashboard
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            onClick={() => {
                                                logout();
                                                setOpen(false);
                                            }}
                                            className="w-full justify-start text-muted-foreground hover:text-destructive gap-2"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Logout
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/auth/login" onClick={() => setOpen(false)} className="text-lg font-medium text-foreground/80 hover:text-primary transition-colors">
                                            Login
                                        </Link>
                                        <Link href="/auth/register" onClick={() => setOpen(false)} className="w-full">
                                            <Button className="w-full">
                                                Get Started
                                            </Button>
                                        </Link>
                                    </>
                                )}
                                <div className="h-[1px] bg-border my-2"></div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Theme</span>
                                    <ThemeToggle />
                                </div>
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
}
