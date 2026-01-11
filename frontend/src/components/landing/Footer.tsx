import Link from "next/link"
import Image from "next/image"
import { Github, Linkedin } from "lucide-react"

export function Footer() {
    return (
        <footer className="border-t bg-muted/20">
            <div className="container px-4 md:px-6 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-4 group">
                            <div className="flex-shrink-0 transition-transform group-hover:scale-110">
                                <Image src="/logo.png" alt="SerenAI Logo" width={32} height={32} className="object-contain" />
                            </div>
                            <span className="font-bold text-xl">SerenAI</span>
                        </Link>
                        <p className="text-muted-foreground mb-6 max-w-xs">
                            An open-source conversational AI platform. Empowering developers to build secure and scalable RAG applications.
                        </p>
                        <div className="flex gap-4">
                            <Link href="https://github.com/S-k-Srivastava" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                <Github className="w-5 h-5" />
                                <span className="sr-only">GitHub</span>
                            </Link>
                            <Link href="https://www.linkedin.com/in/sksrivastava2002/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                <Linkedin className="w-5 h-5" />
                                <span className="sr-only">LinkedIn</span>
                            </Link>
                            <Link href="https://www.sksrivastava.in/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                <span className="font-semibold text-sm">Portfolio</span>
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Project</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="https://github.com/S-k-Srivastava/SerenAI/blob/master/docs/content.md" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Documentation</Link></li>
                            <li><Link href="https://github.com/S-k-Srivastava/SerenAI" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Source Code</Link></li>
                            <li><Link href="https://github.com/S-k-Srivastava/SerenAI/issues" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Report Issue</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><span className="text-muted-foreground cursor-default">MIT License</span></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} SerenAI. Open Source Software.</p>
                    <div className="flex gap-8">
                        <span>
                            Made with ❤️ by <Link href="https://www.sksrivastava.in/" target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline transition-colors">Saurav</Link>
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
