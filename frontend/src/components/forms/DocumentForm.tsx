'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Plus, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { processDocumentFile } from "@/lib/utils/documentProcessor";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { UploadCloud } from 'lucide-react';
import { cn } from "@/lib/utils";
import { MultiSelectFilter } from "@/components/common/MultiSelectFilter";
import { documentService } from "@/lib/api/services/documentService";
import { toast } from "sonner";
import { chunkTextSemanticically, Chunk } from "@/lib/utils/semanticChunker";
import { ChunkViewer } from "@/components/common/ChunkViewer";
import { documentSchema, DocumentFormValues } from '@/schemas/document.schema';
import { DocumentVisibilityEnum } from '@/types/document';

export type { DocumentFormValues };

interface DocumentFormProps {
    initialData?: {
        name: string;
        description?: string;
        labels?: string[];
        visibility?: DocumentVisibilityEnum;
        metadata?: Record<string, unknown>;
        _id?: string;
        created_at?: string;
        size?: number;
        chunks?: Chunk[];
    };
    onSubmit: (data: DocumentFormValues, chunks: Chunk[]) => Promise<void>;
    isLoading: boolean;
    mode: 'create' | 'edit';
}

export function DocumentForm({ initialData, onSubmit, isLoading, mode }: DocumentFormProps) {
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [dragging, setDragging] = React.useState(false);
    const [existingLabels, setExistingLabels] = React.useState<string[]>([]);
    const [progress, setProgress] = React.useState(0);
    const [chunks, setChunks] = React.useState<Chunk[]>([]);

    const form = useForm<DocumentFormValues>({
        resolver: zodResolver(documentSchema),
        defaultValues: {
            name: initialData?.name || '',
            description: initialData?.description || '',
            labels: initialData?.labels || [],
            visibility: initialData?.visibility || DocumentVisibilityEnum.PRIVATE,
        },
    });

    // Fetch unique labels for suggestion
    React.useEffect(() => {
        const fetchLabels = async () => {
            try {
                const labels = await documentService.getLabels();
                setExistingLabels(labels);
            } catch (err) {
                 // Silent fail as it's non-critical
                 console.error("Failed to load labels", err);
            }
        };
        void fetchLabels();
    }, []);

    React.useEffect(() => {
        if (initialData) {
            form.reset({
                name: initialData.name,
                description: initialData.description || '',
                labels: initialData.labels || [],
                visibility: initialData.visibility || DocumentVisibilityEnum.PRIVATE,
            });

            // Set chunks from initialData if available (edit mode)
            if (initialData.chunks) {
                setChunks(initialData.chunks);
            }
        }
    }, [initialData, form]);

    const handleFormSubmit = async (data: DocumentFormValues) => {
        await onSubmit(data, chunks);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await processFile(file);
    };

    const processFile = async (file: File) => {
        setIsProcessing(true);
        setProgress(0);
        try {
            // Extract text from document
            const text = await processDocumentFile(file, {
                onProgress: (p) => setProgress(Math.min(p * 0.6, 60))
            });

            if (!form.getValues('name')) {
                form.setValue('name', file.name.replace(/\.[^/.]+$/, ""));
            }

            // Chunk the text semantically
            const textChunks = await chunkTextSemanticically(text, {
                chunkSize: 1000,
                chunkOverlap: 200,
                onProgress: (p) => setProgress(60 + (p * 0.4))
            });

            setChunks(textChunks);
            toast.success(`Document processed successfully! Created ${textChunks.length} chunks.`);
        } catch (error) {
            console.error(error);
            toast.error("Failed to extract text from document");
        } finally {
            setIsProcessing(false);
            setDragging(false);
            setProgress(0);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
           await processFile(file);
        }
    };


    return (
        <Form {...form}>
            <form id="doc-form" onSubmit={(e) => { void form.handleSubmit(handleFormSubmit)(e); }} className="grid gap-6 lg:grid-cols-[1fr_350px]">
                <Card className="border-muted/40 shadow-sm overflow-hidden h-fit">
                <CardHeader className="pb-4 border-b bg-muted/5">
                    <CardTitle className="text-xl">Document Information</CardTitle>
                    <CardDescription>
                        {mode === 'create' ? 'Enter document details and upload a file to index.' : 'Update document metadata and view chunks.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                            {/* Name Field */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="mb-6">
                                        <FormLabel className="text-foreground/80 ml-0.5">
                                            Document Title <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g. Employee Handbook"
                                                className="transition-all"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Description Field */}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem className="mb-6">
                                        <FormLabel className="text-foreground/80 ml-0.5">
                                            Description <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Brief description of what this document contains..."
                                                className="min-h-[80px] transition-all resize-y"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Labels Field */}
                            <FormField
                                control={form.control}
                                name="labels"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col mb-6">
                                        <FormLabel className="text-foreground/80 ml-0.5">Labels</FormLabel>
                                        <FormControl>
                                            <MultiSelectFilter
                                                options={existingLabels}
                                                selectedValues={field.value || []}
                                                onSelectionChange={(values) => form.setValue('labels', values)}
                                                placeholder="Select labels..."
                                                searchPlaceholder="Search or create label..."
                                                emptyMessage="No existing label found."
                                                multiSelect={true}
                                                width="w-full"
                                                allowCreate={true}
                                                onCreateOption={(newLabel) => {
                                                    if (!existingLabels.includes(newLabel)) {
                                                        setExistingLabels([...existingLabels, newLabel]);
                                                    }
                                                }}
                                                showSelectedBadges={true}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Visibility Field */}
                            <FormField
                                control={form.control}
                                name="visibility"
                                render={({ field }) => (
                                    <FormItem className="mb-6">
                                        <FormLabel className="text-foreground/80 ml-0.5">
                                            Visibility <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                className="flex flex-col space-y-2"
                                            >
                                                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
                                                    <RadioGroupItem value={DocumentVisibilityEnum.PRIVATE} id="private" />
                                                    <Label htmlFor="private" className="flex-1 cursor-pointer">
                                                        <div className="flex items-center gap-2">
                                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                            <span className="font-medium">Private</span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mt-1">Only you can access this document</p>
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
                                                    <RadioGroupItem value={DocumentVisibilityEnum.PUBLIC} id="public" />
                                                    <Label htmlFor="public" className="flex-1 cursor-pointer">
                                                        <div className="flex items-center gap-2">
                                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                                            <span className="font-medium">Public</span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mt-1">Anyone can view this document</p>
                                                    </Label>
                                                </div>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Separator className="my-6" />

                            {mode === 'create' && (
                                <div 
                                    className={cn(
                                        "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer bg-muted/5 mb-6 relative overflow-hidden",
                                        dragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/10",
                                        isProcessing && "pointer-events-none"
                                    )}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => void handleDrop(e)}
                                    onClick={() => !isProcessing && document.getElementById('file-upload')?.click()}
                                >
                                    <input 
                                        type="file" 
                                        id="file-upload" 
                                        className="hidden" 
                                        accept=".pdf,.docx,.txt"
                                        onChange={(e) => void handleFileUpload(e)}
                                    />
                                    
                                    {isProcessing ? (
                                        <div className="w-full max-w-xs flex flex-col items-center space-y-3 z-10">
                                            <div className="flex items-center gap-3">
                                                <Loader2 className="h-6 w-6 text-primary animate-spin" />
                                                <span className="font-semibold text-sm">Processing Document...</span>
                                            </div>
                                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-primary transition-all duration-300 ease-out"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">{progress}% Complete</p>
                                        </div>
                                    ) : (
                                        <>
                                            <UploadCloud className="h-10 w-10 text-muted-foreground mb-3" />
                                            <h3 className="text-sm font-semibold">
                                                Click to upload or drag and drop
                                            </h3>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                PDF, DOCX, or TXT (Max 10MB)
                                            </p>
                                            <p className="text-[10px] mt-4 rounded-full bg-primary/5 px-3 py-1 text-primary border border-primary/10">
                                                Document will be automatically chunked for semantic search.
                                            </p>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Chunks Display */}
                            <ChunkViewer chunks={chunks} mode={mode} />
                </CardContent>
                </Card>

            <div className="space-y-6">
                
                <Card className="border-muted/40 shadow-sm overflow-hidden">
                    <CardHeader className="pb-4 border-b bg-muted/5">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                            Metadata & Tags
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">

                        {mode === 'edit' && (
                            <>
                                <Separator className="bg-muted/40" />
                                <div className="space-y-1.5">
                                    <span className="text-xs font-medium text-muted-foreground uppercase">Status</span>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={(initialData?.metadata?.status as string) === 'indexed' ? 'default' : 'secondary'} className="capitalize">
                                            {(initialData?.metadata?.status as string) || 'Unknown'}
                                        </Badge>
                                        <div className={`w-2 h-2 rounded-full ${(initialData?.metadata?.status as string) === 'indexed' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <span className="text-xs font-medium text-muted-foreground uppercase">Chunks</span>
                                    <div className="text-sm font-semibold flex items-center gap-2">
                                        <div className="p-1 px-2 rounded bg-primary/10 text-primary border border-primary/20">
                                            {(initialData?.metadata?.chunk_count as number) || 0} segments
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                        
                        <Separator className="bg-muted/40" />
                        
                        <div className="space-y-1.5">
                            <span className="text-xs font-medium text-muted-foreground uppercase">Size Estimate</span>
                            <div className="text-sm font-medium">
                                {initialData?.size ? `${(initialData.size / 1024).toFixed(1)} KB` : chunks.length > 0 ? `~${(chunks.reduce((sum, c) => sum + c.metadata.characterCount, 0) / 1024).toFixed(1)} KB` : 'N/A'}
                            </div>
                        </div>
                        
                        <div className="space-y-1.5 font-mono text-[10px] break-all text-muted-foreground leading-relaxed pt-2">
                            {mode === 'edit' && (
                                <div className="flex justify-between">
                                    <span>ID:</span>
                                    <span>{initialData?._id}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span>Created:</span>
                                <span>{initialData?.created_at ? new Date(initialData.created_at).toLocaleDateString() : 'New'}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex flex-col gap-3 pt-2">
                    <Button form="doc-form" type="submit" variant="gradient" disabled={isLoading || isProcessing} size="lg" className="w-full shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {mode === 'create' ? 'Creating...' : 'Saving...'}
                            </>
                        ) : (
                            <>
                                {mode === 'create' ? <Plus className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                {mode === 'create' ? 'Create Document' : 'Save Changes'}
                            </>
                        )}
                    </Button>
                    <Link href="/documents" className="w-full">
                        <Button variant="ghost" className="w-full">Cancel</Button>
                    </Link>
                </div>
            </div>
            </form>
        </Form>
    );
}
