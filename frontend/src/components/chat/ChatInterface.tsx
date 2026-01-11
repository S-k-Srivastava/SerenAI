"use client"

import { ChatStream } from "./ChatStream"
import { ChatInput } from "./ChatInput"
import { ChatCustomHeader } from "./ChatCustomHeader"
import { Message } from "./ChatMessage"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Search, X, ChevronUp, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { PermissionGuard } from "@/components/auth/PermissionGuard"
import { IChatBotTheme, IResolvedTheme } from "@/types/chatbot"
import { PremiumLoader } from "@/components/ui/PremiumLoader"
import { CHATBOT_THEME_PRESETS } from "@/config/chatThemePresets"
import { useTheme } from "next-themes"
import { ThemeToggle } from "@/components/layout/ThemeToggle"

interface ChatInterfaceProps {
    messages: Message[]
    onSend: (msg: string) => void
    loading?: boolean
    initialLoading?: boolean
    title?: string
    onRefresh?: () => void
    isRefreshing?: boolean
    chatbot: {
        name: string
        theme: IChatBotTheme
        logo?: string
    }
    isPublic?: boolean
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
    messages,
    onSend,
    loading,
    initialLoading,
    title,
    chatbot,
    isPublic = false
}) => {
    const { resolvedTheme } = useTheme();
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);

    // Resolve theme - use provided theme or fallback to preset[0]
    const currentTheme: IResolvedTheme = useMemo(() => {
        const t = chatbot.theme || CHATBOT_THEME_PRESETS[0].theme;
        const activeColors = resolvedTheme === 'dark' ? t.dark : t.light;

        return {
            ...activeColors,
            msg_bubble_radius: t.msg_bubble_radius,
            input_radius: t.input_radius,
            header_logo_radius: t.header_logo_radius,
            header_logo_width: t.header_logo_width,
            header_logo_height: t.header_logo_height,
            header_logo_border_width: t.header_logo_border_width,
            shadow_intensity: t.shadow_intensity,
            loading_animation_style: t.loading_animation_style,
            show_header_separator: t.show_header_separator,
        };
    }, [chatbot.theme, resolvedTheme]);

    const displayChatbot = {
        ...chatbot,
        theme: currentTheme
    };

    const matchIndices = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const indices: number[] = [];
        messages.forEach((msg, idx) => {
            if (msg.content.toLowerCase().includes(searchQuery.toLowerCase())) {
                indices.push(idx);
            }
        });
        return indices;
    }, [messages, searchQuery]);

    // Reset current match when search or messages change
    const [prevMatchLength, setPrevMatchLength] = useState(0);
    if (matchIndices.length !== prevMatchLength) {
        setPrevMatchLength(matchIndices.length);
        if (matchIndices.length > 0) {
            setCurrentMatchIndex(0);
        } else {
            setCurrentMatchIndex(-1);
        }
    }

    const navigateMatch = (direction: 'next' | 'prev') => {
        if (matchIndices.length === 0) return;
        if (direction === 'next') {
            setCurrentMatchIndex((prev) => (prev + 1) % matchIndices.length);
        } else {
            setCurrentMatchIndex((prev) => (prev - 1 + matchIndices.length) % matchIndices.length);
        }
    };

    if (initialLoading) {
        return (
            <div className="flex-1 flex items-center justify-center h-full bg-background/50 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-6">
                    <PremiumLoader
                        color={currentTheme.accent_color}
                        size="lg"
                    />
                    <p className="text-sm font-medium text-muted-foreground animate-pulse">Initializing {displayChatbot.name}...</p>
                </div>
            </div>
        )
    }

    const headerActions = (
        <div className="flex items-center gap-1">
            {showSearch ? (
                <>
                    {/* Navigation Controls - Separate component to prevent search bar resizing */}
                    {matchIndices.length > 0 && (
                        <div
                            className="flex items-center gap-0.5 px-2 py-1 rounded-md animate-in fade-in duration-200"
                            style={{
                                backgroundColor: currentTheme.text_field_color,
                                color: currentTheme.text_field_icon_color
                            }}
                        >
                            <span className="text-[10px] font-medium whitespace-nowrap">
                                {currentMatchIndex + 1}/{matchIndices.length}
                            </span>
                            <div className="flex items-center ml-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => navigateMatch('prev')}
                                    className="p-0.5 h-5 w-5 transition-colors hover:bg-transparent"
                                    style={{ color: currentTheme.text_field_icon_color }}
                                >
                                    <ChevronUp className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => navigateMatch('next')}
                                    className="p-0.5 h-5 w-5 transition-colors hover:bg-transparent"
                                    style={{ color: currentTheme.text_field_icon_color }}
                                >
                                    <ChevronDown className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Search Input - Fixed width */}
                    <div
                        className="flex items-center gap-1 pl-3 pr-1 py-0.5 animate-in fade-in slide-in-from-right-2 duration-200 border border-border/30"
                        style={{
                            backgroundColor: currentTheme.text_field_color,
                            borderRadius: currentTheme.input_radius
                        }}
                    >
                        <Search
                            className="w-4 h-4 shrink-0"
                            style={{ color: currentTheme.text_field_icon_color }}
                        />
                        <Input
                            autoFocus
                            placeholder="Find in chat..."
                            className="h-8 w-[140px] lg:w-[200px] border-none bg-transparent focus-visible:ring-0 text-xs px-2 shadow-none themed-placeholder"
                            style={{
                                color: currentTheme.text_field_foreground,
                                '--placeholder-color': currentTheme.input_placeholder_color,
                            } as React.CSSProperties}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') navigateMatch('next');
                                if (e.key === 'Escape') { setShowSearch(false); setSearchQuery(""); }
                            }}
                        />

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setShowSearch(false); setSearchQuery(""); }}
                            className="p-1.5 h-7 w-7 hover:bg-muted/20 rounded-md transition-all"
                            style={{ color: currentTheme.text_field_icon_color }}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </>
            ) : (
                <>
                    <ThemeToggle customTheme={currentTheme} />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        title="Search messages"
                        onClick={() => setShowSearch(true)}
                        style={{ color: currentTheme.header_icon_color }}
                    >
                        <Search className="w-5 h-5" />
                    </Button>
                </>
            )}

        </div>
    );

    return (
        <div
            className="flex flex-col h-full relative overflow-hidden"
            style={{
                backgroundColor: currentTheme.bg_color
            }}
        >
            <ChatCustomHeader
                chatbotName={displayChatbot.name || title || "Chat"}
                logo={displayChatbot.logo}
                headerColor={currentTheme.header_color}
                headerTextColor={currentTheme.header_text_color}
                headerIconColor={currentTheme.header_icon_color}
                headerLogoRadius={currentTheme.header_logo_radius}
                headerLogoWidth={currentTheme.header_logo_width}
                headerLogoHeight={currentTheme.header_logo_height}
                headerLogoBorderColor={currentTheme.header_logo_border_color}
                headerLogoBorderWidth={currentTheme.header_logo_border_width}
                headerLogoBgColor={currentTheme.header_logo_bg_color}
                actions={headerActions}
                showSeparator={currentTheme.show_header_separator}
                headerSeparatorColor={currentTheme.header_separator_color}
                isPublic={isPublic}
            />

            <div className="flex-1 flex flex-col min-h-0 relative z-10">
                <ChatStream
                    messages={messages}
                    loading={loading}
                    searchQuery={searchQuery}
                    highlightedIndex={currentMatchIndex !== -1 ? matchIndices[currentMatchIndex] : undefined}
                    onPromptSelect={(prompt) => onSend(prompt)}
                    chatbot={displayChatbot}
                />

                {isPublic ? (
                    <ChatInput onSend={onSend} loading={loading} chatbot={displayChatbot} />
                ) : (
                    <PermissionGuard
                        permission="update:chat:self"
                        fallback={
                            <div className="p-4 text-center text-muted-foreground text-sm border-t bg-muted/20 backdrop-blur-md">
                                You do not have permission to send messages to this chat.
                            </div>
                        }
                    >
                        <ChatInput onSend={onSend} loading={loading} chatbot={displayChatbot} />
                    </PermissionGuard>
                )}
            </div>
        </div>
    )
}
