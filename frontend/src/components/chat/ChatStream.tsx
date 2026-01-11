import { useEffect, useRef } from "react"
import { ChatMessage, Message } from "./ChatMessage"
import { Bot, Sparkles, Zap, FileText, Code, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IResolvedTheme } from "@/types/chatbot"
import { PremiumLoader } from "@/components/ui/PremiumLoader"
import Image from "next/image"

interface ChatStreamProps {
    messages: Message[]
    loading?: boolean
    searchQuery?: string
    highlightedIndex?: number
    onPromptSelect?: (prompt: string) => void
    chatbot: {
        name: string
        theme: IResolvedTheme
        logo?: string
    }
}

const SUGGESTED_PROMPTS = [
    { label: "Summarize a document", icon: FileText, prompt: "Can you help me summarize a document?" },
    { label: "Code Assistant", icon: Code, prompt: "I need help with some code integration." },
    { label: "Brainstorm ideas", icon: Zap, prompt: "Let's brainstorm some creative ideas for a project." },
    { label: "General Chat", icon: Sparkles, prompt: "Hello! What can you help me with today?" },
]

export function ChatStream({ messages, loading, searchQuery, highlightedIndex, onPromptSelect, chatbot }: ChatStreamProps) {
    const bottomRef = useRef<HTMLDivElement>(null)
    const messageRefs = useRef<Map<number, HTMLDivElement>>(new Map())

    // Helper to map shadow intensity
    const getShadowClass = (intensity?: string) => {
        switch (intensity) {
            case 'none': return 'shadow-none';
            case 'sm': return 'shadow-sm';
            case 'md': return 'shadow-md';
            case 'lg': return 'shadow-lg';
            default: return 'shadow-sm';
        }
    };

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (highlightedIndex === undefined) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages.length, loading, highlightedIndex])

    // Scroll to highlighted search match
    useEffect(() => {
        if (highlightedIndex !== undefined) {
            const el = messageRefs.current.get(highlightedIndex);
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }
    }, [highlightedIndex])

    if (messages.length === 0 && !loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center h-full min-h-[400px]">
                <div className="max-w-2xl w-full space-y-8 animate-fade-in-up">
                    <div className="flex flex-col items-center gap-4">
                        <div
                            className={`relative flex items-center justify-center p-4 rounded-3xl overflow-hidden ${getShadowClass(chatbot.theme.shadow_intensity)}`}
                            style={{
                                backgroundColor: chatbot.theme.header_logo_bg_color,
                                borderColor: chatbot.theme.header_logo_border_color,
                                borderWidth: chatbot.theme.header_logo_border_width,
                                borderStyle: chatbot.theme.header_logo_border_width > 0 ? 'solid' : 'none',
                                width: 80,
                                height: 80
                            }}
                        >
                            {chatbot.logo ? (
                                <Image
                                    src={chatbot.logo}
                                    alt={chatbot.name}
                                    fill
                                    className="object-contain p-2"
                                />
                            ) : (
                                <Bot
                                    className="w-12 h-12"
                                    style={{ color: chatbot.theme.ai_bubble_text_color }}
                                />
                            )}
                        </div>
                        <div className="space-y-2">
                            <h3
                                className="text-3xl font-bold"
                                style={{ color: chatbot.theme.header_text_color }}
                            >
                                Welcome to {chatbot.name}
                            </h3>
                            <p
                                className="text-lg max-w-md mx-auto leading-relaxed"
                                style={{ color: chatbot.theme.welcome_text_color }}
                            >
                                Your advanced AI assistant. Ready to help you create, analyze, and explore.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg mx-auto">
                        {SUGGESTED_PROMPTS.map((item, idx) => (
                            <Button
                                key={idx}
                                variant="outline"
                                className={`h-auto p-4 flex items-start gap-4 text-left whitespace-normal transition-all duration-300 group rounded-xl ${getShadowClass(chatbot.theme.shadow_intensity)}`}
                                style={{
                                    borderColor: chatbot.theme.ai_bubble_border_color,
                                    backgroundColor: chatbot.theme.ai_bubble_color,
                                } as React.CSSProperties}
                                onClick={() => onPromptSelect?.(item.prompt)}
                            >
                                <div
                                    className="p-2 rounded-lg shrink-0 group-hover:scale-110 transition-transform"
                                    style={{
                                        backgroundColor: chatbot.theme.ai_bubble_color,
                                        color: chatbot.theme.suggested_prompt_icon_color
                                    }}
                                >
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <span
                                        className="font-semibold"
                                        style={{ color: chatbot.theme.suggested_prompt_title_color }}
                                    >
                                        {item.label}
                                    </span>
                                    <p
                                        className="text-xs opacity-80 line-clamp-2"
                                        style={{ color: chatbot.theme.suggested_prompt_desc_color }}
                                    >
                                        {item.prompt}
                                    </p>
                                </div>
                                <ArrowRight
                                    className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0"
                                    style={{ color: chatbot.theme.suggested_prompt_icon_color }}
                                />
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:px-8 xl:px-20 flex flex-col gap-6 scroll-smooth pb-32">
            {/* Date Separator (Mock) */}
            <div className="flex justify-center py-4 sticky top-0 z-10 pointer-events-none">
                <span
                    className={`text-[10px] font-medium px-3 py-1 rounded-full border ${getShadowClass(chatbot.theme.shadow_intensity)}`}
                    style={{
                        backgroundColor: chatbot.theme.header_color,
                        color: chatbot.theme.timestamp_color,
                        borderColor: chatbot.theme.header_separator_color
                    }}
                >
                    Today
                </span>
            </div>

            {messages.map((msg, idx) => (
                <div
                    key={idx}
                    ref={el => {
                        if (el) messageRefs.current.set(idx, el);
                        else messageRefs.current.delete(idx);
                    }}
                    className="w-full flex flex-col"
                >
                    <ChatMessage
                        message={msg}
                        searchQuery={searchQuery}
                        isHighlighted={highlightedIndex === idx}
                        chatbot={chatbot}
                    />
                </div>
            ))}

            {loading && (
                <div className="flex gap-4 w-full animate-fade-in pl-1">
                    <div className="flex-shrink-0 mt-1">
                        <div
                            className={`rounded-2xl w-10 h-10 flex items-center justify-center text-white text-[10px] font-bold ${getShadowClass(chatbot.theme.shadow_intensity)}`}
                            style={{
                                backgroundColor: chatbot.theme.loading_indicator_color
                            }}
                        >
                            <Sparkles className="w-4 h-4 animate-spin-slow" />
                        </div>
                    </div>
                    <div
                        className={`px-5 py-3 rounded-2xl rounded-tl-sm border flex items-center gap-3 ${getShadowClass(chatbot.theme.shadow_intensity)}`}
                        style={{
                            backgroundColor: chatbot.theme.ai_bubble_color,
                            borderColor: chatbot.theme.ai_bubble_border_color,
                            color: chatbot.theme.ai_bubble_text_color
                        }}
                    >
                        <PremiumLoader 
                            size="sm" 
                            color={chatbot.theme.loading_indicator_color} 
                        />
                        <span className="text-xs font-semibold tracking-wide opacity-80">Thinking...</span>
                    </div>
                </div>
            )}
            <div ref={bottomRef} />
        </div>
    )
}
