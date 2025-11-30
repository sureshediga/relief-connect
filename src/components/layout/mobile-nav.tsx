'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  Package, 
  MessageSquare, 
  BarChart3,
  Settings,
  User,
  LogOut,
  Bell,
  Search,
  Plus,
  MapPin,
  Heart
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileNavProps {
  effortSlug?: string
}

export function MobileNav({ effortSlug }: MobileNavProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const mainNavItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/efforts', label: 'Find Help', icon: Search },
    { href: '/efforts/create', label: 'Start Effort', icon: Plus },
    { href: '/volunteers/register', label: 'Volunteer', icon: Heart }
  ]

  const effortNavItems = effortSlug ? [
    { href: `/efforts/${effortSlug}`, label: 'Overview', icon: Home },
    { href: `/efforts/${effortSlug}/volunteers`, label: 'Volunteers', icon: Users },
    { href: `/efforts/${effortSlug}/resources`, label: 'Resources', icon: Package },
    { href: `/efforts/${effortSlug}/donations`, label: 'Donations', icon: Heart },
    { href: `/efforts/${effortSlug}/communications`, label: 'Messages', icon: MessageSquare },
    { href: `/efforts/${effortSlug}/analytics`, label: 'Analytics', icon: BarChart3 }
  ] : []

  const userNavItems = session ? [
    { href: '/dashboard', label: 'Dashboard', icon: User },
    { href: '/settings', label: 'Settings', icon: Settings },
    { href: '/notifications', label: 'Notifications', icon: Bell }
  ] : [
    { href: '/auth/signin', label: 'Sign In', icon: User }
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="w-6 h-6" />
      </Button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
          
          <div className="fixed inset-y-0 left-0 w-80 max-w-sm bg-white shadow-xl">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  Relief Connect
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Navigation */}
              <div className="flex-1 overflow-y-auto">
                {/* Main Navigation */}
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                    Main Menu
                  </h3>
                  <nav className="space-y-1">
                    {mainNavItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                          isActive(item.href)
                            ? "bg-primary text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </nav>
                </div>

                {/* Effort Navigation */}
                {effortNavItems.length > 0 && (
                  <div className="p-4 border-t">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                      Current Effort
                    </h3>
                    <nav className="space-y-1">
                      {effortNavItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                            isActive(item.href)
                              ? "bg-primary text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          )}
                          onClick={() => setIsOpen(false)}
                        >
                          <item.icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </nav>
                  </div>
                )}

                {/* User Navigation */}
                <div className="p-4 border-t">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                    Account
                  </h3>
                  <nav className="space-y-1">
                    {userNavItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                          isActive(item.href)
                            ? "bg-primary text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Link>
                    ))}
                    {session && (
                      <button
                        className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 w-full text-left"
                        onClick={() => {
                          // Handle sign out
                          setIsOpen(false)
                        }}
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Sign Out</span>
                      </button>
                    )}
                  </nav>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t bg-gray-50">
                <div className="text-xs text-gray-500 text-center">
                  Relief Connect v1.0.0
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
