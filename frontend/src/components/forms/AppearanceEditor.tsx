"use client"

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { UseFormReturn } from "react-hook-form"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    MessageSquare,
    Layout,
    Type,
    Paintbrush,
    Send,
    CheckCircle,
    PanelBottom,
    Globe,
    Sparkles
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"

interface AppearanceEditorProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: UseFormReturn<any>
}

const ColorPickerField = ({
    form,
    name,
    label
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: UseFormReturn<any>,
    name: string,
    label: string
}) => {
    const hexToOpacity = (hex: string): number => {
        if (hex?.length === 9) {
            const alpha = parseInt(hex.substring(7, 9), 16);
            return Math.round((alpha / 255) * 100);
        }
        return 100;
    };

    const opacityToHex = (opacity: number): string => {
        const alpha = Math.round((opacity / 100) * 255);
        return alpha.toString(16).padStart(2, '0');
    };

    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => {
                const currentOpacity = hexToOpacity(field.value);

                return (
                    <FormItem className="flex items-center justify-between space-y-0 p-2.5 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors">
                        <FormLabel className="text-xs font-medium flex-1 cursor-pointer text-foreground/80">{label}</FormLabel>
                        <div className="flex items-center gap-2">
                            <FormControl>
                                <div className="relative flex items-center gap-1.5">
                                    <div
                                        className="w-8 h-8 rounded-lg border-2 border-border/50 shadow-sm shrink-0 cursor-pointer relative overflow-hidden"
                                        style={{
                                            backgroundColor: field.value,
                                            backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                                            backgroundSize: '8px 8px',
                                            backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
                                        }}
                                    >
                                        <Input
                                            type="color"
                                            value={field.value?.substring(0, 7) || "#000000"}
                                            onChange={(e) => {
                                                const alpha = field.value?.length === 9 ? field.value.substring(7) : "ff";
                                                field.onChange(e.target.value + alpha);
                                            }}
                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                        />
                                    </div>
                                    <Input
                                        value={field.value || ""}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        className="h-7 text-[10px] font-mono w-[78px] px-2 text-center"
                                        placeholder="#RRGGBBAA"
                                    />
                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={currentOpacity}
                                        onChange={(e) => {
                                            const opacity = Math.max(0, Math.min(100, parseInt(e.target.value) || 100));
                                            const baseColor = field.value?.substring(0, 7) || "#000000";
                                            const alphaHex = opacityToHex(opacity);
                                            field.onChange(baseColor + alphaHex);
                                        }}
                                        className="h-7 w-14 text-[10px] px-2 text-center"
                                    />
                                    <span className="text-[10px] text-muted-foreground">%</span>
                                </div>
                            </FormControl>
                        </div>
                    </FormItem>
                );
            }}
        />
    );
}

