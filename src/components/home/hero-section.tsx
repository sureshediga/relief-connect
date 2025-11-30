'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapPin, Search, Users, Heart, AlertTriangle, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to search results
      window.location.href = `/efforts?search=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20 lg:py-32">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
            <span className="block">Democratizing</span>
            <span className="block text-primary">Disaster Relief</span>
          </h1>
          
          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
            Community driven coordination tools for responding to a disaster, regardless of size or resources.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search for relief efforts near you..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-4 text-lg h-14 border-2 border-gray-200 focus:border-primary rounded-xl"
                />
                <Button
                  type="submit"
                  size="lg"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6"
                >
                  Search
                </Button>
              </div>
            </form>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              asChild
              size="crisis"
              className="bg-emergency hover:bg-emergency-dark text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Link href="/efforts/create">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Start Relief Effort
              </Link>
            </Button>
            
            <Button
              asChild
              variant="outline"
              size="crisis"
              className="border-2 border-primary text-primary hover:bg-primary hover:text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Link href="/efforts">
                <MapPin className="w-5 h-5 mr-2" />
                Find Help Near You
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-emergency/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-emergency" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Verified Organizations
              </h3>
              <p className="text-gray-600">
                All relief efforts are verified and monitored for safety and effectiveness.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-urgent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-urgent" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Community Driven
              </h3>
              <p className="text-gray-600">
                Built by and for communities, with local knowledge and rapid response.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Free to Use
              </h3>
              <p className="text-gray-600">
                No cost barriers - relief efforts should never be limited by resources.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Alert Banner */}
      <div className="absolute top-0 left-0 right-0 bg-emergency text-white py-2 px-4 text-center">
        <div className="flex items-center justify-center space-x-2">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-medium">
            In an emergency? Call 911 or your local emergency services immediately.
          </span>
        </div>
      </div>
    </section>
  )
}
