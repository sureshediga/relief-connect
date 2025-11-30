'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TouchButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  haptic?: boolean
}

export function TouchButton({
  children,
  onClick,
  variant = 'default',
  size = 'lg',
  className,
  disabled = false,
  loading = false,
  fullWidth = false,
  haptic = true,
  ...props
}: TouchButtonProps) {
  const handleClick = () => {
    // Haptic feedback for mobile devices
    if (haptic && 'vibrate' in navigator) {
      navigator.vibrate(50) // Short vibration
    }
    onClick?.()
  }

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      size={size}
      disabled={disabled || loading}
      className={cn(
        // Mobile-optimized touch target (minimum 44px)
        "min-h-[44px] min-w-[44px]",
        // Enhanced touch feedback
        "active:scale-95 transition-transform duration-150",
        // Better spacing for mobile
        "px-6 py-3",
        // Full width option
        fullWidth && "w-full",
        // Loading state
        loading && "opacity-75 cursor-not-allowed",
        className
      )}
      {...props}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </Button>
  )
}
