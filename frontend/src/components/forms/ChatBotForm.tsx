"use client"

import React, { useEffect, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2, Bot, FileText, Globe, Lock, Users, Plus, X, Layers, Clock, Server, Eye, Thermometer, Hash, Upload, ImageIcon, Sparkles } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { documentService } from "@/lib/api/services/documentService"
import { llmConfigService } from "@/lib/api/services/llmConfigService"
import { ResourceSelectionDialog } from "@/components/common/ResourceSelectionDialog"
import { ResourceCard } from "@/components/common/ResourceCard"
import { IDocument } from "@/types/document"
import { ILLMConfig } from "@/types/llmconfig"
import { IChatBotTheme, ChatbotVisibilityEnum } from "@/types/chatbot"
import { toast } from "sonner"
import { ChatInterface } from "@/components/chat/ChatInterface"
import { migrateTheme } from "@/lib/themeMigration"
import { Message } from "@/components/chat/ChatMessage"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppearanceEditor } from "@/components/forms/AppearanceEditor"
import { CHATBOT_THEME_PRESETS } from "@/config/chatThemePresets"

const PREVIEW_MESSAGES: Message[] = [
    {
        role: "assistant",
        content: "Hello! I am your AI assistant. How can I help you today?",
    },
    {
        role: "user",
        content: "Can you help me design a great chatbot?",
    },
    {
        role: "assistant",
        content: "Absolutely! You can customize my appearance using the settings on the left. Try changing the colors and radius to match your brand style.",
    }
];

const themeColorsSchema = z.object({
    bg_color: z.string().min(1, "Background color is required"),
    ai_bubble_color: z.string().min(1, "AI bubble color is required"),
    user_bubble_color: z.string().min(1, "User bubble color is required"),
    user_profile_bg_color: z.string().min(1, "User profile bg color is required"),
    ai_profile_bg_color: z.string().min(1, "AI profile bg color is required"),
    accent_color: z.string().min(1, "Accent color is required"),
    text_field_color: z.string().min(1, "Text field color is required"),
    text_field_foreground: z.string().min(1, "Text field foreground color is required"),
    text_field_icon_color: z.string().min(1, "Text field icon color is required"),
    footer_bg_color: z.string().min(1, "Input panel background color is required"),
    header_color: z.string().min(1, "Header color is required"),
    header_text_color: z.string().min(1, "Header text color is required"),
    ai_bubble_text_color: z.string().min(1, "AI bubble text color is required"),
    user_bubble_text_color: z.string().min(1, "User bubble text color is required"),
    ai_bubble_border_color: z.string().min(1, "AI bubble border color is required"),
    user_bubble_border_color: z.string().min(1, "User bubble border color is required"),
    header_separator_color: z.string().min(1, "Header separator color is required"),
    // New granular color properties
    header_icon_color: z.string().min(1, "Header icon color is required"),
    send_btn_color: z.string().min(1, "Send button color is required"),
    send_btn_icon_color: z.string().min(1, "Send button icon color is required"),
    input_placeholder_color: z.string().min(1, "Input placeholder color is required"),
    timestamp_color: z.string().min(1, "Timestamp color is required"),
    search_highlight_color: z.string().min(1, "Search highlight color is required"),
    loading_indicator_color: z.string().min(1, "Loading indicator color is required"),
    footer_text_color: z.string().min(1, "Footer text color is required"),
    success_color: z.string().min(1, "Success color is required"),
    header_logo_border_color: z.string().min(1, "Logo border color is required"),
    header_logo_bg_color: z.string().min(1, "Logo background color is required"),
    welcome_text_color: z.string().min(1, "Welcome text color is required"),
    suggested_prompt_title_color: z.string().min(1, "Suggested prompt title color is required"),
    suggested_prompt_desc_color: z.string().min(1, "Suggested prompt description color is required"),
    suggested_prompt_icon_color: z.string().min(1, "Suggested prompt icon color is required"),
})

