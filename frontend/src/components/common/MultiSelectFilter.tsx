"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle, Check, Search, X, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export interface MultiSelectFilterProps {
    /**
     * Available options to select from
     */
    options: string[]

    /**
     * Currently selected values
     */
    selectedValues: string[]

    /**
     * Callback when selection changes
     */
    onSelectionChange: (values: string[]) => void

    /**
     * Placeholder text for the trigger button
     */
    placeholder?: string

    /**
     * Placeholder text for the search input
     */
    searchPlaceholder?: string

    /**
     * Whether to allow multiple selections (default: true)
     */
    multiSelect?: boolean

    /**
     * Custom width for the trigger button
     */
    width?: string

    /**
     * Message to show when no options are found
     */
    emptyMessage?: string

    /**
     * Whether the popover is open (controlled)
     */
    open?: boolean

    /**
     * Callback when popover open state changes (controlled)
     */
    onOpenChange?: (open: boolean) => void

    /**
     * Allow creating new options
     */
    allowCreate?: boolean

    /**
     * Callback when a new option is created
     */
    onCreateOption?: (option: string) => void

    /**
     * Show selected values as badges below the trigger
     */
    showSelectedBadges?: boolean

    /**
     * Callback when a selected badge is removed
     */
    onRemoveBadge?: (value: string) => void
}

export function MultiSelectFilter({
    options,
    selectedValues,
    onSelectionChange,
    placeholder = "Filter...",
    searchPlaceholder = "Search...",
    multiSelect = true,
    width = "w-[200px]",
    emptyMessage = "No options found.",
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
    allowCreate = false,
    onCreateOption,
    showSelectedBadges = false,
    onRemoveBadge,
}: MultiSelectFilterProps) {
    const [internalOpen, setInternalOpen] = React.useState(false)
    const [searchTerm, setSearchTerm] = React.useState("")

    // Use controlled or uncontrolled state
    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : internalOpen
    const setOpen = isControlled ? (controlledOnOpenChange || (() => {})) : setInternalOpen

    // Filter options based on search
    const filteredOptions = React.useMemo(() => {
        if (!searchTerm) return options
        return options.filter((option) =>
            option.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [options, searchTerm])

    const handleSelect = (value: string) => {
        if (multiSelect) {
            const isSelected = selectedValues.includes(value)
            const newValues = isSelected
                ? selectedValues.filter((v) => v !== value)
                : [...selectedValues, value]
            onSelectionChange(newValues)
        } else {
            // Single select mode - close popover after selection
            onSelectionChange([value])
            setOpen(false)
            setSearchTerm("")
        }
    }

    const handleCreate = () => {
        const trimmed = searchTerm.trim()
        if (!trimmed || options.includes(trimmed)) return

        if (onCreateOption) {
            onCreateOption(trimmed)
        }

        // Add to selected values
        const newValues = multiSelect
            ? [...selectedValues, trimmed]
            : [trimmed]
        onSelectionChange(newValues)
        setSearchTerm("")

        if (!multiSelect) {
            setOpen(false)
        }
    }

    const handleRemove = (value: string) => {
        const newValues = selectedValues.filter((v) => v !== value)
        onSelectionChange(newValues)
        if (onRemoveBadge) {
            onRemoveBadge(value)
        }
    }

    const handleClear = () => {
        onSelectionChange([])
    }

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        if (!newOpen) {
            setSearchTerm("")
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <Popover open={open} onOpenChange={handleOpenChange}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(width, "justify-between", selectedValues.length === 0 && "text-muted-foreground")}
                    >
                        <div className="flex items-center gap-1 overflow-hidden">
                            {selectedValues.length > 0 ? (
                                <>
                                    <div className="flex -space-x-2 mr-2">
                                        {selectedValues.slice(0, 3).map((value) => (
                                            <div
                                                key={value}
                                                className="h-5 min-w-5 px-1 rounded-full bg-primary/20 border border-background flex items-center justify-center text-[10px] font-bold text-primary"
                                            >
                                                {value.slice(0, 1).toUpperCase()}
                                            </div>
                                        ))}
                                    </div>
                                    <span className="truncate">
                                        {multiSelect
                                            ? `${selectedValues.length} selected`
                                            : selectedValues[0]
                                        }
                                    </span>
                                </>
                            ) : (
                                placeholder
                            )}
                        </div>
                        <PlusCircle className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
            <PopoverContent className={cn(width, "p-0")} align="start">
                <div className="flex flex-col">
                    {/* Search Input */}
                    <div className="flex items-center border-b px-3">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Input
                            placeholder={searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex h-11 w-full border-0 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                    </div>

                    {/* Options List */}
                    <div className="max-h-[300px] overflow-y-auto overflow-x-hidden p-1">
                        {filteredOptions.length === 0 ? (
                            <div className="py-2 px-2">
                                {allowCreate && searchTerm.trim() ? (
                                    <>
                                        <p className="text-xs text-muted-foreground mb-2 text-center">
                                            {emptyMessage}
                                        </p>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="w-full text-xs h-8"
                                            onClick={handleCreate}
                                        >
                                            <Plus className="w-3 h-3 mr-1" />
                                            Create &quot;{searchTerm}&quot;
                                        </Button>
                                    </>
                                ) : (
                                    <div className="py-4 text-center text-sm text-muted-foreground">
                                        {emptyMessage}
                                    </div>
                                )}
                            </div>
                        ) : (
                            filteredOptions.map((option) => {
                                const isSelected = selectedValues.includes(option)
                                return (
                                    <div
                                        key={option}
                                        onClick={() => handleSelect(option)}
                                        className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground transition-colors"
                                    >
                                        <div
                                            className={cn(
                                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border shrink-0",
                                                isSelected
                                                    ? "bg-primary border-primary text-primary-foreground"
                                                    : "border-input"
                                            )}
                                        >
                                            <Check className={cn("h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                                        </div>
                                        <span className="flex-1">{option}</span>
                                    </div>
                                )
                            })
                        )}
                    </div>

                    {/* Clear Filters Button */}
                    {selectedValues.length > 0 && (
                        <div className="p-2 border-t border-muted bg-muted/20">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-center h-8 text-xs font-medium"
                                onClick={handleClear}
                            >
                                Clear {multiSelect ? 'filters' : 'selection'}
                            </Button>
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>

        {/* Selected Badges */}
        {showSelectedBadges && selectedValues.length > 0 && (
            <div className="flex flex-wrap gap-1">
                {selectedValues.map((value) => (
                    <Badge
                        key={value}
                        variant="secondary"
                        className="px-1.5 py-0.5 text-xs font-normal flex items-center gap-1"
                    >
                        {value}
                        <X
                            className="w-3 h-3 cursor-pointer hover:text-destructive transition-colors"
                            onClick={() => handleRemove(value)}
                        />
                    </Badge>
                ))}
            </div>
        )}
    </div>
    )
}
