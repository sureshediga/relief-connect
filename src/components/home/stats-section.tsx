'use client'

import { useState, useEffect } from 'react'
import { Users, Heart, MapPin, Clock, Shield, Zap } from 'lucide-react'

interface Stat {
  id: string
  value: number
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
}

export function StatsSection() {
  const [stats, setStats] = useState<Stat[]>([
    {
      id: 'efforts',
      value: 0,
      label: 'Active Relief Efforts',
      icon: MapPin,
      color: 'text-emergency',
      bgColor: 'bg-emergency/10'
    },
    {
      id: 'volunteers',
      value: 0,
      label: 'Volunteers Mobilized',
      icon: Users,
      color: 'text-urgent',
      bgColor: 'bg-urgent/10'
    },
    {
      id: 'people-helped',
      value: 0,
      label: 'People Helped',
      icon: Heart,
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      id: 'response-time',
      value: 0,
      label: 'Avg Response Time (hours)',
      icon: Clock,
      color: 'text-info',
      bgColor: 'bg-info/10'
    },
    {
      id: 'organizations',
      value: 0,
      label: 'Verified Organizations',
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      id: 'countries',
      value: 0,
      label: 'Countries Served',
      icon: Zap,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ])

  // Animate numbers on mount
  useEffect(() => {
    const targetValues = [247, 15420, 89234, 2.3, 89, 12]
    
    const animateValue = (index: number, start: number, end: number, duration: number) => {
      const startTime = performance.now()
      
      const updateValue = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // Easing function for smooth animation
        const easeOutCubic = 1 - Math.pow(1 - progress, 3)
        const currentValue = start + (end - start) * easeOutCubic
        
        setStats(prev => prev.map((stat, i) => 
          i === index ? { ...stat, value: currentValue } : stat
        ))
        
        if (progress < 1) {
          requestAnimationFrame(updateValue)
        }
      }
      
      requestAnimationFrame(updateValue)
    }

    // Start animations with slight delays
    targetValues.forEach((target, index) => {
      setTimeout(() => {
        animateValue(index, 0, target, 2000)
      }, index * 200)
    })
  }, [])

  const formatValue = (value: number, id: string): string => {
    if (id === 'response-time') {
      return value.toFixed(1)
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K'
    }
    return Math.round(value).toString()
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Making a Real Impact
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform has helped coordinate relief efforts across the globe, 
            connecting communities in their time of need.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.id}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="text-right">
                  <div className={`text-3xl md:text-4xl font-bold ${stat.color}`}>
                    {formatValue(stat.value, stat.id)}
                  </div>
                  {stat.id === 'response-time' && (
                    <div className="text-sm text-gray-500">hours</div>
                  )}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {stat.label}
              </h3>
            </div>
          ))}
        </div>

        {/* Real-time indicator */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live data updated every 5 minutes</span>
          </div>
        </div>
      </div>
    </section>
  )
}
