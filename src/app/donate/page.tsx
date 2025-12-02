'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Heart, 
  MapPin, 
  Calendar, 
  AlertTriangle,
  Search,
  ArrowRight,
  DollarSign,
  Clock
} from 'lucide-react'
import { cn, formatTimeAgo, formatDisasterType, getDisasterTypeIcon } from '@/lib/utils'
import { DisasterType } from '@/types'

interface Effort {
  id: string
  name: string
  slug: string
  description: string
  disasterType: DisasterType
  status: string
  createdAt: string
  _count: {
    volunteers: number
    helpRequests: number
    donations: number
  }
}

function DonatePageContent() {
  const router = useRouter()
  const [efforts, setEfforts] = useState<Effort[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [disasterFilter, setDisasterFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchEfforts()
  }, [disasterFilter, statusFilter])

  const fetchEfforts = async () => {
    try {
      setLoading(true)
      let url = '/api/efforts?status=ACTIVE'
      
      if (disasterFilter !== 'all') {
        url += `&disasterType=${disasterFilter}`
      }

      const response = await fetch(url)
      const result = await response.json()

      if (result.success) {
        setEfforts(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching efforts:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredEfforts = efforts.filter(effort => {
    const matchesSearch = effort.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         effort.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-12 h-12 text-primary mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Donate</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Support active relief efforts with your donations. 
            Select an effort below to make a contribution.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search efforts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={disasterFilter} onValueChange={setDisasterFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Disaster Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.values(DisasterType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {formatDisasterType(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Efforts Grid */}
        {filteredEfforts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No relief efforts found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || disasterFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'There are currently no active relief efforts. Check back soon!'}
              </p>
              {(searchQuery || disasterFilter !== 'all' || statusFilter !== 'all') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('')
                    setDisasterFilter('all')
                    setStatusFilter('all')
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEfforts.map((effort) => {
              const disasterIcon = getDisasterTypeIcon(effort.disasterType)
              
              return (
                <Card key={effort.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 text-primary flex items-center justify-center">{disasterIcon}</span>
                        <Badge
                          className={cn(
                            effort.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                            effort.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          )}
                        >
                          {effort.status}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-xl mb-2">{effort.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {effort.description || 'No description available'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {effort._count.volunteers}
                          </div>
                          <div className="text-gray-500">Volunteers</div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {effort._count.helpRequests}
                          </div>
                          <div className="text-gray-500">Requests</div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {effort._count.donations}
                          </div>
                          <div className="text-gray-500">Donations</div>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          <span>{formatDisasterType(effort.disasterType)}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>{formatTimeAgo(new Date(effort.createdAt))}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button
                        asChild
                        className="w-full"
                        onClick={() => router.push(`/efforts/${effort.slug}/donations`)}
                      >
                        <Link href={`/efforts/${effort.slug}/donations`}>
                          <DollarSign className="w-4 h-4 mr-2" />
                          Make a Donation
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function DonatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading donation opportunities...</p>
        </div>
      </div>
    }>
      <DonatePageContent />
    </Suspense>
  )
}

