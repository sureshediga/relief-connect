'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface FocusTrapProps {
  children: React.ReactNode
  active: boolean
  className?: string
  onEscape?: () => void
}

export function FocusTrap({ 
  children, 
  active, 
  className, 
  onEscape 
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onEscape) {
        onEscape()
        return
      }

      if (event.key === 'Tab') {
        if (event.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            event.preventDefault()
            lastElement?.focus()
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            event.preventDefault()
            firstElement?.focus()
          }
        }
      }
    }

    // Focus the first element when the trap becomes active
    firstElement?.focus()

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [active, onEscape])

  if (!active) return <>{children}</>

  return (
    <div
      ref={containerRef}
      className={cn(className)}
      role="dialog"
      aria-modal="true"
    >
      {children}
    </div>
  )
}