const themeSchema = z.object({
    light: themeColorsSchema,
    dark: themeColorsSchema,
    msg_bubble_radius: z.number().min(0).default(12),
    input_radius: z.number().min(0).default(12),
    header_logo_radius: z.number().min(0).default(8),
    header_logo_width: z.number().min(16).max(128).default(36),
    header_logo_height: z.number().min(16).max(128).default(36),
    header_logo_border_width: z.number().min(0).max(10).default(0),
    shadow_intensity: z.enum(["none", "sm", "md", "lg"]).default("sm"),
    loading_animation_style: z.enum(["dot", "wave", "circle"]).default("dot"),
    show_header_separator: z.boolean().default(false),
})

const chatBotSchema = z.object({
    name: z.string().min(1, "Chatbot Name is required"),
    visibility: z.nativeEnum(ChatbotVisibilityEnum),
    system_prompt: z.string().min(1, "System prompt is required"),
    document_ids: z.array(z.string()).refine((val) => val.length > 0, {
        message: "Please select at least one document"
    }),
    llm_config_id: z.string().min(1, "LLM Configuration is required"),
    view_source_documents: z.boolean(),
    temperature: z.number().min(0).max(2),
    max_tokens: z.number().int().min(1),
    theme: themeSchema,
    logo: z.string().min(1, "Logo is required"),
})

type ChatBotFormValues = z.infer<typeof chatBotSchema>

interface DocumentRef {
    _id: string;
    name: string;
    size?: number;
    metadata?: {
        file_size?: number;
    }
}

interface ChatBotFormProps {
    initialData?: {
        name: string
        document_ids: string[]
        documents?: DocumentRef[]
        system_prompt: string
        visibility: ChatbotVisibilityEnum
        llm_config_id?: string
        view_source_documents?: boolean
        temperature?: number
        max_tokens?: number
        theme?: Partial<z.infer<typeof themeSchema>>
        logo?: string
    }
    onSubmit: (data: ChatBotFormValues) => Promise<void>
    isLoading: boolean
    mode: "create" | "edit"
}

