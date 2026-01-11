import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { typography } from '@/constants/design-tokens';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    permission?: string;
    variant?: 'default' | 'gradient' | 'outline';
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = ''
}: EmptyStateProps) {
  const actionButton = action && (
    <Button
      onClick={action.onClick}
      variant={action.variant || 'gradient'}
      size="lg"
      className="mt-6 animate-fade-in-up shadow-lg hover:shadow-xl transition-all duration-300"
    >
      {action.label}
    </Button>
  );

  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-16 px-4 text-center',
      'animate-fade-in',
      className
    )}>
      <div className={cn(
        'w-20 h-20 sm:w-24 sm:h-24 rounded-full',
        'bg-gradient-to-br from-primary/10 via-primary/5 to-transparent',
        'border border-primary/20',
        'flex items-center justify-center mb-6',
        'animate-scale-in',
        'shadow-lg shadow-primary/5'
      )}>
        <Icon className={cn(
          'w-10 h-10 sm:w-12 sm:h-12',
          'text-primary/70',
          'animate-float'
        )} />
      </div>

      <h3 className={cn(
        typography.sectionTitle,
        'mb-3 animate-fade-in-up',
        'bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text'
      )}>
        {title}
      </h3>

      <p className={cn(
        typography.mutedSmall,
        'max-w-md mb-2 animate-fade-in-up',
        'leading-relaxed'
      )}>
        {description}
      </p>

      {action && (
        action.permission ? (
          <PermissionGuard permission={action.permission}>
            {actionButton}
          </PermissionGuard>
        ) : (
          actionButton
        )
      )}
    </div>
  );
}
