'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface SkipLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function SkipLink({ href, children, className }: SkipLinkProps) {
  const linkRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab' && !event.shiftKey) {
        // Focus the skip link when Tab is pressed
        if (linkRef.current) {
          linkRef.current.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <a
      ref={linkRef}
      href={href}
      className={cn(
        "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4",
        "bg-primary text-primary-foreground px-4 py-2 rounded-md",
        "text-sm font-medium z-50",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        className
      )}
      onFocus={(e) => {
        // Ensure the skip link is visible when focused
        e.currentTarget.classList.remove('sr-only')
      }}
      onBlur={(e) => {
        // Hide the skip link when not focused
        e.currentTarget.classList.add('sr-only')
      }}
    >
      {children}
    </a>
  )
}
