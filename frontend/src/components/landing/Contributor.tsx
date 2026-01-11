import Link from "next/link"
import { Github, Linkedin, ExternalLink, Code2 } from "lucide-react"

export function Contributor() {
    return (
        <section className="py-24 bg-background relative overflow-hidden">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center text-center space-y-4 mb-12 md:mb-16">
                    <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-2 md:mb-4">
                        Meet the Author
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                       Built by the Community, 
                       <span className="text-primary"> Led by One</span>
                    </h2>
                </div>

                <div className="max-w-4xl mx-auto">
                    <div className="relative group">
                        {/* Decorative Background */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary-light rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        
                        <div className="relative bg-card border border-border rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl flex flex-col md:flex-row items-center gap-8 md:gap-12">
                            {/* Author Info */}
                            <div className="flex-1 space-y-6 text-center md:text-left">
                                <div className="space-y-2">
                                    <h3 className="text-2xl md:text-3xl font-bold tracking-tight">Saurav Kumar Srivastava</h3>
                                    <p className="text-primary font-medium">AI Engineer</p>
                                </div>
                                
                                <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-2xl mx-auto md:mx-0">
                                    A passionate developer dedicated to building open-source tools that empower others. 
                                    SerenAI was created to simplify the implementation of private, 
                                    secure, and intelligent RAG systems for everyone.
                                </p>

                                <div className="flex flex-col sm:flex-row flex-wrap justify-center md:justify-start gap-4 pt-4">
                                    <Link href="https://github.com/S-k-Srivastava" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                                        <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[#181717] hover:bg-[#181717]/90 text-white rounded-xl transition-all hover:scale-105">
                                            <Github className="w-5 h-5" />
                                            <span>GitHub</span>
                                        </button>
                                    </Link>
                                    <Link href="https://www.linkedin.com/in/sksrivastava2002/" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                                        <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white rounded-xl transition-all hover:scale-105">
                                            <Linkedin className="w-5 h-5" />
                                            <span>LinkedIn</span>
                                        </button>
                                    </Link>
                                    <Link href="https://www.sksrivastava.in/" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                                        <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all hover:scale-105">
                                            <ExternalLink className="w-5 h-5" />
                                            <span>Portfolio</span>
                                        </button>
                                    </Link>
                                </div>
                            </div>

                            {/* Stats/Badge */}
                            <div className="w-full md:w-64 bg-muted/50 rounded-2xl p-6 border border-border/50 space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Code2 className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="text-sm">
                                        <p className="font-bold">Project Lead</p>
                                        <p className="text-muted-foreground text-xs">Primary Contributor</p>
                                    </div>
                                </div>
                                <div className="space-y-4 pt-2 border-t border-border/50">
                                    <div>
                                        <p className="text-2xl font-bold text-foreground">50+</p>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Features Built</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-foreground">100%</p>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Open Source</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
