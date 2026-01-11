import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { User, FileText, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SourceViewerModal } from "./SourceViewerModal"
import { toast } from "sonner"
import Image from "next/image"
import { IResolvedTheme } from "@/types/chatbot"

export interface Message {
    role: 'user' | 'assistant' | 'system'
    content: string
    sources?: { content: string; metadata: Record<string, unknown> }[]
    timestamp?: string
}

interface ChatMessageProps {
    message: Message
    searchQuery?: string
    isHighlighted?: boolean
    chatbot: {
        name: string
        theme: IResolvedTheme
        logo?: string
    }
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, searchQuery, isHighlighted, chatbot }) => {
    const isUser = message.role === 'user'
    const [showSources, setShowSources] = useState(false)
    const [copied, setCopied] = useState(false)

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

    const bubbleRadius = chatbot.theme.msg_bubble_radius ?? 12;

    const renderContent = () => {
        if (!searchQuery || !searchQuery.trim()) return message.content;

        const parts = message.content.split(new RegExp(`(${searchQuery})`, 'gi'));
        return parts.map((part, i) =>
            part.toLowerCase() === searchQuery.toLowerCase() ? (
                <mark
                    key={i}
                    className={cn(
                        "rounded px-1 py-0.5 font-semibold transition-all duration-200",
                        isHighlighted ? "animate-pulse" : ""
                    )}
                    style={{
                        backgroundColor: chatbot.theme.search_highlight_color,
                        color: isHighlighted
                            ? chatbot.theme.header_text_color
                            : 'inherit'
                    }}
                >
                    {part}
                </mark>
            ) : part
        );
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(message.content);
            setCopied(true);
            toast.success("Message copied to clipboard");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Failed to copy message");
        }
    };

    const formatTime = (dateString?: string) => {
        if (!dateString) return "";
        try {
            return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return "";
        }
    };

    return (
        <div
            className={cn(
                "flex gap-4 w-full group relative mb-4",
                "animate-fade-in-up",
                isUser ? "flex-row-reverse" : ""
            )}
        >
            {/* Avatar */}
            <div className="flex-shrink-0 mt-auto mb-1">
                <div
                    className={cn(
                        "relative flex items-center justify-center rounded-2xl w-9 h-9 text-[10px] font-bold overflow-hidden",
                        "transition-all duration-300 shadow-sm border"
                    )}
                    style={isUser ? {
                        backgroundColor: chatbot.theme.user_profile_bg_color,
                        color: chatbot.theme.user_bubble_text_color,
                        borderColor: chatbot.theme.user_bubble_border_color
                    } : {
                        backgroundColor: chatbot.theme.ai_profile_bg_color,
                        color: chatbot.theme.ai_bubble_text_color,
                        borderColor: chatbot.theme.ai_bubble_border_color
                    }}
                >
                    {isUser ? (
                        <User className="w-5 h-5" />
                    ) : chatbot.logo ? (
                        <Image
                            src={chatbot.logo}
                            alt="AI"
                            fill
                            className="object-contain p-1"
                        />
                    ) : (
                        <div className="relative w-full h-full p-1">
                            <Image
                                src="/logo.png"
                                alt="AI"
                                fill
                                className="object-contain p-2"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Message Content Area */}
            <div className={cn("flex flex-col gap-1 min-w-0 max-w-[85%] lg:max-w-[75%]", isUser ? "items-end" : "items-start")}>
                {/* Header (Name & Sources) */}
                <div className="flex items-center gap-2 px-1 mb-0.5">
                    {!isUser && message.sources && message.sources.length > 0 && (
                        <div
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded-full cursor-pointer hover:opacity-80 transition-colors border"
                            style={{
                                backgroundColor: chatbot.theme.ai_bubble_color,
                                borderColor: chatbot.theme.ai_bubble_border_color,
                                color: chatbot.theme.accent_color
                            }}
                            onClick={() => setShowSources(true)}
                        >
                            <FileText className="w-2.5 h-2.5" style={{ color: chatbot.theme.accent_color }} />
                            <span className="text-[9px] font-semibold" style={{ color: chatbot.theme.accent_color }}>{message.sources.length} sources</span>
                        </div>
                    )}
                </div>

                {/* Bubble */}
                <div
                    className={cn(
                        "relative px-5 py-3.5 text-[15px] leading-relaxed",
                        "transition-all duration-200",
                        getShadowClass(chatbot.theme.shadow_intensity),
                        isUser
                            ? "border"
                            : "backdrop-blur-sm border hover:border-border/80"
                    )}
                    style={{
                        backgroundColor: isUser ? chatbot.theme.user_bubble_color : chatbot.theme.ai_bubble_color,
                        color: isUser ? chatbot.theme.user_bubble_text_color : chatbot.theme.ai_bubble_text_color,
                        borderColor: isUser ? chatbot.theme.user_bubble_border_color : chatbot.theme.ai_bubble_border_color,
                        borderRadius: `${bubbleRadius}px`,
                        borderBottomRightRadius: isUser ? '2px' : `${bubbleRadius}px`,
                        borderBottomLeftRadius: !isUser ? '2px' : `${bubbleRadius}px`,
                    }}
                >
                    <div className="whitespace-pre-wrap break-words font-normal tracking-wide">
                        {renderContent()}
                    </div>
                </div>

                {/* Timestamp & Footer Outside */}
                <div className={cn(
                    "flex items-center gap-2 mt-1 px-1 select-none",
                    isUser ? "justify-end" : "justify-between w-full"
                )}>
                    <span
                        className="text-[10px] font-medium tabular-nums opacity-80"
                        style={{ color: chatbot.theme.timestamp_color }}
                    >
                        {formatTime(message.timestamp) || "Just now"}
                    </span>
                    
                    {!isUser && (
                       <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 rounded-full"
                                style={{
                                    backgroundColor: chatbot.theme.ai_bubble_color,
                                    color: chatbot.theme.accent_color
                                }}
                                onClick={() => { void copyToClipboard(); }}
                                title="Copy text"
                            >
                                {copied ? <Check className="w-2.5 h-2.5" style={{ color: chatbot.theme.success_color }} /> : <Copy className="w-2.5 h-2.5" />}
                            </Button>
                       </div> 
                    )}
                    
                    {isUser && copied && (
                        <span
                            className="text-[10px] animate-fade-in"
                            style={{ color: chatbot.theme.success_color }}
                        >
                            Copied
                        </span>
                    )}
                </div>

                {/* Source Viewer Modal */}
                {!isUser && message.sources && (
                    <SourceViewerModal
                        open={showSources}
                        onOpenChange={setShowSources}
                        sources={message.sources}
                        theme={chatbot.theme}
                    />
                )}
            </div>
        </div>
    )
}
