'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Home, 
  Users, 
  Package, 
  MessageSquare, 
  BarChart3,
  Heart,
  Bell
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileBottomNavProps {
  effortSlug: string
  notifications?: number
}

export function MobileBottomNav({ effortSlug, notifications = 0 }: MobileBottomNavProps) {
  const pathname = usePathname()

  const navItems = [
    {
      href: `/efforts/${effortSlug}`,
      label: 'Overview',
      icon: Home
    },
    {
      href: `/efforts/${effortSlug}/volunteers`,
      label: 'Volunteers',
      icon: Users
    },
    {
      href: `/efforts/${effortSlug}/resources`,
      label: 'Resources',
      icon: Package
    },
    {
      href: `/efforts/${effortSlug}/donations`,
      label: 'Donations',
      icon: Heart
    },
    {
      href: `/efforts/${effortSlug}/communications`,
      label: 'Messages',
      icon: MessageSquare,
      badge: notifications
    }
  ]

  const isActive = (href: string) => {
    if (href === `/efforts/${effortSlug}`) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center space-y-1 px-2 py-2 text-xs font-medium transition-colors relative",
              isActive(item.href)
                ? "text-primary"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <div className="relative">
              <item.icon className="w-5 h-5" />
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </div>
            <span className="truncate">{item.label}</span>
            {isActive(item.href) && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
