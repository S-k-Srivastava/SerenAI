import React, { ReactNode } from 'react';
import Link from 'next/link';
import { LucideIcon, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { iconSizes, typography } from '@/constants/design-tokens';

interface PageHeaderProps {
  icon: LucideIcon;
  iconColor?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal';
  title: string;
  description: string;
  backLink?: string;
  actions?: ReactNode;
  className?: string;
}

const iconColorClasses = {
  blue: 'bg-info/10 text-info',
  green: 'bg-success/10 text-success',
  purple: 'bg-primary/10 text-primary', // Remapped purple to primary
  orange: 'bg-warning/10 text-warning',
  red: 'bg-destructive/10 text-destructive',
  teal: 'bg-primary/10 text-primary', // Teal is now primary
};

export function PageHeader({
  icon: Icon,
  iconColor = 'blue',
  title,
  description,
  backLink,
  actions,
  className = ''
}: PageHeaderProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {backLink && (
        <Link
          href={backLink}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back
        </Link>
      )}

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className={cn(
            'h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0',
            iconColorClasses[iconColor]
          )}>
            <Icon className={iconSizes.lg} />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className={cn(typography.pageTitle, 'mb-1')}>
              {title}
            </h1>
            <p className={typography.mutedSmall}>
              {description}
            </p>
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
