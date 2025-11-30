// Accessibility utilities for Relief Connect
// Ensures WCAG 2.1 AA compliance

/**
 * Generate accessible ARIA labels for form fields
 */
export function generateAriaLabel(
  label: string, 
  required: boolean = false, 
  error?: string
): string {
  let ariaLabel = label
  if (required) ariaLabel += ' (required)'
  if (error) ariaLabel += ` (error: ${error})`
  return ariaLabel
}

/**
 * Generate accessible descriptions for form fields
 */
export function generateAriaDescription(
  description?: string,
  error?: string
): string {
  const parts = []
  if (description) parts.push(description)
  if (error) parts.push(`Error: ${error}`)
  return parts.join('. ')
}

/**
 * Check if a color combination meets WCAG contrast requirements
 */
export function checkContrast(
  foreground: string, 
  background: string, 
  level: 'AA' | 'AAA' = 'AA'
): boolean {
  // This is a simplified check - in production, use a proper contrast checker
  const ratio = getContrastRatio(foreground, background)
  return level === 'AA' ? ratio >= 4.5 : ratio >= 7
}

/**
 * Get contrast ratio between two colors
 */
function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1)
  const lum2 = getLuminance(color2)
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)
  return (brightest + 0.05) / (darkest + 0.05)
}

/**
 * Get relative luminance of a color
 */
function getLuminance(color: string): number {
  const rgb = hexToRgb(color)
  if (!rgb) return 0
  
  const { r, g, b } = rgb
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

/**
 * Generate accessible focus styles
 */
export function getFocusStyles(): string {
  return `
    focus:outline-none 
    focus:ring-2 
    focus:ring-primary 
    focus:ring-offset-2 
    focus:ring-offset-white
    dark:focus:ring-offset-gray-900
  `
}

/**
 * Generate accessible hover styles
 */
export function getHoverStyles(): string {
  return `
    hover:bg-opacity-90 
    hover:scale-105 
    transition-all 
    duration-200
  `
}

/**
 * Generate accessible active styles
 */
export function getActiveStyles(): string {
  return `
    active:scale-95 
    active:bg-opacity-100 
    transition-transform 
    duration-150
  `
}

/**
 * Generate accessible disabled styles
 */
export function getDisabledStyles(): string {
  return `
    disabled:opacity-50 
    disabled:cursor-not-allowed 
    disabled:pointer-events-none
  `
}

/**
 * Generate screen reader only text
 */
export function getScreenReaderOnly(): string {
  return `
    sr-only 
    absolute 
    w-px 
    h-px 
    p-0 
    -m-px 
    overflow-hidden 
    clip-path: inset(50%) 
    white-space: nowrap 
    border-0
  `
}

/**
 * Generate accessible button styles
 */
export function getAccessibleButtonStyles(): string {
  return `
    min-h-[44px] 
    min-w-[44px] 
    ${getFocusStyles()} 
    ${getHoverStyles()} 
    ${getActiveStyles()} 
    ${getDisabledStyles()}
    contrast-more:border-2 
    contrast-more:border-current
  `
}

/**
 * Generate accessible form field styles
 */
export function getAccessibleFormStyles(): string {
  return `
    ${getFocusStyles()} 
    ${getDisabledStyles()}
    contrast-more:border-2 
    contrast-more:border-current
  `
}

/**
 * Generate accessible link styles
 */
export function getAccessibleLinkStyles(): string {
  return `
    ${getFocusStyles()} 
    underline 
    underline-offset-2 
    hover:underline-offset-4 
    transition-all 
    duration-200
  `
}

/**
 * Generate accessible table styles
 */
export function getAccessibleTableStyles(): string {
  return `
    border-collapse 
    border-spacing-0 
    w-full
  `
}

/**
 * Generate accessible table cell styles
 */
export function getAccessibleTableCellStyles(): string {
  return `
    border 
    border-gray-200 
    px-4 
    py-2 
    text-left
  `
}

/**
 * Generate accessible table header styles
 */
export function getAccessibleTableHeaderStyles(): string {
  return `
    ${getAccessibleTableCellStyles()} 
    bg-gray-50 
    font-semibold 
    text-gray-900
  `
}

/**
 * Generate accessible modal styles
 */
export function getAccessibleModalStyles(): string {
  return `
    fixed 
    inset-0 
    z-50 
    flex 
    items-center 
    justify-center 
    bg-black 
    bg-opacity-50
  `
}

/**
 * Generate accessible dialog styles
 */
export function getAccessibleDialogStyles(): string {
  return `
    bg-white 
    rounded-lg 
    shadow-xl 
    max-w-md 
    w-full 
    mx-4 
    p-6
  `
}

/**
 * Generate accessible alert styles
 */
export function getAccessibleAlertStyles(variant: 'success' | 'error' | 'warning' | 'info'): string {
  const baseStyles = `
    p-4 
    rounded-lg 
    border 
    flex 
    items-start 
    space-x-3
  `
  
  const variantStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  }
  
  return `${baseStyles} ${variantStyles[variant]}`
}

