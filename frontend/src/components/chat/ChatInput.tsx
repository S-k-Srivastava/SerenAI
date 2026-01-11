import React, { useState, useRef, useEffect } from "react"
import { Send, Sparkles, Paperclip, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { IResolvedTheme } from "@/types/chatbot"

interface ChatInputProps {
    onSend: (message: string) => void
    loading?: boolean
    chatbot: {
        theme: IResolvedTheme
        // We can just use the full theme or pick parts. 
        // But since we are passing the whole chatbot object usually, 
        // let's define what we need or use the common type.
        // For now, mirroring ChatInterface usage.
    }
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, loading, chatbot }) => {
    const [input, setInput] = useState("")
    const textareaRef = useRef<HTMLTextAreaElement>(null)

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

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!input.trim() || loading) return
        onSend(input)
        setInput("")
        // Reset textarea height after sending
        if (textareaRef.current) {
            textareaRef.current.style.height = '44px'
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = '44px'
            const scrollHeight = textareaRef.current.scrollHeight
            textareaRef.current.style.height = Math.min(scrollHeight, 200) + 'px'
        }
    }, [input])

    return (
        <div
            className="w-full px-4 pb-2 pt-2 z-20 shrink-0"
            style={{
                backgroundColor: chatbot.theme.footer_bg_color
            }}
        >
            <div className="max-w-3xl mx-auto space-y-3">
                {/* Floating Input Container */}
                <div
                    className={cn(
                        "relative flex flex-col gap-2 p-2",
                        "backdrop-blur-xl transition-all duration-300 ease-out",
                        getShadowClass(chatbot.theme.shadow_intensity)
                    )}
                    style={{
                        borderRadius: chatbot.theme.input_radius,
                        backgroundColor: chatbot.theme.text_field_color,
                        borderColor: chatbot.theme.footer_bg_color
                    }}
                >
                    <div className="flex items-end gap-2 px-2">
                        {/* Attach Button */}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost-premium"
                                        size="icon"
                                        className="h-9 w-9 mb-1 shrink-0 rounded-full"
                                    >
                                        <Paperclip className="w-5 h-5" style={{ color: chatbot.theme.text_field_icon_color }} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Attach file</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        {/* Textarea */}
                        <Textarea
                            ref={textareaRef}
                            className={cn(
                                "min-h-[44px] max-h-[200px] w-full",
                                "border-none shadow-none",
                                "focus-visible:ring-0 resize-none",
                                "py-3 px-2 text-[15px] leading-relaxed",
                                "themed-placeholder"
                            )}
                            style={{
                                backgroundColor: chatbot.theme.text_field_color,
                                color: chatbot.theme.text_field_foreground,
                                '--placeholder-color': chatbot.theme.input_placeholder_color,
                            } as React.CSSProperties}
                            placeholder="Message..."
                            rows={1}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={loading}
                        />

                        {/* Right Actions */}
                        <div className="flex items-center gap-1 mb-1">
                            {!input.trim() && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost-premium"
                                                size="icon"
                                                className="h-9 w-9 shrink-0 rounded-full"
                                            >
                                                <Mic className="w-5 h-5" style={{ color: chatbot.theme.text_field_icon_color }} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Voice input</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}

                            {/* Send Button */}
                            <Button
                                className={cn(
                                    "h-9 w-9 rounded-full shrink-0 transition-all duration-300 hover:scale-105 active:scale-95",
                                    getShadowClass(chatbot.theme.shadow_intensity),
                                    !input.trim() && "cursor-not-allowed opacity-50"
                                )}
                            style={{
                                backgroundColor: chatbot.theme.send_btn_color,
                                color: chatbot.theme.send_btn_icon_color,
                                opacity: input.trim() ? 1 : 0.5
                            }}
                                size="icon"
                                onClick={() => handleSubmit()}
                                disabled={loading || !input.trim()}
                            >
                                {loading && input.trim() ? (
                                    <Sparkles className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Send className={cn("w-4 h-4", input.trim() && "ml-0.5")} />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Footer / Disclaimer */}
                <div className="flex items-center justify-center gap-2 animate-fade-in text-center px-4">
                    <p
                        className="text-[10px] opacity-50 max-w-lg truncate"
                        style={{ color: chatbot.theme.footer_text_color }}
                    >
                        AI can make mistakes. Consider checking important information.
                    </p>
                </div>
            </div>
        </div>
    )
}
