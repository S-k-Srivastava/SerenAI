"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLayout } from "@/context/LayoutContext"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface ChatCustomHeaderProps {
    title?: string
    chatbotName?: string
    logo?: string
    headerColor: string
    headerTextColor: string
    headerIconColor: string
    headerLogoRadius: number
    headerLogoWidth: number
    headerLogoHeight: number
    headerLogoBorderColor: string
    headerLogoBorderWidth: number
    headerLogoBgColor: string
    showSeparator: boolean
    headerSeparatorColor: string
    actions?: React.ReactNode
    isPublic?: boolean
}

export const ChatCustomHeader: React.FC<ChatCustomHeaderProps> = ({
    title,
    chatbotName,
    logo,
    headerColor,
    headerTextColor,
    headerIconColor,
    headerLogoRadius,
    headerLogoWidth,
    headerLogoHeight,
    headerLogoBorderColor,
    headerLogoBorderWidth,
    headerLogoBgColor,
    actions,
    showSeparator,
    headerSeparatorColor,
    isPublic = false
}) => {
    const { setMobileMenuOpen } = useLayout()

    // Prioritize title over chatbotName
    const displayName = title || chatbotName || "Chat"

    return (
        <header
            className={cn(
                "min-h-[64px] py-2 flex items-center justify-between px-4 sm:px-6",
                "backdrop-blur-sm z-20 shrink-0 sticky top-0 w-full",
                showSeparator && "border-b"
            )}
            style={{
                backgroundColor: headerColor,
                borderColor: showSeparator ? headerSeparatorColor : "transparent"
            }}
        >
            <div className="flex items-center gap-3 flex-1">
                {/* Mobile menu toggle - hide for public chats */}
                {!isPublic && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden shrink-0 h-9 w-9"
                        onClick={() => setMobileMenuOpen(true)}
                        style={{ color: headerIconColor }}
                    >
                        <Menu className="w-5 h-5" />
                    </Button>
                )}

                {/* Avatar + Title */}
                <div className="flex items-center gap-3 min-w-0">
                    <div
                        className={cn(
                            "relative flex items-center justify-center overflow-hidden",
                            "transition-all duration-300"
                        )}
                        style={{
                            width: headerLogoWidth,
                            height: Math.min(headerLogoHeight, 128),
                            borderRadius: headerLogoRadius,
                            backgroundColor: headerLogoBgColor,
                            borderColor: headerLogoBorderColor,
                            borderWidth: headerLogoBorderWidth,
                            borderStyle: headerLogoBorderWidth > 0 ? 'solid' : 'none'
                        }}
                    >
                        {logo ? (
                            <Image
                                src={logo}
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

                    {/* Title */}
                    <h1
                        className="text-sm sm:text-base font-semibold tracking-tight truncate"
                        style={{ color: headerTextColor }}
                    >
                        {displayName}
                    </h1>
                </div>
            </div>

            {/* Right section: Actions */}
            <div className="flex items-center gap-2 shrink-0 ml-4">
                {actions && <div className="flex items-center gap-1">{actions}</div>}
            </div>
        </header>
    )
}