/**
 * Generate accessible loading styles
 */
export function getAccessibleLoadingStyles(): string {
  return `
    animate-spin 
    rounded-full 
    border-2 
    border-current 
    border-t-transparent
  `
}

/**
 * Generate accessible skeleton styles
 */
export function getAccessibleSkeletonStyles(): string {
  return `
    animate-pulse 
    bg-gray-200 
    rounded
  `
}

/**
 * Generate accessible tooltip styles
 */
export function getAccessibleTooltipStyles(): string {
  return `
    absolute 
    z-50 
    px-2 
    py-1 
    text-sm 
    text-white 
    bg-gray-900 
    rounded 
    shadow-lg 
    opacity-0 
    pointer-events-none 
    transition-opacity 
    duration-200
  `
}

/**
 * Generate accessible dropdown styles
 */
export function getAccessibleDropdownStyles(): string {
  return `
    absolute 
    z-50 
    mt-1 
    w-full 
    bg-white 
    border 
    border-gray-200 
    rounded-md 
    shadow-lg 
    max-h-60 
    overflow-auto
  `
}

/**
 * Generate accessible menu item styles
 */
export function getAccessibleMenuItemStyles(): string {
  return `
    block 
    w-full 
    px-4 
    py-2 
    text-left 
    text-sm 
    text-gray-700 
    hover:bg-gray-100 
    focus:bg-gray-100 
    focus:outline-none
  `
}

/**
 * Generate accessible checkbox styles
 */
export function getAccessibleCheckboxStyles(): string {
  return `
    h-4 
    w-4 
    text-primary 
    border-gray-300 
    rounded 
    focus:ring-primary 
    focus:ring-2
  `
}

/**
 * Generate accessible radio styles
 */
export function getAccessibleRadioStyles(): string {
  return `
    h-4 
    w-4 
    text-primary 
    border-gray-300 
    focus:ring-primary 
    focus:ring-2
  `
}

/**
 * Generate accessible switch styles
 */
export function getAccessibleSwitchStyles(): string {
  return `
    relative 
    inline-flex 
    h-6 
    w-11 
    items-center 
    rounded-full 
    bg-gray-200 
    transition-colors 
    focus:outline-none 
    focus:ring-2 
    focus:ring-primary 
    focus:ring-offset-2
  `
}

/**
 * Generate accessible progress bar styles
 */
export function getAccessibleProgressStyles(): string {
  return `
    w-full 
    bg-gray-200 
    rounded-full 
    h-2
  `
}

/**
 * Generate accessible progress fill styles
 */
export function getAccessibleProgressFillStyles(): string {
  return `
    bg-primary 
    h-2 
    rounded-full 
    transition-all 
    duration-300
  `
}

/**
 * Generate accessible badge styles
 */
export function getAccessibleBadgeStyles(variant: 'default' | 'secondary' | 'destructive' | 'outline'): string {
  const baseStyles = `
    inline-flex 
    items-center 
    rounded-full 
    px-2.5 
    py-0.5 
    text-xs 
    font-medium
  `
  
  const variantStyles = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
    outline: 'border border-input bg-background text-foreground'
  }
  
  return `${baseStyles} ${variantStyles[variant]}`
}

/**
 * Generate accessible card styles
 */
export function getAccessibleCardStyles(): string {
  return `
    rounded-lg 
    border 
    bg-card 
    text-card-foreground 
    shadow-sm
  `
}

/**
 * Generate accessible card header styles
 */
export function getAccessibleCardHeaderStyles(): string {
  return `
    flex 
    flex-col 
    space-y-1.5 
    p-6
  `
}

/**
 * Generate accessible card content styles
 */
export function getAccessibleCardContentStyles(): string {
  return `
    p-6 
    pt-0
  `
}

/**
 * Generate accessible card footer styles
 */
export function getAccessibleCardFooterStyles(): string {
  return `
    flex 
    items-center 
    p-6 
    pt-0
  `
}

/**
 * Generate accessible separator styles
 */
export function getAccessibleSeparatorStyles(): string {
  return `
    shrink-0 
    bg-border 
    h-[1px] 
    w-full
  `
}

/**
 * Generate accessible avatar styles
 */
export function getAccessibleAvatarStyles(): string {
  return `
    relative 
    flex 
    h-10 
    w-10 
    shrink-0 
    overflow-hidden 
    rounded-full
  `
}

/**
 * Generate accessible avatar image styles
 */
export function getAccessibleAvatarImageStyles(): string {
  return `
    aspect-square 
    h-full 
    w-full
  `
}

/**
 * Generate accessible avatar fallback styles
 */
export function getAccessibleAvatarFallbackStyles(): string {
  return `
    flex 
    h-full 
    w-full 
    items-center 
    justify-center 
    rounded-full 
    bg-muted
  `
}
