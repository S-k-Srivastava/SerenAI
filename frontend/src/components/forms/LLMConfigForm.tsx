'use client';

import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { llmConfigSchema, LLMConfigFormValues } from '@/schemas/llmconfig.schema';
import { modelConfigService } from '@/lib/api/services/modelConfigService';
import { LLMProviderEnum, IProviderOption } from '@/types/llmconfig';

export type { LLMConfigFormValues };

interface LLMConfigFormProps {
    initialData?: {
        model_name?: string;
        provider?: LLMProviderEnum;
        api_key?: string;
        base_url?: string;
    };
    onSubmit: (data: LLMConfigFormValues) => Promise<void>;
    isLoading: boolean;
    mode: 'create' | 'edit';
}

export function LLMConfigForm({ initialData, onSubmit, isLoading, mode }: LLMConfigFormProps) {
    const form = useForm<LLMConfigFormValues>({
        resolver: zodResolver(llmConfigSchema),
        defaultValues: {
            model_name: '',
            provider: LLMProviderEnum.OPENAI,
            api_key: '',
            base_url: '',
        },
    });

    // Reset form with initialData when it becomes available
    useEffect(() => {
        if (initialData) {
            form.reset({
                model_name: initialData.model_name || '',
                provider: initialData.provider || LLMProviderEnum.OPENAI,
                api_key: initialData.api_key || '',
                base_url: initialData.base_url || '',
            });
        }
    }, [initialData, form]);

    // Fetch available providers and their field requirements
    const { data: modelConfigs } = useQuery({
        queryKey: ['model-configs'],
        queryFn: modelConfigService.getPublicModelConfigs,
    });

    const selectedProvider = useWatch({
        control: form.control,
        name: 'provider',
    });
    const selectedProviderConfig: IProviderOption | undefined = modelConfigs?.llmProviders.find(
        (p) => p.value === selectedProvider
    );

    const handleSubmit = async (data: LLMConfigFormValues) => {
        await onSubmit(data);
    };

    return (
        <Form {...form}>
            <form onSubmit={(e) => { void form.handleSubmit(handleSubmit)(e); }} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Configuration Details</CardTitle>
                        <CardDescription>
                            {mode === 'create'
                                ? 'Configure your AI model connection'
                                : 'Update your AI model configuration'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="model_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Model Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g., gpt-4, gpt-3.5-turbo"
                                            {...field}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Enter the exact model name from your provider
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="provider"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Provider</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        disabled={isLoading}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a provider" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {modelConfigs?.llmProviders.map((provider) => (
                                                <SelectItem key={provider.value} value={provider.value}>
                                                    {provider.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        {selectedProviderConfig?.description || 'Select a provider to see details'}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Dynamically render fields based on selected provider */}
                        {selectedProviderConfig?.fields && Object.entries(selectedProviderConfig.fields).map(([fieldName, fieldConfig]) => (
                            <FormField
                                key={fieldName}
                                control={form.control}
                                name={fieldName as keyof LLMConfigFormValues}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {fieldConfig.label}
                                            {fieldConfig.required && <span className="text-destructive ml-1">*</span>}
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type={fieldConfig.type}
                                                placeholder={fieldConfig.placeholder}
                                                {...field}
                                                disabled={isLoading}
                                            />
                                        </FormControl>
                                        {fieldConfig.helpText && (
                                            <FormDescription>
                                                {fieldConfig.helpText}
                                            </FormDescription>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ))}
                    </CardContent>
                    <CardFooter className="flex items-center justify-end gap-3 border-t pt-6">
                        <Link href="/llmconfigs">
                            <Button type="button" variant="ghost" disabled={isLoading}>
                                Cancel
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            variant="gradient"
                            size="lg"
                            disabled={isLoading}
                            className="min-w-[140px]"
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {mode === 'create' ? 'Create Configuration' : 'Save Changes'}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    );
}
