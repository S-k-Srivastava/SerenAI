import React from 'react';
import { cn } from '@/lib/utils';
import { PremiumLoader } from '@/components/ui/PremiumLoader';

interface LoadingStateProps {
  message?: string;
  fullPage?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function LoadingState({
  message,
  fullPage = false,
  size = 'md',
  className = ''
}: LoadingStateProps) {
  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center gap-4',
      fullPage && 'min-h-[400px]',
      'animate-fade-in',
      className
    )}>
      <PremiumLoader 
        size={size} 
        text={message}
      />
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex-1 flex items-center justify-center w-full min-h-[400px]">
        {content}
      </div>
    );
  }

  return content;
}
