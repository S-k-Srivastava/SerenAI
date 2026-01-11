'use client';

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { 
    ArrowRight, 
    Sparkles, 
    Bot, 
    FileText, 
    Zap, 
    Shield, 
    Github,
    Cpu,
    CheckCircle2
} from "lucide-react"

export function Hero() {
    return (
        <>
            {/* Main Hero Section - Full Viewport with Header Offset */}
            <section className="relative min-h-[calc(100vh-56px)] md:min-h-[calc(100vh-64px)] flex items-center overflow-hidden">
                {/* Ambient Background Elements */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] opacity-60 animate-pulse-glow" />
                    <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-40 animate-pulse-glow" style={{ animationDelay: '2s' }} />
                </div>

                <div className="container px-4 md:px-6 relative z-10 pt-28 pb-12 md:pt-36 md:pb-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        
                        {/* Left Column: Content */}
                        <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 max-w-4xl lg:max-w-2xl mx-auto lg:mx-0">
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="inline-flex items-center w-fit rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-primary shadow-sm hover:scale-105 transition-transform cursor-default"
                            >
                                <Sparkles className="mr-2 h-4 w-4 text-primary" />
                                <span>Open Source RAG Platform</span>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[4.5rem] font-extrabold tracking-tight leading-[1.1]">
                                    <span className="block text-foreground">
                                        Your Knowledge.
                                    </span>
                                    <span className="block text-primary">
                                        Your AI.
                                    </span>
                                    <span className="block text-foreground/80">
                                        Your Rules.
                                    </span>
                                </h1>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="space-y-6"
                            >
                                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
                                    The privacy-first Open Source RAG platform that turns your data into intelligent, self-hosted chatbots. No API limits, no data leaks.
                                </p>
                                <div className="flex flex-col items-center lg:items-start gap-4">
                                    <p className="text-base md:text-lg font-semibold text-primary/90 flex items-center gap-2">
                                        <span className="hidden md:block w-8 h-[1px] bg-primary/30" />
                                        Created by Saurav Kumar Srivastava
                                    </p>
                                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 text-sm font-medium text-muted-foreground/80">
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-primary" />
                                            <span>Private</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Cpu className="w-4 h-4 text-primary" />
                                            <span>Self-Hosted</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-primary" />
                                            <span>MIT</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-4 w-full sm:w-auto"
                            >
                                <Link href="/auth/register" className="w-full sm:w-auto">
                                    <Button size="xl" className="w-full sm:w-auto gap-2 group px-8">
                                        <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                        Launch Your AI
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                                <Link href="https://github.com/S-k-Srivastava/SerenAI" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                                    <Button variant="outline" size="xl" className="w-full sm:w-auto gap-2 group border-2 px-8">
                                        <Github className="w-5 h-5" />
                                        Star on GitHub
                                    </Button>
                                </Link>
                            </motion.div>
                        </div>

                        {/* Right Column / Mobile Bottom: Visual Showcase */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="relative w-full max-w-[520px] mx-auto lg:max-w-none"
                        >
                            <div className="relative w-full max-w-[480px] mx-auto lg:ml-auto lg:mr-0">
                                {/* Main Frame / Chat Interface Mockup */}
                                <div className="bg-[#0f172a] rounded-[2rem] border-[6px] md:border-8 border-border/50 shadow-2xl overflow-hidden aspect-[4/3] relative z-20">
                                    <div className="h-full flex flex-col p-4 md:p-6 space-y-4">
                                        <div className="flex items-center justify-between border-b border-border/10 pb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                                    <Bot className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                                                </div>
                                                <span className="text-xs md:text-sm font-bold text-white">SerenAI Assistant</span>
                                            </div>
                                            <div className="flex gap-1.5">
                                                <div className="w-2 h-2 rounded-full bg-red-500/30" />
                                                <div className="w-2 h-2 rounded-full bg-yellow-500/30" />
                                                <div className="w-2 h-2 rounded-full bg-green-500/30" />
                                            </div>
                                        </div>
                                        
                                        <div className="flex-1 space-y-4 pt-4">
                                            <div className="bg-muted/10 rounded-xl p-3 max-w-[85%] text-[12px] md:text-[13px] text-white/70">
                                                How secure is my data on SerenAI?
                                            </div>
                                            <div className="bg-primary/20 self-end ml-auto rounded-xl p-3 max-w-[85%] text-[12px] md:text-[13px] text-primary-foreground border border-primary/30">
                                                Your data stays local. We support local LLMs via Ollama for 100% privacy.
                                            </div>
                                        </div>

                                        <div className="mt-auto h-10 md:h-12 bg-muted/5 rounded-full border border-border/10 flex items-center px-4">
                                            <div className="h-1 w-10 md:w-12 bg-primary/30 rounded-full animate-pulse" />
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Elements - Hidden on very small screens, responsive on larger */}
                                <motion.div 
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute -top-4 -right-4 md:-top-6 md:-right-10 bg-card/90 backdrop-blur-md border border-border p-3 md:p-4 rounded-xl shadow-xl w-40 md:w-56 z-30"
                                >
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-success/10 flex items-center justify-center">
                                            <Shield className="w-3 h-3 md:w-4 md:h-4 text-success" />
                                        </div>
                                        <p className="text-[10px] md:text-xs font-bold">Encrypted & Local</p>
                                    </div>
                                </motion.div>

                                <motion.div 
                                    animate={{ y: [0, 10, 0] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                    className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-10 bg-card/90 backdrop-blur-md border border-border p-3 md:p-4 rounded-xl shadow-xl w-48 md:w-64 z-30"
                                >
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <FileText className="w-3 h-3 md:w-4 md:h-4 text-primary" />
                                        </div>
                                        <p className="text-[10px] md:text-xs font-bold">124 Documents Indexed</p>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/30"
                >
                    <motion.div 
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-5 h-8 border-2 border-current rounded-full flex justify-center p-1"
                    >
                        <div className="w-1 h-1 bg-current rounded-full" />
                    </motion.div>
                </motion.div>
            </section>

            {/* Features Details - After Scrolling */}
            <section className="py-24 bg-muted/5 border-t border-border/50">
                <div className="container px-4 md:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="group p-8 rounded-3xl bg-card border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Bot className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Custom AI Personalities</h3>
                            <p className="text-muted-foreground leading-relaxed text-sm">
                                Fine-tune system prompts, temperature, and token limits for every individual chatbot. Create agents with unique voices.
                            </p>
                        </div>
                        
                        <div className="group p-8 rounded-3xl bg-card border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Cpu className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Provider Agnostic</h3>
                            <p className="text-muted-foreground leading-relaxed text-sm">
                                Switch between OpenAI or stay local with Ollama. Your choice of intelligence, your choice of privacy and cost.
                            </p>
                        </div>

                        <div className="group p-8 rounded-3xl bg-card border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Shield className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Enterprise RBAC</h3>
                            <p className="text-muted-foreground leading-relaxed text-sm">
                                Sophisticated role-based access control with 50+ granular permissions. Control who creates, index, and views data.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
