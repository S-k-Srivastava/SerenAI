import React from 'react';
import { Bot, Send, User, FileText } from 'lucide-react';

interface AuthVisualSectionProps {
  title: string;
  description: string;
}

export function AuthVisualSection({
  title,
  description,
}: AuthVisualSectionProps) {
  return (
    <div className="hidden lg:flex flex-1 relative overflow-hidden bg-background items-center justify-center border-l border-border">
      {/* --- CLEAN BACKGROUND --- */}
      {/* Simple radial glow for depth, no lines */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />

      <div className="relative z-10 w-full max-w-[600px] flex flex-col items-center perspective-[2000px] group">
        
        {/* --- 3D FLOATING INTERFACE --- */}
        {/* Container with 3D perspective */}
        <div className="relative w-full aspect-[4/3] mb-12">
            
            {/* The Floating Card */}
            <div className="absolute inset-x-12 inset-y-0 rounded-2xl bg-card border border-border shadow-2xl transition-transform duration-700 ease-out transform rotate-y-[-10deg] rotate-x-[5deg] group-hover:rotate-y-[-5deg] group-hover:rotate-x-[2deg] flex flex-col overflow-hidden">
                
                {/* Window Header */}
                <div className="h-10 border-b border-border bg-muted/30 flex items-center px-4 gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 p-6 space-y-6 bg-background/50">
                    
                    {/* Message 1: Bot Intro */}
                    <div className="flex gap-4 animate-fade-in-up">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
                            <Bot className="w-4 h-4 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <div className="bg-muted px-4 py-2.5 rounded-2xl rounded-tl-sm">
                                <p className="text-sm text-foreground">Ready to help. Ask me anything about your documents.</p>
                            </div>
                        </div>
                    </div>

                    {/* Message 2: User Query */}
                    <div className="flex gap-4 flex-row-reverse animate-fade-in-up animation-delay-500">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 border border-border">
                            <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <div className="bg-primary text-primary-foreground px-4 py-2.5 rounded-2xl rounded-tr-sm shadow-sm">
                                <p className="text-sm">Summarize the key points from the HR policy.</p>
                            </div>
                        </div>
                    </div>

                    {/* Message 3: Answer with RAG Source */}
                    <div className="flex gap-4 animate-fade-in-up animation-delay-1000">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
                            <Bot className="w-4 h-4 text-primary" />
                        </div>
                        <div className="space-y-2 w-full">
                            <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-sm space-y-2">
                                <p className="text-sm text-foreground leading-relaxed">
                                    Based on the HR Policy document:
                                </p>
                                <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                                    <li>Remote work is allowed 3 days a week.</li>
                                    <li>Annual leave is 25 days plus bank holidays.</li>
                                    <li>Health insurance coverage starts from day one.</li>
                                </ul>
                                <div className="pt-2 flex gap-2">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-background border border-border text-muted-foreground">
                                        <FileText className="w-3 h-3" />
                                        HR_Policy_2024.pdf
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-border">
                    <div className="flex gap-2 items-center bg-muted/40 rounded-xl px-3 py-2 border border-border">
                        <span className="text-muted-foreground/50 text-sm pl-1">Ask a follow up...</span>
                        <div className="ml-auto p-1.5 bg-primary/10 rounded-lg">
                            <Send className="w-3.5 h-3.5 text-primary" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Elements behind */}
            <div className="absolute top-1/2 -right-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl -z-10 animate-float" />
            <div className="absolute bottom-10 -left-6 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10 animate-float animation-delay-2000" />
        </div>

        {/* --- TEXT CONTENT --- */}
        <div className="text-center space-y-6 max-w-md relative z-20 mt-8">
            <h2 className="text-4xl font-bold tracking-tight text-foreground">
                {title}
            </h2>
            <p className="text-lg text-muted-foreground">
                {description}
            </p>
        </div>
      </div>

      <style jsx>{`
        .rotate-y-[-12deg] { transform: rotateY(-12deg) rotateX(5deg); }
        .perspective-[2000px] { perspective: 2000px; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animation-delay-500 { animation-delay: 500ms; }
        .animation-delay-1000 { animation-delay: 1000ms; }
        .animation-delay-2000 { animation-delay: 2000ms; }

        .animate-fade-in-up {
            animation: fade-in-up 0.6s ease-out forwards;
            opacity: 0;
            transform: translateY(10px);
        }
        @keyframes fade-in-up {
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}