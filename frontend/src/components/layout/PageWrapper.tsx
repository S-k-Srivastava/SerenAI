import React from "react";
import { cn } from "@/lib/utils";

interface PageWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PageWrapper({
  children,
  className,
  ...props
}: PageWrapperProps) {
  return (
    <div
      className={cn(
        "w-full lg:px-6 lg:py-4 md:px-4 md:py-4 px-4 py-2 animate-in fade-in duration-500",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
