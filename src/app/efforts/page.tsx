'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  MapPin, 
  Users, 
  Heart, 
  Clock, 
  AlertTriangle,
  Filter,
  Plus,
  Shield,
  Calendar
} from 'lucide-react'
import { cn, formatTimeAgo, formatDisasterType, getDisasterTypeIcon } from '@/lib/utils'
import { Effort, EffortStatus, DisasterType } from '@/types'

interface EffortWithCounts extends Effort {
  _count: {
    helpRequests: number
    volunteers: number
    donations: number
    resources: number
  }
}

export default function EffortsPage() {
  const searchParams = useSearchParams()
  const [efforts, setEfforts] = useState<EffortWithCounts[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [disasterType, setDisasterType] = useState(searchParams.get('disasterType') || 'all')
  const [status, setStatus] = useState(searchParams.get('status') || 'all')
  const [verified, setVerified] = useState(searchParams.get('verified') || 'all')

  useEffect(() => {
    fetchEfforts()
  }, [search, disasterType, status, verified])

  const fetchEfforts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (disasterType && disasterType !== 'all') params.set('disasterType', disasterType)
      if (status && status !== 'all') params.set('status', status)
      if (verified && verified !== 'all') params.set('verified', verified)

      const response = await fetch(`/api/efforts?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        setEfforts(result.data)
      }
    } catch (error) {
      console.error('Error fetching efforts:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: EffortStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800'
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800'
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getUrgencyColor = (effort: EffortWithCounts) => {
    // Determine urgency based on recent activity and request volume
    const recentRequests = effort._count.helpRequests
    if (recentRequests > 100) return 'border-l-emergency'
    if (recentRequests > 50) return 'border-l-urgent'
    if (recentRequests > 20) return 'border-l-important'
    return 'border-l-info'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Relief Efforts
          </h1>
          <p className="text-gray-600">
            Find and join disaster relief efforts in your area
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search efforts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={disasterType} onValueChange={setDisasterType}>
              <SelectTrigger>
                <SelectValue placeholder="Disaster Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="HURRICANE">Hurricane</SelectItem>
                <SelectItem value="FLOOD">Flood</SelectItem>
                <SelectItem value="WILDFIRE">Wildfire</SelectItem>
                <SelectItem value="EARTHQUAKE">Earthquake</SelectItem>
                <SelectItem value="TORNADO">Tornado</SelectItem>
                <SelectItem value="DROUGHT">Drought</SelectItem>
                <SelectItem value="PANDEMIC">Pandemic</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
              </SelectContent>
            </Select>

            <Select value={verified} onValueChange={setVerified}>
              <SelectTrigger>
                <SelectValue placeholder="Verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Verified Only</SelectItem>
                <SelectItem value="false">Unverified Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Create Effort CTA */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-emergency to-urgent text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Start Your Own Relief Effort</h3>
                    <p className="text-white/90">
                      Coordinate disaster response in your community
                    </p>
                  </div>
                </div>
                <Button
                  asChild
                  className="bg-white text-emergency hover:bg-gray-100"
                >
                  <Link href="/efforts/create">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Effort
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        {efforts.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No relief efforts found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or start a new relief effort.
            </p>
            <Button asChild>
              <Link href="/efforts/create">
                <Plus className="w-4 h-4 mr-2" />
                Start Relief Effort
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {efforts.map((effort) => (
              <Card
                key={effort.id}
                className={cn(
                  "hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4",
                  getUrgencyColor(effort)
                )}
              >
                <Link href={`/efforts/${effort.slug}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">
                          {getDisasterTypeIcon(effort.disasterType)}
                        </span>
                        <div>
                          <CardTitle className="text-lg line-clamp-1">
                            {effort.name}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {effort.organizationName}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(effort.status)}>
                          {effort.status}
                        </Badge>
                        {effort.verified && (
                          <Shield className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {effort.description}
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1 text-gray-500">
                          <MapPin className="w-4 h-4" />
                          <span>{effort.organizationName}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>{formatTimeAgo(new Date(effort.createdAt))}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-lg font-semibold text-gray-900">
                            {effort._count.helpRequests}
                          </div>
                          <div className="text-xs text-gray-500">Requests</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-gray-900">
                            {effort._count.volunteers}
                          </div>
                          <div className="text-xs text-gray-500">Volunteers</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-gray-900">
                            {effort._count.donations}
                          </div>
                          <div className="text-xs text-gray-500">Donations</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>
                            {effort.status === 'ACTIVE' ? 'Active now' : 'Inactive'}
                          </span>
                        </div>
                        <div className="text-sm text-primary font-medium">
                          View Details →
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}

        {/* Load More */}
        {efforts.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              Load More Efforts
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
