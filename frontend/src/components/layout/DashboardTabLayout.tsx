import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Search, Plus, ChevronLeft, ChevronRight, LayoutGrid, List } from "lucide-react";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Pagination } from "@/components/common/Pagination";
import { useViewMode } from "@/context/ViewModeContext";
import { cn } from "@/lib/utils";
import React from "react";

interface DashboardTabLayoutProps {
  title: string | React.ReactNode;
  description?: string;
  icon?: React.ElementType;
  iconColor?: string;
  // Props for internal action management
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  refresh?: {
    onRefresh: () => void;
    isRefreshing?: boolean;
  };
  create?: {
    label: string;
    href?: string;
    onClick?: () => void;
    permission: string;
  };
  // Deprecated but kept for backward compatibility if needed, though we aim to replace it
  headerActions?: React.ReactNode;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
    totalItems?: number;
  };
  children: React.ReactNode;
  showViewModeToggle?: boolean;
}

export function DashboardTabLayout({
  title,
  description,
  icon: Icon,
  iconColor,
  search,
  refresh,
  create,
  headerActions,
  children,
  pagination,
  showViewModeToggle = true,
}: DashboardTabLayoutProps) {
  const { viewMode, setViewMode } = useViewMode();

  return (
    <PageWrapper className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header Section - Fully Responsive */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-5 lg:mb-6 shrink-0">
        {/* Title Section */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Optional Icon Box */}
            {Icon && (
               <div className={cn(
                  "h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center transition-colors",
                  iconColor || "bg-primary/10 text-primary"
               )}>
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
               </div>
            )}
            <div>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {title}
                </h1>
                {typeof pagination?.totalItems === 'number' && (
                  <Badge
                    variant="secondary"
                    className="h-5 sm:h-6 px-1.5 sm:px-2 text-[10px] sm:text-xs font-semibold bg-primary/10 text-primary border-primary/20"
                  >
                    {pagination.totalItems}
                  </Badge>
                )}
              </div>
              {description && (
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions Column - Mobile/Tablet: Full Width, Desktop: Auto Width */}
        <div className="flex flex-col w-full lg:w-auto gap-2">
          <div className="flex flex-row gap-2 items-center">
            {/* Search Bar - Responsive Width */}
            {search && (
              <div className="relative flex-1 lg:w-72 transition-all">
                <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                <Input
                  placeholder={search.placeholder || "Search..."}
                  className="pl-8 sm:pl-10 h-9 sm:h-10 bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-colors text-sm"
                  value={search.value}
                  onChange={(e) => search.onChange(e.target.value)}
                />
              </div>
            )}

            {/* Refresh Button - Responsive Size */}
            {refresh && (
              <Button
                variant="outline-premium"
                size="icon"
                onClick={refresh.onRefresh}
                className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 p-0 rounded-lg"
                disabled={refresh.isRefreshing}
              >
                <RefreshCw
                  className={cn(
                    "h-3.5 w-3.5 sm:h-4 sm:w-4",
                    refresh.isRefreshing && "animate-spin"
                  )}
                />
              </Button>
            )}

            {/* View Mode Toggle */}
            {showViewModeToggle && (
              <div className="flex items-center gap-1 bg-background/50 border border-muted-foreground/20 rounded-lg p-1 shrink-0 h-9 sm:h-10">
                <Button
                  variant={viewMode === 'grid' ? "secondary" : "ghost-premium"}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "h-7 w-7 sm:h-8 sm:w-8 transition-all p-0",
                    viewMode === 'grid' ? "bg-primary/10 text-primary hover:bg-primary/20" : ""
                  )}
                  title="Grid View"
                >
                  <LayoutGrid className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  variant={viewMode === 'table' ? "secondary" : "ghost-premium"}
                  size="icon"
                  onClick={() => setViewMode('table')}
                  className={cn(
                    "h-7 w-7 sm:h-8 sm:w-8 transition-all p-0",
                    viewMode === 'table' ? "bg-primary/10 text-primary hover:bg-primary/20" : ""
                  )}
                  title="Table View"
                >
                  <List className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </div>
            )}

            {/* Create Button - Inline with Search & Refresh on All Screens */}
            {create && (
              <PermissionGuard permission={create.permission}>
                {create.href ? (
                  <Link href={create.href} className="shrink-0">
                    <Button className="shadow-lg transition-all h-9 sm:h-10 px-3 sm:px-4 text-sm">
                      <Plus className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">{create.label}</span>
                    </Button>
                  </Link>
                ) : (
                  <Button
                    className="shadow-lg transition-all h-9 sm:h-10 px-3 sm:px-4 text-sm"
                    onClick={create.onClick}
                  >
                    <Plus className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">{create.label}</span>
                  </Button>
                )}
              </PermissionGuard>
            )}

            {/* Fallback for custom actions */}
            {headerActions}
          </div>

          {/* Concise Mobile/Tablet Pagination - Below Search Bar */}
          {pagination && (
            <div className="flex md:hidden items-center justify-end gap-2">
              <Button
                variant="outline-premium"
                size="icon"
                onClick={() => pagination.onPageChange(Math.max(1, pagination.currentPage - 1))}
                disabled={pagination.currentPage === 1 || pagination.isLoading}
                className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-lg"
              >
                <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
              <span className="text-xs sm:text-sm text-muted-foreground font-medium px-1.5 sm:px-2">
                {pagination.currentPage} / {pagination.totalPages}
              </span>
              <Button
                variant="outline-premium"
                size="icon"
                onClick={() => pagination.onPageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
                disabled={pagination.currentPage === pagination.totalPages || pagination.isLoading}
                className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-lg"
              >
                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 w-full min-h-0 overflow-y-auto p-1">
         <div className="pb-4">{children}</div>
      </div>

      {/* Pagination - Sticky bottom - Hidden on mobile as concise version is shown above */}
      {pagination && (
        <div className="shrink-0 border-t border-border/40 hidden md:block md:pt-4 pt-2">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
            isLoading={pagination.isLoading}
            totalItems={pagination.totalItems}
          />
        </div>
      )}
    </PageWrapper>
  );
}