export function ChatBotForm({
    initialData,
    onSubmit,
    isLoading,
    mode,
}: ChatBotFormProps) {
    // Local state for selected documents
    const [selectedDocuments, setSelectedDocuments] = useState<DocumentRef[]>(initialData?.documents || []);
    const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);
    const [llmConfigs, setLlmConfigs] = useState<ILLMConfig[]>([]);
    const [previewMessages, setPreviewMessages] = useState<Message[]>(PREVIEW_MESSAGES);
    const [isPreviewTyping, setIsPreviewTyping] = useState(false);
    const [activeTab, setActiveTab] = useState("general");
    const [activePreset, setActivePreset] = useState<string | null>(null);

    const form = useForm<ChatBotFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(chatBotSchema) as any,
        mode: "onSubmit",
        defaultValues: initialData ? {
            name: initialData.name,
            visibility: initialData.visibility,
            system_prompt: initialData.system_prompt,
            document_ids: initialData.document_ids,
            llm_config_id: initialData.llm_config_id,
            view_source_documents: initialData.view_source_documents ?? false,
            temperature: initialData.temperature ?? 0.6,
            max_tokens: initialData.max_tokens ?? 500,
            theme: migrateTheme(initialData.theme),
            logo: initialData.logo,
        } : {
            name: "",
            visibility: ChatbotVisibilityEnum.PRIVATE,
            system_prompt: "",
            document_ids: [],
            llm_config_id: undefined,
            view_source_documents: false,
            temperature: 0.6,
            max_tokens: 500,
            theme: {
                light: {
                    bg_color: "#ffffff",
                    ai_bubble_color: "#ffffff",
                    user_bubble_color: "#0a766c",
                    user_profile_bg_color: "#0a766c",
                    ai_profile_bg_color: "#0a766c",
                    accent_color: "#0a766c",
                    text_field_color: "#ffffff",
                    text_field_foreground: "#0f172a",
                    text_field_icon_color: "#64748b",
                    footer_bg_color: "#f8fafc",
                    header_color: "#ffffff",
                    header_text_color: "#0f172a",
                    ai_bubble_text_color: "#0f172a",
                    user_bubble_text_color: "#ffffff",
                    ai_bubble_border_color: "#e2e8f0",
                    user_bubble_border_color: "#e2e8f0",
                    header_separator_color: "#e2e8f0",
                    // New granular colors
                    header_icon_color: "#0f172a",
                    send_btn_color: "#0a766c",
                    send_btn_icon_color: "#ffffff",
                    input_placeholder_color: "#94a3b8",
                    timestamp_color: "#94a3b8",
                    search_highlight_color: "#fef08a",
                    loading_indicator_color: "#0a766c",
                    footer_text_color: "#94a3b8",
                    success_color: "#22c55e",
                    header_logo_border_color: "#e2e8f0",
                    header_logo_bg_color: "#ffffff",
                },
                dark: {
                    bg_color: "#020817",
                    ai_bubble_color: "#1e293b",
                    user_bubble_color: "#0a766c",
                    user_profile_bg_color: "#0a766c",
                    ai_profile_bg_color: "#0a766c",
                    accent_color: "#0a766c",
                    text_field_color: "#1e293b",
                    text_field_foreground: "#e2e8f0",
                    text_field_icon_color: "#94a3b8",
                    footer_bg_color: "#0f172a",
                    header_color: "#020817",
                    header_text_color: "#e2e8f0",
                    ai_bubble_text_color: "#e2e8f0",
                    user_bubble_text_color: "#ffffff",
                    ai_bubble_border_color: "#334155",
                    user_bubble_border_color: "#334155",
                    header_separator_color: "#334155",
                    // New granular colors
                    header_icon_color: "#e2e8f0",
                    send_btn_color: "#0a766c",
                    send_btn_icon_color: "#ffffff",
                    input_placeholder_color: "#64748b",
                    timestamp_color: "#64748b",
                    search_highlight_color: "#ca8a04",
                    loading_indicator_color: "#0a766c",
                    footer_text_color: "#64748b",
                    success_color: "#4ade80",
                    header_logo_border_color: "#334155",
                    header_logo_bg_color: "#020817",
                },
                msg_bubble_radius: 12,
                input_radius: 12,
                header_logo_radius: 8,
                header_logo_width: 36,
                header_logo_height: 36,
                header_logo_border_width: 0,
                shadow_intensity: "sm",
                loading_animation_style: "dot",
                show_header_separator: false,
            },
            logo: "/logo.png",
        },
    })

    // Debug form errors
    useEffect(() => {
        if (Object.keys(form.formState.errors).length > 0) {
            console.log("Form Validation Errors:", form.formState.errors);
        }
    }, [form.formState.errors]);

    // Reset form when initialData loads
    useEffect(() => {
        if (initialData) {
            form.reset({
                name: initialData.name,
                visibility: initialData.visibility,
                system_prompt: initialData.system_prompt,
                document_ids: initialData.document_ids,
                llm_config_id: initialData.llm_config_id,
                view_source_documents: initialData.view_source_documents ?? false,
                temperature: initialData.temperature ?? 0.6,
                max_tokens: initialData.max_tokens ?? 500,
                theme: migrateTheme(initialData.theme),
                logo: initialData.logo,
            }, {
                keepDefaultValues: false
            });
            // Safely sync documents if they changed
            if (initialData.documents) {
                const newDocs = initialData.documents;
                // Defer update to avoid synchronous setState warning
                setTimeout(() => {
                    setSelectedDocuments(prev => {
                        if (prev.length === newDocs.length && prev.every((d, i) => d._id === newDocs[i]._id)) {
                            return prev;
                        }
                        return newDocs;
                    });
                }, 0);
            }
        }
    }, [initialData, form]);

    // Sync selectedDocuments to form field
    useEffect(() => {
        const ids = selectedDocuments.map(d => d._id);
        form.setValue("document_ids", ids, { shouldValidate: true });
    }, [selectedDocuments, form]);

    // Fetch LLM configs
    useEffect(() => {
        const fetchLlmConfigs = async () => {
            try {
                const response = await llmConfigService.getAll({ limit: 100 });
                setLlmConfigs(response.data);
            } catch (err) {
                console.error("Failed to load LLM configs", err);
            }
        };
        void fetchLlmConfigs();
    }, []);

    // Watch values for preview
    const watchedName = useWatch({ control: form.control, name: "name" });
    const watchedTheme = useWatch({ control: form.control, name: "theme" });
    const watchedLogo = useWatch({ control: form.control, name: "logo" });

    const handleSubmit = async (data: ChatBotFormValues) => {
        await onSubmit(data);
    }

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                form.setValue("logo", reader.result as string, { shouldDirty: true, shouldValidate: true });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddDocuments = (docs: IDocument[]) => {
        // Map generic docs (IDocument) to DocumentRef
        // Ensure we preserve existing if present, or create new Ref
        setSelectedDocuments(prev => {
            const combined = [...prev];
            docs.forEach(d => {
                if (!combined.some(existing => existing._id === d._id)) {
                    combined.push({
                        _id: d._id,
                        name: d.name,
                        size: typeof d.metadata?.file_size === 'number' ? d.metadata.file_size : undefined,
                        metadata: d.metadata
                    });
                }
            });
            return combined;
        });
    };

    const removeDocument = (id: string) => {
        setSelectedDocuments(prev => prev.filter(d => d._id !== id));
    };

    const handlePreviewSend = (content: string) => {
        const userMsg: Message = {
            role: "user",
            content,
            timestamp: new Date().toISOString()
        };
        
        setPreviewMessages(prev => [...prev, userMsg]);
        setIsPreviewTyping(true);
        
        // Mock AI response after delay
        setTimeout(() => {
            const aiMsg: Message = {
                role: "assistant",
                content: `This is a preview response! Your chatbot is currently configured with the **${watchedName || "Default"}** personality.`,
                timestamp: new Date().toISOString()
            };
            setPreviewMessages(prev => [...prev, aiMsg]);
            setIsPreviewTyping(false);
        }, 1500);
    };

    const handleClearPreview = () => {
        setPreviewMessages(PREVIEW_MESSAGES);
    };

    return (
        <Form {...form}>
            <form 
                onSubmit={(e) => { 
                    void form.handleSubmit(
                        handleSubmit,
                        (errors) => {
                            console.log("Form Validation Errors:", errors);
                            const firstError = Object.values(errors)[0];
                            if (firstError?.message) {
                                toast.error(`Validation Error: ${String(firstError.message)}`);
                            } else {
                                toast.error("Please check the form for errors.");
                            }
                        }
                    )(e); 
                }} 
                className="space-y-8"
            >
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 border-b pb-4">
                        <TabsList className="grid w-full sm:w-auto grid-cols-3">
                            <TabsTrigger value="general">General</TabsTrigger>
                            <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
                            <TabsTrigger value="design">Design Studio</TabsTrigger>
                        </TabsList>
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <Link href="/chatbots">
                                <Button type="button" variant="ghost">
                                    Cancel
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                variant="gradient"
                                disabled={isLoading || form.formState.isSubmitting}
                                className="min-w-[140px]"
                            >
                                {(isLoading || form.formState.isSubmitting) && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {mode === "create" ? "Create Chatbot" : "Save Changes"}
                            </Button>
                        </div>
                    </div>

                    <TabsContent value="general" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>General Settings</CardTitle>
                                <CardDescription>Basic information and behavior configuration.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2 md:col-span-2">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2">
                                                        Chatbot Name <span className="text-destructive">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. Finance Assistant" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <FormField
                                            control={form.control}
                                            name="visibility"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2">
                                                        <Globe className="w-4 h-4 text-muted-foreground" />
                                                        Visibility
                                                    </FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select visibility" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value={ChatbotVisibilityEnum.PRIVATE}>
                                                                <div className="flex items-center gap-2">
                                                                    <Lock className="w-4 h-4 text-muted-foreground" />
                                                                    <span>Private (Only you)</span>
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value={ChatbotVisibilityEnum.PUBLIC}>
                                                                <div className="flex items-center gap-2">
                                                                    <Globe className="w-4 h-4 text-muted-foreground" />
                                                                    <span>Public (Everyone)</span>
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value={ChatbotVisibilityEnum.SHARED}>
                                                                <div className="flex items-center gap-2">
                                                                    <Users className="w-4 h-4 text-muted-foreground" />
                                                                    <span>Shared (Specific users)</span>
                                                                </div>
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <FormField
                                            control={form.control}
                                            name="system_prompt"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2">
                                                        <Bot className="w-4 h-4 text-muted-foreground" />
                                                        System Prompt
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Enter instructions for the chatbot personality..."
                                                            className="min-h-[120px]"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <FormField
                                            control={form.control}
                                            name="llm_config_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2">
                                                        <Server className="w-4 h-4 text-muted-foreground" />
                                                        LLM Configuration
                                                    </FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select LLM Configuration" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {llmConfigs.map((config) => (
                                                                <SelectItem key={config._id} value={config._id}>
                                                                    {config.model_name} ({config.provider})
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2 md:col-span-2">
                                        <FormField
                                            control={form.control}
                                            name="temperature"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2">
                                                        <Thermometer className="w-4 h-4 text-muted-foreground" />
                                                        Temperature: {field.value?.toFixed(1) ?? "0.6"}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Slider
                                                            min={0}
                                                            max={2}
                                                            step={0.1}
                                                            value={[field.value ?? 0.6]}
                                                            onValueChange={(vals) => field.onChange(vals[0])}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="max_tokens"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2">
                                                        <Hash className="w-4 h-4 text-muted-foreground" />
                                                        Max Tokens
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min={1}
                                                            {...field}
                                                            onChange={(e) => field.onChange(parseInt(e.target.value) || 500)}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="knowledge" className="space-y-6">
                         <Card>
                            <CardHeader>
                                <CardTitle>Knowledge Base</CardTitle>
                                <CardDescription>Manage the documents this chatbot can access.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <FormField
                                        control={form.control}
                                        name="view_source_documents"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel className="flex items-center gap-2">
                                                        <Eye className="w-4 h-4 text-muted-foreground" />
                                                        Show Source Documents
                                                    </FormLabel>
                                                    <p className="text-sm text-muted-foreground">
                                                        Display source documents in chat responses (only public documents)
                                                    </p>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <FormField
                                        name="document_ids"
                                        control={form.control}
                                        render={() => (
                                            <FormItem>
                                                <div className="flex items-center justify-between mb-4">
                                                    <FormLabel className="text-base">Selected Documents</FormLabel>
                                                    <Button type="button" variant="outline" size="sm" onClick={() => setIsDocumentDialogOpen(true)}>
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        Add Documents
                                                    </Button>
                                                </div>
                                                <ScrollArea className="h-[300px] border rounded-md p-4 bg-muted/5">
                                                    <div className="grid grid-cols-1 gap-2">
                                                        {selectedDocuments.length === 0 ? (
                                                            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground space-y-2">
                                                                <FileText className="w-10 h-10 opacity-50" />
                                                                <p className="text-sm">No documents selected</p>
                                                                <Button type="button" variant="link" onClick={() => setIsDocumentDialogOpen(true)}>
                                                                    Browse Library
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            selectedDocuments.map((doc) => (
                                                                <div key={doc._id} className="flex items-center justify-between p-3 bg-card border rounded-lg shadow-sm group">
                                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                                        <div className="p-2 bg-primary/10 rounded">
                                                                            <FileText className="w-4 h-4 text-primary" />
                                                                        </div>
                                                                        <div className="min-w-0">
                                                                            <p className="text-sm font-medium truncate">{doc.name}</p>
                                                                            <p className="text-xs text-muted-foreground">
                                                                                {(doc.size ? (doc.size / 1024).toFixed(1) + ' KB' : 'Unknown size')}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        onClick={() => removeDocument(doc._id)}
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                </ScrollArea>
                                                <span className="text-xs text-muted-foreground ml-1">
                                                    {selectedDocuments.length} document{selectedDocuments.length !== 1 && 's'} selected
                                                </span>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="design" className="h-[calc(100vh-280px)] px-1">
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                             {/* Left: Editor */}
                             <Card className="min-h-0 flex flex-col border-muted/40 shadow-sm overflow-hidden">
                                 <CardHeader className="pb-4 border-b bg-muted/5 flex-shrink-0">
                                     <CardTitle className="text-lg">Appearance Editor</CardTitle>
                                     <CardDescription>Customize the look and feel of your chatbot.</CardDescription>
                                 </CardHeader>
                                 <ScrollArea className="flex-1">
                                     <div className="p-6 space-y-8">
                                     <div className="mb-8">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Sparkles className="w-4 h-4 text-primary" />
                                            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/70">Theme Presets</h3>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                                            {CHATBOT_THEME_PRESETS.map((preset) => (
                                                <button
                                                    key={preset.name}
                                                    type="button"
                                                    className={cn(
                                                        "group relative flex flex-col overflow-hidden rounded-xl border-2 transition-all duration-300 hover:scale-[1.02]",
                                                        activePreset === preset.displayName
                                                            ? "border-primary bg-primary/5 shadow-md scale-[1.02]"
                                                            : "border-muted/60 bg-card hover:border-primary/50"
                                                    )}
                                                    onClick={() => {
                                                        setActivePreset(preset.displayName);
                                                        const applyPreset = (selectedPreset: typeof preset) => {
                                                            const opts = { shouldDirty: true, shouldValidate: true };

                                                            // Apply all theme properties from the preset
                                                            const themeData = selectedPreset.theme;

                                                            // Apply light mode colors
                                                            (Object.keys(themeData.light) as Array<keyof typeof themeData.light>).forEach((key) => {
                                                                form.setValue(`theme.light.${key}`, themeData.light[key], opts);
                                                            });

                                                            // Apply dark mode colors
                                                            (Object.keys(themeData.dark) as Array<keyof typeof themeData.dark>).forEach((key) => {
                                                                form.setValue(`theme.dark.${key}`, themeData.dark[key], opts);
                                                            });

                                                            // Apply non-color theme properties
                                                            form.setValue("theme.msg_bubble_radius", themeData.msg_bubble_radius, opts);
                                                            form.setValue("theme.input_radius", themeData.input_radius, opts);
                                                            form.setValue("theme.header_logo_radius", themeData.header_logo_radius, opts);
                                                            form.setValue("theme.header_logo_width", themeData.header_logo_width, opts);
                                                            form.setValue("theme.header_logo_height", themeData.header_logo_height, opts);
                                                            form.setValue("theme.header_logo_border_width", themeData.header_logo_border_width, opts);
                                                            form.setValue("theme.shadow_intensity", themeData.shadow_intensity, opts);
                                                            form.setValue("theme.loading_animation_style", themeData.loading_animation_style, opts);
                                                            form.setValue("theme.show_header_separator", themeData.show_header_separator, opts);
                                                        };
                                                        applyPreset(preset);
                                                    }}
                                                >
                                                    <div className="flex h-12 w-full overflow-hidden">
                                                        <div className="flex-1 opacity-90" style={{ backgroundColor: preset.primaryColor }} />
                                                        <div className="flex-1 opacity-50" style={{ backgroundColor: preset.secondaryColor }} />
                                                    </div>
                                                    <div className="p-2 pt-1">
                                                        <p className="text-[10px] font-bold uppercase tracking-tighter opacity-70 mb-0.5">{preset.displayName}</p>
                                                        <p className="text-[8px] text-muted-foreground leading-none">{preset.description}</p>
                                                    </div>
                                                    {activePreset === preset.displayName && (
                                                        <div className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground shadow-sm">
                                                            ✓
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="logo"
                                            render={({ field }) => (
                                                <FormItem className="mb-6">
                                                     <div className="flex items-center gap-2 mb-3">
                                                        <ImageIcon className="w-4 h-4 text-primary" />
                                                        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/70">Chatbot Logo</h3>
                                                    </div>
                                                    <FormControl>
                                                        <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/5 transition-colors hover:bg-muted/10">
                                                            <div className="flex-shrink-0 relative group">
                                                                {field.value ? (
                                                                    <div className="relative">
                                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                        <img 
                                                                            src={field.value} 
                                                                            alt="Logo Preview" 
                                                                            className="w-16 h-16 rounded-xl object-contain p-1 border bg-background shadow-sm"
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => form.setValue("logo", "", { shouldDirty: true })}
                                                                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg transform hover:scale-110"
                                                                        >
                                                                            <X className="w-3 h-3" />
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center border shadow-inner">
                                                                        <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 text-left">
                                                                <p className="text-sm font-semibold text-foreground mb-1">Upload Logo</p>
                                                                <p className="text-xs text-muted-foreground mb-3">PNG, JPG up to 1MB</p>
                                                                <div className="flex items-center gap-2">
                                                                    <label
                                                                        htmlFor="logo-upload"
                                                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold cursor-pointer hover:bg-primary/90 transition-colors shadow-sm"
                                                                    >
                                                                        <Upload className="w-3 h-3" />
                                                                        Choose File
                                                                        <input
                                                                            id="logo-upload"
                                                                            type="file"
                                                                            accept="image/*"
                                                                            className="hidden"
                                                                            onChange={handleLogoUpload}
                                                                        />
                                                                    </label>
                                                                    {field.value && (
                                                                        <span className="text-[10px] text-green-600 font-bold uppercase tracking-widest flex items-center gap-1">
                                                                            <Sparkles className="w-3 h-3" />
                                                                            Ready
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                     <AppearanceEditor form={form} />
                                     </div>
                                 </ScrollArea>
                             </Card>

                             {/* Right: Preview */}
                             <Card className="min-h-0 flex flex-col border-2 border-muted shadow-2xl bg-background/50 backdrop-blur-sm overflow-hidden relative">
                                     <div className="flex-1 relative bg-dot-pattern min-h-0 dark:bg-slate-950 bg-white">
                                         <div className="absolute inset-0 z-0 opacity-10 dark:bg-slate-900 bg-slate-100" />
                                         <div className="relative h-full w-full">
                                            <ChatInterface 
                                                messages={previewMessages}
                                                onSend={handlePreviewSend}
                                                loading={isPreviewTyping}
                                                chatbot={{
                                                    name: watchedName || "Chatbot",
                                                    theme: watchedTheme as IChatBotTheme,
                                                    logo: watchedLogo || "",
                                                }}
                                            />
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="absolute top-2 right-2 z-30 h-7 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 backdrop-blur-sm"
                                                onClick={handleClearPreview}
                                            >
                                                Clear Preview
                                            </Button>
                                         </div>
                                     </div>
                             </Card>
                         </div>
                    </TabsContent>
                </Tabs>
            </form>

            <ResourceSelectionDialog<IDocument>
                open={isDocumentDialogOpen}
                onOpenChange={setIsDocumentDialogOpen}
                title="Select Documents"
                description="Choose documents to include in your chatbot's knowledge base."
                fetchItems={documentService.getAll}
                queryKeyPrefix="documents-selection"
                multiSelect={true}
                initialSelectedIds={selectedDocuments.map(d => d._id)}
                onConfirm={handleAddDocuments}
                confirmLabel="Select Documents"
                renderItem={(item, isSelected, toggle) => (
                    <ResourceCard
                        key={item._id}
                        title={item.name}
                        icon={FileText}
                        iconClassName="bg-primary/10 text-primary"
                        accentColor={
                            item.metadata?.status === 'indexed' ? "success" :
                            item.metadata?.status === 'failed' ? "destructive" : "warning"
                        }
                        status={{
                            label: item.metadata?.status || 'unknown',
                            variant: item.metadata?.status === 'indexed' ? 'success' : item.metadata?.status === 'failed' ? 'destructive' : 'warning'
                        }}
                        metaItems={[
                            { icon: Layers, label: `${item.metadata?.chunk_count || 0} chunks` },
                            { icon: Clock, label: item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A' }
                        ]}
                        onClick={toggle}
                        className={cn(
                            "w-full mb-2",
                            isSelected ? "border-primary bg-primary/5 shadow-sm" : ""
                        )}
                        footer={
                            <span className="opacity-70 whitespace-nowrap text-xs">
                                Updated: {item.updated_at ? new Date(item.updated_at).toLocaleDateString() : 'N/A'}
                            </span>
                        }
                    />
                )}
            />
        </Form>
    )
}
