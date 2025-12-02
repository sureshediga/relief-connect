'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  ArrowRight, 
  CheckCircle, 
  Users, 
  Heart, 
  Shield, 
  Zap,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function CTASection() {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      // Handle subscription logic here
      setIsSubscribed(true)
      setEmail('')
    }
  }

  const benefits = [
    {
      icon: Users,
      title: 'Join 10,000+ Volunteers',
      description: 'Connect with a global community of disaster response volunteers'
    },
    {
      icon: Heart,
      title: 'Help Communities in Need',
      description: 'Make a real difference in people\'s lives during their darkest hours'
    },
    {
      icon: Shield,
      title: 'Verified & Safe',
      description: 'All relief efforts are verified and monitored for safety and effectiveness'
    },
    {
      icon: Zap,
      title: 'Quick & Easy Setup',
      description: 'Get started in minutes with our intuitive platform and guided setup'
    }
  ]

  const [stats, setStats] = useState([
    { label: 'Relief Efforts', value: '0', color: 'text-emergency' },
    { label: 'Volunteers', value: '0', color: 'text-urgent' },
    { label: 'People Helped', value: '0', color: 'text-success' },
    { label: 'Countries', value: '0', color: 'text-info' }
  ])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats')
        const result = await response.json()

        if (result.success && result.data.platform) {
          const platform = result.data.platform
          const formatValue = (val: number) => {
            if (val >= 1000) {
              return (val / 1000).toFixed(1) + 'K'
            }
            return val.toString()
          }

          setStats([
            { label: 'Relief Efforts', value: formatValue(platform.activeEfforts || 0), color: 'text-emergency' },
            { label: 'Volunteers', value: formatValue(platform.totalVolunteers || 0), color: 'text-urgent' },
            { label: 'People Helped', value: formatValue(platform.peopleHelped || 0), color: 'text-success' },
            { label: 'Countries', value: (platform.countriesServed || 1).toString(), color: 'text-info' }
          ])
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    fetchStats()
  }, [])

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
            Join the global community of organizations and volunteers working together 
            to provide relief when disasters strike.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - CTA Forms */}
          <div className="space-y-8">
            {/* Start Relief Effort CTA */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-emergency/20 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-emergency" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Start a Relief Effort</h3>
                  <p className="text-blue-100">Launch your disaster response in minutes</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-sm text-blue-100">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Free to use for all organizations</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-blue-100">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Verified and secure platform</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-blue-100">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Professional-grade tools</span>
                </div>
              </div>

              <Button
                asChild
                size="lg"
                className="w-full mt-6 bg-emergency hover:bg-emergency-dark text-white"
              >
                <Link href="/efforts/create">
                  Start Relief Effort
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>

            {/* Volunteer CTA */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-urgent/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-urgent" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Volunteer Your Time</h3>
                  <p className="text-blue-100">Help communities in their time of need</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-sm text-blue-100">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Skills-based matching</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-blue-100">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Flexible scheduling</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-blue-100">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Make a real impact</span>
                </div>
              </div>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full mt-6 border-white text-white hover:bg-white hover:text-gray-900"
              >
                <Link href="/volunteer">
                  Find Volunteer Opportunities
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Column - Benefits and Stats */}
          <div className="space-y-8">
            {/* Benefits */}
            <div>
              <h3 className="text-2xl font-bold mb-6">Why Choose Relief Connect?</h3>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-1">
                        {benefit.title}
                      </h4>
                      <p className="text-blue-100 text-sm">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold mb-4">Our Impact</h3>
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className={cn("text-3xl font-bold", stat.color)}>
                      {stat.value}
                    </div>
                    <div className="text-sm text-blue-100">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold mb-4">Stay Updated</h3>
              <p className="text-blue-100 text-sm mb-4">
                Get the latest updates on relief efforts and platform features.
              </p>
              
              {isSubscribed ? (
                <div className="flex items-center space-x-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span>Thank you for subscribing!</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex space-x-2">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-white/20 border-white/30 text-white placeholder:text-blue-200"
                    required
                  />
                  <Button type="submit" className="bg-emergency hover:bg-emergency-dark">
                    <Mail className="w-4 h-4" />
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Emergency Contact Info */}
        <div className="mt-16 bg-red-900/20 border border-red-800/30 rounded-2xl p-6">
          <div className="flex items-center justify-center space-x-4 text-center">
            <div className="flex items-center space-x-2">
              <Phone className="w-5 h-5 text-red-400" />
              <span className="text-red-200 font-medium">Emergency?</span>
            </div>
            <div className="text-red-300">
              Call 911 or your local emergency services immediately
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-red-400" />
              <span className="text-red-200">Relief Connect is not an emergency service</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
