/**
 * Design System Tokens
 * Centralized design constants for consistency across the application
 */

// ============================================================================
// SPACING SYSTEM
// ============================================================================

export const spacing = {
  // Vertical spacing between sections
  section: 'gap-6',          // 24px - Cards, forms
  sectionLg: 'gap-8',        // 32px - Major page sections
  sectionSm: 'gap-4',        // 16px - Compact sections

  // Component padding
  cardPadding: 'p-6',        // 24px - Standard cards
  cardPaddingSm: 'p-4',      // 16px - Compact cards
  cardPaddingLg: 'p-8',      // 32px - Feature sections

  // Text spacing
  headingMargin: 'mb-6',     // 24px
  paragraphMargin: 'mb-4',   // 16px

  // Page padding
  pagePadding: 'p-6 lg:p-8', // Responsive page padding
  pagePaddingX: 'px-6 lg:px-8',
  pagePaddingY: 'py-6 lg:py-8',
} as const;

// ============================================================================
// ICON SIZE SYSTEM
// ============================================================================

export const iconSizes = {
  xs: 'w-3.5 h-3.5',   // 14px - Inline badges, small UI elements
  sm: 'w-4 h-4',       // 16px - Buttons, inputs, navigation items
  md: 'w-5 h-5',       // 20px - Headers, sidebar icons
  lg: 'w-6 h-6',       // 24px - Feature cards, page icons
  xl: 'w-8 h-8',       // 32px - Page headers, large actions
  '2xl': 'w-12 h-12',  // 48px - Empty states, hero sections
  '3xl': 'w-16 h-16',  // 64px - Landing page features
} as const;

// Responsive icon sizes
export const responsiveIconSizes = {
  sm: 'w-4 h-4 sm:w-5 sm:h-5',           // Small to medium
  md: 'w-5 h-5 sm:w-6 sm:h-6',           // Medium to large
  lg: 'w-6 h-6 sm:w-8 sm:h-8',           // Large to extra large
} as const;

// ============================================================================
// BORDER RADIUS SYSTEM
// ============================================================================

export const borderRadius = {
  sm: 'rounded-sm',      // 6px - Badges, small elements
  md: 'rounded-md',      // 6px - Inputs, buttons
  lg: 'rounded-lg',      // 8px - Cards, dialogs
  xl: 'rounded-xl',      // 12px - Feature sections
  '2xl': 'rounded-2xl',  // 16px - Hero sections
  full: 'rounded-full',  // Avatars, pills
} as const;

// ============================================================================
// SHADOW SYSTEM
// ============================================================================

export const shadows = {
  none: 'shadow-none',
  sm: 'shadow-sm',                                    // Subtle cards
  md: 'shadow-md',                                    // Elevated cards
  lg: 'shadow-lg',                                    // Modals, popovers
  hover: 'hover:shadow-md transition-shadow',        // Interactive cards
  elevated: 'shadow-md hover:shadow-lg transition-shadow',
} as const;

// ============================================================================
// TRANSITION SYSTEM
// ============================================================================

export const transitions = {
  default: 'transition-all duration-200',
  fast: 'transition-all duration-150',
  slow: 'transition-all duration-300',
  colors: 'transition-colors duration-200',
  transform: 'transition-transform duration-200',
  shadow: 'transition-shadow duration-200',
  all: 'transition-all duration-200 ease-in-out',
} as const;

// ============================================================================
// GRID SYSTEM
// ============================================================================

export const grids = {
  // Resource grids (chatbots, documents, etc.)
  resource: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
  resourceCompact: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',

  // Dashboard stats
  stats: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6',

  // Form layouts
  formTwoCol: 'grid grid-cols-1 md:grid-cols-2 gap-6',
  formWithSidebar: 'grid gap-6 lg:grid-cols-[1fr_350px]',
} as const;

// ============================================================================
// TYPOGRAPHY SYSTEM
// ============================================================================

export const typography = {
  // Page titles
  pageTitle: 'text-3xl font-bold tracking-tight',
  sectionTitle: 'text-2xl font-bold tracking-tight',
  cardTitle: 'text-xl font-semibold',

  // Body text
  body: 'text-base',
  bodyLarge: 'text-lg',
  bodySmall: 'text-sm',
  caption: 'text-xs',

  // Muted text
  muted: 'text-muted-foreground',
  mutedSmall: 'text-sm text-muted-foreground',
} as const;

// ============================================================================
// COLOR USAGE GUIDELINES
// ============================================================================

export const colorUsage = {
  // Semantic colors
  primary: 'bg-primary text-primary-foreground',            // Main CTAs
  primaryHover: 'hover:bg-primary/90',
  primaryGradient: 'bg-gradient-to-r from-primary via-primary-light to-primary', // Hero CTAs

  secondary: 'bg-secondary text-secondary-foreground',      // Secondary actions

  // Status colors
  success: 'bg-success text-success-foreground',            // Active, indexed, completed
  successLight: 'bg-success/10 text-success border-success/20',

  warning: 'bg-warning text-warning-foreground',            // Pending, processing
  warningLight: 'bg-warning/10 text-warning border-warning/20',

  destructive: 'bg-destructive text-destructive-foreground', // Errors, delete
  destructiveLight: 'bg-destructive/10 text-destructive border-destructive/20',

  info: 'bg-info text-info-foreground',                     // Informational only
  infoLight: 'bg-info/10 text-info border-info/20',

  // Muted/inactive
  muted: 'bg-muted text-muted-foreground',
  mutedLight: 'bg-muted/50 text-muted-foreground',
} as const;

// ============================================================================
// BUTTON VARIANT GUIDELINES
// ============================================================================

export const buttonVariants = {
  // When to use each variant
  gradient: 'Primary CTAs (Login, Register, Create, Save)',
  default: 'Secondary actions (Apply Filter, Refresh)',
  outline: 'Tertiary actions (Cancel, Back)',
  ghost: 'Inline actions (Edit, Delete in table rows)',
  destructive: 'Dangerous actions (Delete in confirmation dialogs)',
  link: 'Text links (Learn More, View Details)',
} as const;

// ============================================================================
// RESPONSIVE BREAKPOINTS
// ============================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ============================================================================
// Z-INDEX SYSTEM
// ============================================================================

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

// ============================================================================
// ANIMATION GUIDELINES
// ============================================================================

export const animations = {
  // When to use animations
  pageLoad: 'animate-fade-in-up',           // Page entrances
  cardHover: 'hover:scale-[1.02] transition-transform',
  buttonHover: 'hover:opacity-90 transition-opacity',
  slideIn: 'animate-slide-in-right',        // Sidebar, drawers
  fadeIn: 'animate-fade-in',                // Content reveals
} as const;

// ============================================================================
// ACCESSIBILITY
// ============================================================================

export const accessibility = {
  // Focus states
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
  focusVisible: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',

  // Skip to content
  srOnly: 'sr-only',
  notSrOnly: 'not-sr-only',
} as const;

// ============================================================================
// EXPORT ALL
// ============================================================================

export const designTokens = {
  spacing,
  iconSizes,
  responsiveIconSizes,
  borderRadius,
  shadows,
  transitions,
  grids,
  typography,
  colorUsage,
  buttonVariants,
  breakpoints,
  zIndex,
  animations,
  accessibility,
} as const;

export default designTokens;
