'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Menu, X, MapPin, Users, Heart, Plus, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()

  const navigation = [
    { name: 'Find Help', href: '/efforts', icon: MapPin },
    { name: 'Volunteer', href: '/volunteer', icon: Users },
    { name: 'Donate', href: '/donate', icon: Heart },
  ]

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Back */}
          <div className="flex-shrink-0">
            <div className="flex items-center space-x-3">
              {pathname !== '/' && (
                <button
                  type="button"
                  aria-label="Go back"
                  onClick={() => router.back()}
                  className="p-2 rounded-md hover:bg-gray-100"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
              )}
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">
                  Relief Connect
                </span>
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-1 text-gray-600 hover:text-primary transition-colors"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            ) : session ? (
              <div className="flex items-center space-x-4">
                <Button asChild>
                  <Link href="/efforts/create">
                    <Plus className="w-4 h-4 mr-2" />
                    Start Relief Effort
                  </Link>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={session.user?.image || ''} alt={session.user?.name || ''} />
                        <AvatarFallback>
                          {session.user?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex flex-col space-y-1 p-2">
                      <p className="text-sm font-medium leading-none">
                        {session.user?.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user?.email}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" onClick={() => signIn()}>
                  Sign In
                </Button>
                <Button onClick={() => signIn()}>
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md px-3 py-2 text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
              
              <div className="pt-4 pb-3 border-t border-gray-200">
                {session ? (
                  <div className="space-y-3">
                    <div className="flex items-center px-3">
                      <div className="flex-shrink-0">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={session.user?.image || ''} alt={session.user?.name || ''} />
                          <AvatarFallback>
                            {session.user?.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="ml-3">
                        <div className="text-base font-medium text-gray-800">
                          {session.user?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {session.user?.email}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Link
                        href="/dashboard"
                        className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        href="/efforts/create"
                        className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Start Relief Effort
                      </Link>
                      <button
                        onClick={() => {
                          signOut()
                          setIsMobileMenuOpen(false)
                        }}
                        className="block w-full text-left px-3 py-2 text-base font-medium text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button
                      className="w-full"
                      onClick={() => {
                        signIn()
                        setIsMobileMenuOpen(false)
                      }}
                    >
                      Sign In
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        signIn()
                        setIsMobileMenuOpen(false)
                      }}
                    >
                      Get Started
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="h-10 flex items-center">
          <Breadcrumbs />
        </div>
      </div>
    </header>
  )
}
