"use client"

import React from "react"
import {
    Menu,
    User,
    ChevronRight,
    LayoutDashboard,
    Database,
    MessageSquare,
    Settings,
    Shield,
    CreditCard,
    ArrowLeft,
    Mail,
    HelpCircle,
    type LucideIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { usePathname, useRouter } from "next/navigation"
import { useResourceName } from "@/context/ResourceNameContext"
import { cn } from "@/lib/utils"

/**
 * Route label mappings for breadcrumb generation
 */
const ROUTE_LABELS: Record<string, string> = {
    'chatbots': 'Chatbots',
    'documents': 'Documents',
    'llmconfigs': 'LLM Configs',
    'llm-configs': 'LLM Profiles',
    'create': 'Create',
    'edit': 'Edit',
    'dashboard': 'Dashboard',
    'chat': 'Chats',
    'chats': 'Chats',
    'profile': 'Account',
    'admin': 'Admin',
    'users': 'Users',
    'roles': 'Roles',
    'subscriptions': 'Subscriptions',
    'plans': 'Plans',
    'contactus': 'Contact Submissions',
    'help': 'Help Center'
};

/**
 * Route icon mappings for breadcrumb generation
 */
const ROUTE_ICONS: Record<string, LucideIcon> = {
    'chatbots': MessageSquare,
    'documents': Database,
    'llmconfigs': Settings,
    'llm-configs': Settings,
    'dashboard': LayoutDashboard,
    'chat': MessageSquare,
    'chats': MessageSquare,
    'profile': User,
    'admin': Shield,
    'users': User,
    'roles': Shield,
    'subscriptions': CreditCard,
    'plans': CreditCard,
    'contactus': Mail,
    'help': HelpCircle
};

/**
 * Breadcrumb item interface
 */
interface BreadcrumbItem {
    label: string;
    icon?: LucideIcon;
    path?: string;
    isLast?: boolean;
}

interface HeaderProps {
    title?: string;
    subtitle?: string;
    avatar?: React.ReactNode;
    showStatus?: boolean;
    actions?: React.ReactNode;
    onMobileMenuToggle?: () => void;
    className?: string;
}

/**
 * Check if a segment is an ID (MongoDB ObjectId or UUID)
 */
const isIdSegment = (segment: string): boolean => {
    return (
        segment.length > 20 ||
        /^[0-9a-fA-F-]{36}$/.test(segment) ||
        /^[0-9a-fA-F]{24}$/.test(segment)
    );
};

/**
 * Get singular form of a resource name
 */
const getSingularForm = (resource: string): string => {
    if (resource.endsWith('s')) {
        return resource.slice(0, -1);
    }
    return resource;
};

export const Header: React.FC<HeaderProps> = ({
    title,
    actions,
    onMobileMenuToggle,
    className
}) => {
    const pathname = usePathname();
    const router = useRouter();
    const { resourceName } = useResourceName();

    /**
     * Generate dynamic breadcrumbs from the current pathname
     * Examples:
     * - /chatbots -> [Chatbots]
     * - /chatbots/create -> [Chatbots, Create Chatbot]
     * - /chatbots/{id}/edit -> [Chatbots, Edit "Bot Name"]
     * - /admin/users -> [Admin, Users]
     * - /admin/users/{id}/edit -> [Admin, Users, Edit "User Email"]
     */
    const generateBreadcrumbs = (): BreadcrumbItem[] => {
        const segments = pathname.split('/').filter(Boolean);

        if (segments.length === 0) {
            return [{ label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' }];
        }

        const breadcrumbs: BreadcrumbItem[] = [];
        let currentPath = '';
        let skipNext = false;

        for (let i = 0; i < segments.length; i++) {
            if (skipNext) {
                skipNext = false;
                continue;
            }

            const segment = segments[i];
            const nextSegment = segments[i + 1];
            const isLast = i === segments.length - 1;
            currentPath += `/${segment}`;

            // Handle ID segments
            if (isIdSegment(segment)) {
                // ID segments are not shown as separate breadcrumbs
                // They're combined with edit/create actions
                continue;
            }

            // Handle 'create' action
            if (segment === 'create') {
                const prevSegment = segments[i - 1];
                const parentResource = ROUTE_LABELS[prevSegment] || prevSegment;
                const singularResource = getSingularForm(parentResource);

                breadcrumbs.push({
                    label: `Create ${singularResource}`,
                    path: currentPath,
                    isLast: true
                });
                continue;
            }

            // Handle 'edit' action
            if (segment === 'edit') {
                const prevSegment = segments[i - 1];

                // Check if previous segment is an ID
                if (isIdSegment(prevSegment)) {
                    // Find the resource type (segment before the ID)
                    const resourceTypeSegment = segments[i - 2];
                    const resourceType = ROUTE_LABELS[resourceTypeSegment] || resourceTypeSegment;
                    const singularResource = getSingularForm(resourceType);

                    // Use resourceName if available, otherwise use title or generic name
                    const displayName = resourceName || title || singularResource;

                    breadcrumbs.push({
                        label: `Edit ${displayName}`,
                        path: currentPath,
                        isLast: true
                    });
                } else {
                    // Direct edit without ID (shouldn't happen, but handle it)
                    const resourceType = ROUTE_LABELS[prevSegment] || prevSegment;
                    const singularResource = getSingularForm(resourceType);

                    breadcrumbs.push({
                        label: `Edit ${singularResource}`,
                        path: currentPath,
                        isLast: true
                    });
                }
                continue;
            }

            // Handle regular route segments
            if (ROUTE_LABELS[segment]) {
                const Icon = ROUTE_ICONS[segment];

                // Check if next segment is an ID followed by edit/create
                const isParentOfIdEdit = nextSegment && isIdSegment(nextSegment) &&
                    (segments[i + 2] === 'edit' || segments[i + 2] === 'create');

                // Check if next segment is create
                const isParentOfCreate = nextSegment === 'create';

                // Override path for 'chat' to point to '/chats'
                let crumbPath = currentPath;
                if (segment === 'chat') {
                    crumbPath = '/chats';
                }

                breadcrumbs.push({
                    label: ROUTE_LABELS[segment],
                    icon: Icon,
                    path: crumbPath,
                    // Mark as not last if it has children (create/edit) or if it's the chat parent of a detail page
                    isLast: !isParentOfIdEdit && !isParentOfCreate && isLast
                });
            }
        }

        // Check if we ended on an ID segment (which was skipped)
        const lastSegment = segments[segments.length - 1];
        if (segments.length > 0 && isIdSegment(lastSegment) && title) {
            breadcrumbs.push({
                label: title,
                path: pathname, // Current page
                isLast: true
            });
        }

        return breadcrumbs;
    };

    const breadcrumbs = generateBreadcrumbs();

    /**
     * Handle back navigation
     */
    const handleBack = () => {
        if (breadcrumbs.length > 1) {
            const previousBreadcrumb = breadcrumbs[breadcrumbs.length - 2];
            if (previousBreadcrumb.path) {
                router.push(previousBreadcrumb.path);
            } else {
                router.back();
            }
        } else {
            router.back();
        }
    };

    /**
     * Handle breadcrumb click navigation
     */
    const handleBreadcrumbClick = (crumb: BreadcrumbItem) => {
        if (!crumb.isLast && crumb.path) {
            router.push(crumb.path);
        }
    };

    return (
        <header className={cn("h-16 flex items-center justify-between px-4 sm:px-6 border-b border-border bg-background/95 backdrop-blur-sm z-20 shrink-0 sticky top-0 w-full", className)}>
            <div className="flex items-center gap-3 overflow-hidden flex-1">
                {/* Mobile menu toggle */}
                <Button
                    variant="ghost-premium"
                    size="icon"
                    className="lg:hidden shrink-0"
                    onClick={onMobileMenuToggle}
                >
                    <Menu className="w-5 h-5" />
                </Button>

                {/* Back button - shown when not on dashboard */}
                {breadcrumbs.length > 1 && (
                    <Button
                        variant="ghost-premium"
                        size="icon"
                        className="hidden sm:flex shrink-0 h-9 w-9 transition-all duration-200"
                        onClick={handleBack}
                        title="Go back"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                )}

                {/* Breadcrumb navigation */}
                <nav className="flex items-center gap-1.5 sm:gap-2 overflow-hidden min-w-0" aria-label="Breadcrumb">
                    {breadcrumbs.map((crumb, index) => {
                        const isLast = index === breadcrumbs.length - 1;
                        const isClickable = !isLast && crumb.path;

                        return (
                            <div
                                key={`${crumb.path}-${index}`}
                                className={cn(
                                    "flex items-center gap-1.5 sm:gap-2 text-sm",
                                    isLast ? 'min-w-0 overflow-hidden' : 'shrink-0'
                                )}
                            >
                                {/* Separator */}
                                {index > 0 && (
                                    <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground/40 shrink-0" />
                                )}

                                {/* Breadcrumb item */}
                                <button
                                    onClick={() => handleBreadcrumbClick(crumb)}
                                    disabled={!isClickable}
                                    className={cn(
                                        "flex items-center gap-1.5 sm:gap-2 transition-all duration-200",
                                        "focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-md px-1.5 py-1",
                                        isLast && 'min-w-0 font-semibold text-foreground cursor-default',
                                        !isLast && 'text-muted-foreground',
                                        isClickable && 'hover:text-primary hover:bg-muted/50 cursor-pointer',
                                        !isClickable && 'cursor-default'
                                    )}
                                    aria-current={isLast ? 'page' : undefined}
                                >
                                    {/* Icon */}
                                    {crumb.icon && <crumb.icon className="w-4 h-4 shrink-0" />}

                                    {/* Label */}
                                    <span className={cn(
                                        isLast ? "truncate" : "whitespace-nowrap",
                                        "text-xs sm:text-sm"
                                    )}>
                                        {crumb.label}
                                    </span>
                                </button>
                            </div>
                        );
                    })}
                </nav>
            </div>

            {/* Right section: Actions + Theme Toggle */}
            <div className="flex items-center gap-2 shrink-0 ml-4">
                {actions && <div className="hidden sm:flex">{actions}</div>}
                <div className="h-4 w-[1px] bg-border/60 mx-1 hidden sm:block"></div>
                <ThemeToggle />
            </div>
        </header>
    )
}