export function AppearanceEditor({ form }: AppearanceEditorProps) {
    const {setTheme, resolvedTheme} = useTheme();

    const themePrefix = `theme.${resolvedTheme}`;

    const handleTabChange = (value: string) => {
        const newTheme = value as "light" | "dark";
        setTheme(newTheme); // Update global theme
    };

    return (
        <div className="space-y-5 px-1">
            <Tabs key={resolvedTheme} value={resolvedTheme ? resolvedTheme === "dark" ? "dark" : "light": "light"} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-5 h-10">
                    <TabsTrigger value="light" className="text-sm">☀️ Light Mode</TabsTrigger>
                    <TabsTrigger value="dark" className="text-sm">🌙 Dark Mode</TabsTrigger>
                </TabsList>

                {/* Colors Section */}
                <div className="space-y-5">
                    {/* Header Configuration */}
                    <Card className="border border-border/40 shadow-sm bg-card/50 overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30">
                            <Layout className="w-4 h-4 text-primary" />
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/70">Header</h3>
                        </div>
                        <CardContent className="space-y-2 p-4">
                            <ColorPickerField
                                form={form}
                                name={`${themePrefix}.header_color`}
                                label="Background"
                            />
                            <ColorPickerField
                                form={form}
                                name={`${themePrefix}.header_text_color`}
                                label="Title Text"
                            />
                            <ColorPickerField
                                form={form}
                                name={`${themePrefix}.header_icon_color`}
                                label="Icon Color"
                            />
                            <ColorPickerField
                                form={form}
                                name={`${themePrefix}.header_separator_color`}
                                label="Separator Line"
                            />
                            
                            <FormField
                                control={form.control}
                                name="theme.show_header_separator"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 bg-muted/20 mt-2">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-xs font-medium">Show Separator Line</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-4 pt-4 border-t mt-4">
                                <span className="text-[11px] font-semibold text-muted-foreground px-1 uppercase tracking-wider">Logo Styling</span>
                                
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                     <ColorPickerField
                                        form={form}
                                        name={`${themePrefix}.header_logo_bg_color`}
                                        label="Logo Background"
                                    />
                                     <ColorPickerField
                                        form={form}
                                        name={`${themePrefix}.header_logo_border_color`}
                                        label="Logo Border"
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="theme.header_logo_radius"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex justify-between items-center mb-1">
                                                <FormLabel className="text-[11px] font-medium text-foreground/70">Logo Radius</FormLabel>
                                                <span className="text-[10px] text-muted-foreground tabular-nums">{field.value}px</span>
                                            </div>
                                            <FormControl className="bg-muted/10 px-3 py-1.5 rounded-md border border-border/40">
                                                <Slider
                                                    min={0}
                                                    max={32}
                                                    step={1}
                                                    value={[field.value]}
                                                    onValueChange={(vals) => field.onChange(vals[0])}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-3">
                                    <FormField
                                        control={form.control}
                                        name="theme.header_logo_width"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex justify-between items-center mb-1">
                                                    <FormLabel className="text-[11px] font-medium text-foreground/70">Width</FormLabel>
                                                    <span className="text-[10px] text-muted-foreground tabular-nums">{field.value}px</span>
                                                </div>
                                                <FormControl className="bg-muted/10 px-2 py-1.5 rounded-md border border-border/40">
                                                    <Slider
                                                        min={16}
                                                        max={128}
                                                        step={1}
                                                        value={[field.value]}
                                                        onValueChange={(vals) => field.onChange(vals[0])}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="theme.header_logo_height"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex justify-between items-center mb-1">
                                                    <FormLabel className="text-[11px] font-medium text-foreground/70">Height</FormLabel>
                                                    <span className="text-[10px] text-muted-foreground tabular-nums">{field.value}px</span>
                                                </div>
                                                <FormControl className="bg-muted/10 px-2 py-1.5 rounded-md border border-border/40">
                                                    <Slider
                                                        min={16}
                                                        max={128}
                                                        step={1}
                                                        value={[field.value]}
                                                        onValueChange={(vals) => field.onChange(vals[0])}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="theme.header_logo_border_width"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex justify-between items-center mb-1">
                                                <FormLabel className="text-[11px] font-medium text-foreground/70">Border Width (Stroke)</FormLabel>
                                                <span className="text-[10px] text-muted-foreground tabular-nums">{field.value}px</span>
                                            </div>
                                            <FormControl className="bg-muted/10 px-3 py-1.5 rounded-md border border-border/40">
                                                <Slider
                                                    min={0}
                                                    max={10}
                                                    step={1}
                                                    value={[field.value]}
                                                    onValueChange={(vals) => field.onChange(vals[0])}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Separator className="my-4" />

                    {/* Chat Area - Backgrounds */}
                    <Card className="border border-border/40 shadow-sm bg-card/50 overflow-hidden">
                         <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30">
                            <Paintbrush className="w-4 h-4 text-primary" />
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/70">Background & Accent</h3>
                        </div>
                        <CardContent className="space-y-2 p-4">
                            <ColorPickerField
                                form={form}
                                name={`${themePrefix}.bg_color`}
                                label="Chat Background"
                            />
                            <ColorPickerField
                                form={form}
                                name={`${themePrefix}.accent_color`}
                                label="Primary Accent"
                            />
                        </CardContent>
                    </Card>

                    <Separator className="my-4" />

                    {/* Messages */}
                    <Card className="border border-border/40 shadow-sm bg-card/50 overflow-hidden">
                         <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30">
                            <MessageSquare className="w-4 h-4 text-primary" />
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/70">Messages</h3>
                        </div>
                        <CardContent className="space-y-5 p-4">
                            {/* AI Message */}
                            <div className="space-y-2">
                                <span className="text-[11px] font-semibold text-muted-foreground px-1 uppercase tracking-wider">AI Assistant</span>
                                <div className="grid grid-cols-1 gap-2 pl-3 border-l-2 border-primary/30">
                                     <ColorPickerField
                                        form={form}
                                        name={`${themePrefix}.ai_bubble_color`}
                                        label="Bubble Fill"
                                    />
                                    <ColorPickerField
                                        form={form}
                                        name={`${themePrefix}.ai_bubble_text_color`}
                                        label="Text"
                                    />
                                    <ColorPickerField
                                        form={form}
                                        name={`${themePrefix}.ai_profile_bg_color`}
                                        label="Avatar BG"
                                    />
                                     <ColorPickerField
                                        form={form}
                                        name={`${themePrefix}.ai_bubble_border_color`}
                                        label="Border"
                                    />
                                </div>
                            </div>
                            
                            {/* User Message */}
                            <div className="space-y-2">
                                <span className="text-[11px] font-semibold text-muted-foreground px-1 uppercase tracking-wider">User</span>
                                <div className="grid grid-cols-1 gap-2 pl-3 border-l-2 border-blue-500/30">
                                     <ColorPickerField
                                        form={form}
                                        name={`${themePrefix}.user_bubble_color`}
                                        label="Bubble Fill"
                                    />
                                    <ColorPickerField
                                        form={form}
                                        name={`${themePrefix}.user_bubble_text_color`}
                                        label="Text"
                                    />
                                     <ColorPickerField
                                        form={form}
                                        name={`${themePrefix}.user_profile_bg_color`}
                                        label="Avatar BG"
                                    />
                                     <ColorPickerField
                                        form={form}
                                        name={`${themePrefix}.user_bubble_border_color`}
                                        label="Border"
                                    />
                                </div>
                            </div>

                            {/* Timestamp */}
                            <div className="pt-2 border-t">
                                <ColorPickerField
                                    form={form}
                                    name={`${themePrefix}.timestamp_color`}
                                    label="Timestamp Color"
                                />
                            </div>
                        
                        </CardContent>
                    </Card>

                    <Separator className="my-4" />

                    {/* Input Area */}
                    <Card className="border border-border/40 shadow-sm bg-card/50 overflow-hidden">
                         <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30">
                            <Type className="w-4 h-4 text-primary" />
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/70">Input Area</h3>
                        </div>
                        <CardContent className="space-y-3 p-4">
                             <div className="grid grid-cols-2 gap-2">
                                <ColorPickerField
                                    form={form}
                                    name={`${themePrefix}.text_field_color`}
                                    label="Input Fill"
                                />
                                <ColorPickerField
                                    form={form}
                                    name={`${themePrefix}.text_field_foreground`}
                                    label="Input Text"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <ColorPickerField
                                    form={form}
                                    name={`${themePrefix}.input_placeholder_color`}
                                    label="Placeholder Text"
                                />
                                <ColorPickerField
                                    form={form}
                                    name={`${themePrefix}.text_field_icon_color`}
                                    label="Icon Color"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Separator className="my-4" />

                    {/* Footer */}
                    <Card className="border border-border/40 shadow-sm bg-card/50 overflow-hidden">
                         <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30">
                            <PanelBottom className="w-4 h-4 text-primary" />
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/70">Footer</h3>
                        </div>
                        <CardContent className="space-y-2 p-4">
                            <ColorPickerField
                                form={form}
                                name={`${themePrefix}.footer_bg_color`}
                                label="Footer Background"
                            />
                            <ColorPickerField
                                form={form}
                                name={`${themePrefix}.footer_text_color`}
                                label="Disclaimer Text"
                            />
                        </CardContent>
                    </Card>

                    <Separator className="my-4" />

                    {/* Send Button */}
                    <Card className="border border-border/40 shadow-sm bg-card/50 overflow-hidden">
                         <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30">
                            <Send className="w-4 h-4 text-primary" />
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/70">Send Button</h3>
                        </div>
                        <CardContent className="space-y-2 p-4">
                            <ColorPickerField
                                form={form}
                                name={`${themePrefix}.send_btn_color`}
                                label="Button Background"
                            />
                            <ColorPickerField
                                form={form}
                                name={`${themePrefix}.send_btn_icon_color`}
                                label="Icon Color"
                            />
                        </CardContent>
                    </Card>

                    <Separator className="my-4" />

                    {/* Feedback & Utility Colors */}
                    <Separator className="my-4" />

                    {/* Feedback & Utility Colors */}
                    <Card className="border border-border/40 shadow-sm bg-card/50 overflow-hidden">
                         <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30">
                            <CheckCircle className="w-4 h-4 text-primary" />
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/70">Feedback & Utility</h3>
                        </div>
                        <CardContent className="space-y-2 p-4">
                            <ColorPickerField
                                form={form}
                                name={`${themePrefix}.success_color`}
                                label="Success / Confirm"
                            />
                            <ColorPickerField
                                form={form}
                                name={`${themePrefix}.search_highlight_color`}
                                label="Search Highlight"
                            />
                            <ColorPickerField
                                form={form}
                                name={`${themePrefix}.loading_indicator_color`}
                                label="Loading Indicator"
                            />
                        </CardContent>
                    </Card>

                    {/* Welcome Screen & Suggested Prompts */}
                    <Card className="border border-border/40 shadow-sm bg-card/50 overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/70">Welcome Screen & Prompts</h3>
                        </div>
                        <CardContent className="space-y-2 p-4">
                            <ColorPickerField
                                form={form}
                                name={`${themePrefix}.welcome_text_color`}
                                label="Welcome Subtitle Text"
                            />
                            <ColorPickerField
                                form={form}
                                name={`${themePrefix}.suggested_prompt_title_color`}
                                label="Prompt Card Title"
                            />
                            <ColorPickerField
                                form={form}
                                name={`${themePrefix}.suggested_prompt_desc_color`}
                                label="Prompt Card Description"
                            />
                            <ColorPickerField
                                form={form}
                                name={`${themePrefix}.suggested_prompt_icon_color`}
                                label="Prompt Arrow Icon"
                            />
                        </CardContent>
                    </Card>

                    <Separator className="my-4" />

                    {/* Global Layout & Effects */}
                    <Card className="border border-border/40 shadow-sm bg-card/50 overflow-hidden mb-6">
                         <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30">
                            <Globe className="w-4 h-4 text-primary" />
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/70">Global Layout & Effects</h3>
                        </div>
                        <CardContent className="space-y-4 p-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="theme.shadow_intensity"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-[11px] font-medium text-foreground/70 uppercase tracking-tighter">Shadow Intensity</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-9 text-xs bg-muted/20 border-muted">
                                                        <SelectValue placeholder="Select intensity" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="none">None</SelectItem>
                                                    <SelectItem value="sm">Small (Subtle)</SelectItem>
                                                    <SelectItem value="md">Medium</SelectItem>
                                                    <SelectItem value="lg">Large (Premium)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="theme.loading_animation_style"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-[11px] font-medium text-foreground/70 uppercase tracking-tighter">Loading Style</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-9 text-xs bg-muted/20 border-muted">
                                                        <SelectValue placeholder="Select style" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="dot">Classic Dots</SelectItem>
                                                    <SelectItem value="wave">Wave</SelectItem>
                                                    <SelectItem value="circle">Pulsing Circle</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                            </div>

                             <div className="pt-2">
                                <FormField
                                    control={form.control}
                                    name="theme.msg_bubble_radius"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex justify-between items-center mb-1">
                                                <FormLabel className="text-[11px] font-medium text-foreground/70">Message Bubble Radius</FormLabel>
                                                <span className="text-[10px] text-muted-foreground tabular-nums">{field.value}px</span>
                                            </div>
                                             <FormControl className="bg-muted/10 px-3 py-1.5 rounded-md border border-border/40">
                                                <Slider
                                                    min={0}
                                                    max={32}
                                                    step={1}
                                                    value={[field.value]}
                                                    onValueChange={(vals) => field.onChange(vals[0])}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                             <div className="pt-2">
                                <FormField
                                    control={form.control}
                                    name="theme.input_radius"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex justify-between items-center mb-1">
                                                <FormLabel className="text-[11px] font-medium text-foreground/70">Input Panel Radius</FormLabel>
                                                <span className="text-[10px] text-muted-foreground tabular-nums">{field.value}px</span>
                                            </div>
                                            <FormControl className="bg-muted/10 px-3 py-1.5 rounded-md border border-border/40">
                                                <Slider
                                                    min={0}
                                                    max={32}
                                                    step={1}
                                                    value={[field.value]}
                                                    onValueChange={(vals) => field.onChange(vals[0])}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </Tabs>
        </div>
    )
}
