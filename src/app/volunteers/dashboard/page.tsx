'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle, 
  AlertCircle,
  Star,
  TrendingUp,
  Award,
  Activity,
  Phone,
  Mail,
  Settings
} from 'lucide-react'
import { cn, formatTimeAgo } from '@/lib/utils'
import { VolunteerStatus } from '@/types'

interface VolunteerData {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  status: VolunteerStatus
  skills: string[]
  languages: string[]
  availability: Record<string, boolean>
  preferredShifts: string[]
  canTravel: boolean
  maxTravelDistance: number
  hasTransportation: boolean
  backgroundCheckConsent: boolean
  isActive: boolean
  createdAt: string
  effort: {
    id: string
    name: string
    slug: string
    status: string
  }
  hours: Array<{
    id: string
    date: string
    hours: number
    description: string
    verified: boolean
  }>
}

export default function VolunteerDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [volunteerData, setVolunteerData] = useState<VolunteerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated') {
      fetchVolunteerData()
    }
  }, [status, router])

  const fetchVolunteerData = async () => {
    try {
      const response = await fetch('/api/volunteers/me')
      if (!response.ok) {
        throw new Error('Failed to fetch volunteer data')
      }
      
      const data = await response.json()
      setVolunteerData(data.volunteer)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: VolunteerStatus) => {
    switch (status) {
      case VolunteerStatus.ACTIVE:
        return 'bg-green-100 text-green-800'
      case VolunteerStatus.REGISTERED:
        return 'bg-yellow-100 text-yellow-800'
      case VolunteerStatus.REMOVED:
      case VolunteerStatus.SUSPENDED:
        return 'bg-red-100 text-red-800'
      case VolunteerStatus.INACTIVE:
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: VolunteerStatus) => {
    switch (status) {
      case VolunteerStatus.ACTIVE:
        return <CheckCircle className="w-4 h-4" />
      case VolunteerStatus.REGISTERED:
        return <Clock className="w-4 h-4" />
      case VolunteerStatus.REMOVED:
      case VolunteerStatus.SUSPENDED:
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your volunteer dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Error Loading Dashboard
              </h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchVolunteerData}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!volunteerData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Not Registered as Volunteer
              </h2>
              <p className="text-gray-600 mb-4">
                You haven't registered as a volunteer yet. Join a relief effort to get started.
              </p>
              <Button onClick={() => router.push('/efforts')}>
                Browse Relief Efforts
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalHours = volunteerData.hours.reduce((sum, hour) => sum + hour.hours, 0)
  const verifiedHours = volunteerData.hours
    .filter(hour => hour.verified)
    .reduce((sum, hour) => sum + hour.hours, 0)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {volunteerData.firstName}!
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Your volunteer dashboard
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className={cn("flex items-center space-x-1", getStatusColor(volunteerData.status))}>
                {getStatusIcon(volunteerData.status)}
                <span>{volunteerData.status}</span>
              </Badge>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Hours</p>
                  <p className="text-2xl font-bold text-gray-900">{totalHours}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Verified Hours</p>
                  <p className="text-2xl font-bold text-gray-900">{verifiedHours}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Skills</p>
                  <p className="text-2xl font-bold text-gray-900">{volunteerData.skills.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Since</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatTimeAgo(new Date(volunteerData.createdAt))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Effort */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Current Relief Effort
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {volunteerData.effort.name}
                    </h3>
                    <p className="text-gray-600">Status: {volunteerData.effort.status}</p>
                  </div>
                  <Button variant="outline">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Recent Volunteer Hours
                </CardTitle>
                <CardDescription>
                  Your recent volunteer activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                {volunteerData.hours.length > 0 ? (
                  <div className="space-y-4">
                    {volunteerData.hours.slice(0, 5).map((hour) => (
                      <div key={hour.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{hour.description}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(hour.date).toLocaleDateString()} • {hour.hours} hours
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {hour.verified ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              Pending
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No volunteer hours recorded yet</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Start volunteering to see your hours here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Info */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{volunteerData.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{volunteerData.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {volunteerData.canTravel ? `Can travel up to ${volunteerData.maxTravelDistance} miles` : 'Local only'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Your Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {volunteerData.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Languages */}
            <Card>
              <CardHeader>
                <CardTitle>Languages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {volunteerData.languages.map((language) => (
                    <Badge key={language} variant="outline">
                      {language}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" variant="outline">
                  <Clock className="w-4 h-4 mr-2" />
                  Log Hours
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  View Schedule
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Contact Team
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
