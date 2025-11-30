'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface AnnouncerProps {
  message: string
  priority?: 'polite' | 'assertive'
  className?: string
}

export function Announcer({ 
  message, 
  priority = 'polite', 
  className 
}: AnnouncerProps) {
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    if (message) {
      setAnnouncement(message)
      
      // Clear the announcement after a short delay
      const timer = setTimeout(() => {
        setAnnouncement('')
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [message])

  if (!announcement) return null

  return (
    <div
      className={cn(
        "sr-only",
        className
      )}
      aria-live={priority}
      aria-atomic="true"
      role="status"
    >
      {announcement}
    </div>
  )
}

// Hook for announcing messages
export function useAnnouncer() {
  const [message, setMessage] = useState('')
  const [priority, setPriority] = useState<'polite' | 'assertive'>('polite')

  const announce = (newMessage: string, newPriority: 'polite' | 'assertive' = 'polite') => {
    setMessage(newMessage)
    setPriority(newPriority)
  }

  return {
    announce,
    Announcer: () => <Announcer message={message} priority={priority} />
  }
}
