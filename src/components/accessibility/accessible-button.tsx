'use client'

import { forwardRef } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  loading?: boolean
  loadingText?: string
  className?: string
  ariaDescribedBy?: string
  ariaExpanded?: boolean
  ariaControls?: string
  ariaHaspopup?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog'
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({
    children,
    variant = 'default',
    size = 'default',
    loading = false,
    loadingText = 'Loading...',
    className,
    ariaDescribedBy,
    ariaExpanded,
    ariaControls,
    ariaHaspopup,
    disabled,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        disabled={isDisabled}
        className={cn(
          // Ensure minimum touch target size for mobile
          "min-h-[44px] min-w-[44px]",
          // Enhanced focus styles for better visibility
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          // High contrast mode support
          "contrast-more:border-2 contrast-more:border-current",
          className
        )}
        aria-describedby={ariaDescribedBy}
        aria-expanded={ariaExpanded}
        aria-controls={ariaControls}
        aria-haspopup={ariaHaspopup}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <>
            <div 
              className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"
              aria-hidden="true"
            />
            <span className="sr-only">{loadingText}</span>
            <span aria-hidden="true">{children}</span>
          </>
        ) : (
          children
        )}
      </Button>
    )
  }
)

AccessibleButton.displayName = 'AccessibleButton'
