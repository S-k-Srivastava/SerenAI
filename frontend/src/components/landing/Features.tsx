import Link from "next/link"
import {
    ShieldCheck,
    PieChart,
    Globe,
    Users,
    FileText,
    Share2
} from "lucide-react"

const features = [
    {
        icon: Users,
        title: "Admin RBAC",
        description: "Granular Role-Based Access Control with 50+ permissions. Securely manage users, roles, and platform-wide resources.",
    },
    {
        icon: PieChart,
        title: "AI Usage Insights",
        description: "Detailed tracking of token consumption, document indexing costs, and user engagement across the platform.",
    },
    {
        icon: Globe,
        title: "Self-Hosted RAG",
        description: "Privacy-first architecture. Host your documents and LLMs locally with Ollama for complete data sovereignty.",
    },
    {
        icon: Share2,
        title: "Public & Shared Bots",
        description: "Create public chatbots for anyone to use, or share privately with specific users via built-in sharing logic.",
    },
    {
        icon: FileText,
        title: "Smart Indexing",
        description: "Automated chunking and indexing for PDF, DOCX, and TXT files. Semantic search for context-aware AI responses.",
    },
    {
        icon: ShieldCheck,
        title: "Advanced Customization",
        description: "Fine-tune 32+ chatbot-specific theme colors, layout options, system prompts, and individual LLM parameters.",
    },
]

export function Features() {

    return (
        <section id="features" className="py-24 md:py-32 bg-muted/30 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/2 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
            </div>

            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center text-center space-y-4 mb-20">
                    <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-4">
                        Powerful Features
                    </div>
                    <h2 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                            Everything You Need
                        </span>
                    </h2>
                    <p className="max-w-[800px] text-lg md:text-xl text-muted-foreground">
                        Enterprise-grade features to build, deploy, and scale intelligent AI chatbots
                        that understand your business.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {features.map((feature, idx) => (
                        <div key={idx} className="group relative">
                            {/* Gradient glow on hover */}
                            <div className={`absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-500`}></div>

                            {/* Card */}
                            <div className="relative bg-card border border-border rounded-2xl p-8 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
                                {/* Icon */}
                                <div className={`w-14 h-14 rounded-xl bg-primary/10 p-[2px] mb-5 group-hover:scale-110 transition-transform duration-300`}>
                                    <div className="w-full h-full bg-card rounded-[10px] flex items-center justify-center">
                                        <feature.icon className="w-6 h-6 text-primary group-hover:text-primary-light transition-colors duration-300" />
                                    </div>
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors duration-300">
                                    {feature.title}
                                </h3>
                                <p className="text-muted-foreground leading-relaxed flex-grow">
                                    {feature.description}
                                </p>

                                {/* Hover arrow */}
                                <Link href="https://github.com/S-k-Srivastava/SerenAI#%EF%B8%8F-features" target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <span className="text-sm font-medium">Learn more</span>
                                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
