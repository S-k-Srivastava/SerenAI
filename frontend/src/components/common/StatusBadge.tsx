import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type ChatbotStatus = 'active' | 'inactive';
type DocumentStatus = 'indexed' | 'processing' | 'failed' | 'pending';
type LLMProvider = 'openai' | 'anthropic' | 'gemini';
type GenericStatus = 'success' | 'warning' | 'error' | 'info' | 'default';

interface StatusBadgeProps {
  status: string;
  type: 'chatbot' | 'document' | 'llm-config' | 'generic';
  className?: string;
}

const getStatusStyles = (status: string, type: string): string => {
  // Normalize status to lowercase
  const normalizedStatus = status.toLowerCase();

  if (type === 'chatbot') {
    switch (normalizedStatus as ChatbotStatus) {
      case 'active':
        return 'bg-success/10 text-success border-success/20 hover:bg-success/20';
      case 'inactive':
        return 'bg-muted text-muted-foreground border-muted hover:bg-muted/80';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  }

  if (type === 'document') {
    switch (normalizedStatus as DocumentStatus) {
      case 'indexed':
        return 'bg-success/10 text-success border-success/20 hover:bg-success/20';
      case 'processing':
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20';
      case 'failed':
        return 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  }

  if (type === 'llm-config') {
    switch (normalizedStatus as LLMProvider) {
      case 'openai':
        return 'bg-success/10 text-success border-success/20 hover:bg-success/20';
      case 'anthropic':
        return 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20';
      case 'gemini':
        return 'bg-info/10 text-info border-info/20 hover:bg-info/20';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  }

  // Generic status
  switch (normalizedStatus as GenericStatus) {
    case 'success':
      return 'bg-success/10 text-success border-success/20 hover:bg-success/20';
    case 'warning':
      return 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20';
    case 'error':
      return 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20';
    case 'info':
      return 'bg-info/10 text-info border-info/20 hover:bg-info/20';
    default:
      return 'bg-muted text-muted-foreground border-muted';
  }
};

const formatStatusText = (status: string): string => {
  // Capitalize first letter
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export function StatusBadge({ status, type, className }: StatusBadgeProps) {
  const styles = getStatusStyles(status, type);

  return (
    <Badge
      variant="outline"
      className={cn(
        'px-3 py-1 text-xs font-medium transition-colors',
        styles,
        className
      )}
    >
      {formatStatusText(status)}
    </Badge>
  );
}
