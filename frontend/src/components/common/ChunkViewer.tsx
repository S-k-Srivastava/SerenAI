"use client"

import React, { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Info, Search } from "lucide-react"
import { Chunk, getChunkStatistics } from "@/lib/utils/semanticChunker"
import { cn } from "@/lib/utils"

interface ChunkViewerProps {
    chunks: Chunk[]
    mode: 'create' | 'edit' | 'view'
    searchQuery?: string
    onSearchChange?: (value: string) => void
}

export function ChunkViewer({ chunks, mode, searchQuery = '', onSearchChange }: ChunkViewerProps) {
    const chunkRefs = useRef<Record<string, HTMLDivElement | null>>({})
    const stats = getChunkStatistics(chunks)
    const isViewMode = mode === 'view'

    // Filter chunks based on search query
    const filteredChunks = searchQuery
        ? chunks.filter(chunk =>
            chunk.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : chunks

    // Highlight search text in content
    const highlightText = (text: string, query: string) => {
        if (!query) return text
        const parts = text.split(new RegExp(`(${query})`, 'gi'))
        return parts.map((part, i) =>
            part.toLowerCase() === query.toLowerCase()
                ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-900/50 rounded px-0.5">{part}</mark>
                : part
        )
    }

    // Auto-scroll to first matching chunk when search query changes
    useEffect(() => {
        if (searchQuery && filteredChunks.length > 0) {
            const firstChunkId = filteredChunks[0].id
            const element = chunkRefs.current[firstChunkId]
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
        }
    }, [searchQuery, filteredChunks])

    if (chunks.length === 0) {
        return null
    }

    return (
        <div className="space-y-5">
            {isViewMode && onSearchChange && (
                <div className="flex items-center justify-between gap-4 pb-3 border-b">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">Search Results</span>
                            {searchQuery && (
                                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                                    {filteredChunks.length} of {chunks.length}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search in chunks..."
                            className="pl-10 h-10 bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-colors text-sm"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                </div>
            )}

            <div className="p-4 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-muted/40 shadow-sm">
                <div className="grid grid-cols-3 gap-6 text-center">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Chunks</p>
                        <p className="text-2xl font-bold text-primary">{stats.totalChunks}</p>
                    </div>
                    <div className="space-y-1 border-x border-muted/30">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg Words</p>
                        <p className="text-2xl font-bold text-primary">{stats.avgWordsPerChunk}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Words</p>
                        <p className="text-2xl font-bold text-primary">{stats.totalWords}</p>
                    </div>
                </div>
            </div>

            {isViewMode ? (
                // View mode: Full page scroll, no nested ScrollArea
                <div className="w-full rounded-lg border bg-muted/5 p-4 space-y-3">
                    {filteredChunks.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>No chunks found matching &quot;{searchQuery}&quot;</p>
                        </div>
                    ) : (
                        filteredChunks.map((chunk) => (
                            <Card
                                key={chunk.id}
                                ref={(el) => {
                                    chunkRefs.current[chunk.id] = el
                                }}
                                className={cn(
                                    "border-muted/40 bg-background/50 hover:bg-accent/5 transition-colors",
                                    searchQuery && chunk.content.toLowerCase().includes(searchQuery.toLowerCase()) && "ring-2 ring-primary/20"
                                )}
                            >
                                <CardHeader className="pb-3 pt-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                                {chunk.index}
                                            </div>
                                            <CardTitle className="text-sm font-medium">
                                                Chunk {chunk.index}
                                            </CardTitle>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>{chunk.metadata.wordCount} words</span>
                                            <span>•</span>
                                            <span>{chunk.metadata.characterCount} chars</span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0 pb-3">
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {highlightText(chunk.content, searchQuery)}
                                    </p>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            ) : (
                // Create/Edit mode: Fixed height with ScrollArea
                <ScrollArea className="h-[400px] w-full rounded-lg border bg-muted/5">
                    <div className="p-4 space-y-3">
                        {chunks.map((chunk) => (
                            <Card key={chunk.id} className="border-muted/40 bg-background/50 hover:bg-accent/5 transition-colors">
                                <CardHeader className="pb-3 pt-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                                {chunk.index}
                                            </div>
                                            <CardTitle className="text-sm font-medium">
                                                Chunk {chunk.index}
                                            </CardTitle>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>{chunk.metadata.wordCount} words</span>
                                            <span>•</span>
                                            <span>{chunk.metadata.characterCount} chars</span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0 pb-3">
                                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                                        {chunk.content}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </ScrollArea>
            )}

            {mode === 'create' && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 ml-1">
                    <Info className="w-3.5 h-3.5" />
                    These chunks will be indexed for semantic search and RAG retrieval.
                </p>
            )}
        </div>
    )
}
