'use client'

export const dynamic = 'force-dynamic'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  MapPin, 
  Users, 
  Heart, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Activity,
  Shield,
  Calendar
} from 'lucide-react'
import { cn, formatTimeAgo } from '@/lib/utils'

interface DashboardStats {
  totalEfforts: number
  activeEfforts: number
  totalVolunteers: number
  totalRequests: number
  peopleHelped: number
  avgResponseTime: number
}

interface RecentEffort {
  id: string
  name: string
  slug: string
  status: string
  disasterType: string
  createdAt: string
  _count: {
    helpRequests: number
    volunteers: number
    donations: number
  }
}

interface ActivityItem {
  id: string
  type: string
  message: string
  timestamp: string
  effortId?: string
  effortName?: string
  color: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentEfforts, setRecentEfforts] = useState<RecentEffort[]>([])
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/dashboard')
      return
    }

    if (status === 'authenticated') {
      fetchDashboardData()
    }
  }, [status, router])

  const fetchDashboardData = async () => {
    try {
      // Fetch user's efforts
      const effortsResponse = await fetch('/api/efforts')
      const effortsResult = await effortsResponse.json()

      if (effortsResult.success) {
        setRecentEfforts(effortsResult.data.slice(0, 5))
      }

      // Fetch real statistics
      const statsResponse = await fetch('/api/stats')
      const statsResult = await statsResponse.json()

      if (statsResult.success && statsResult.data.user) {
        setStats(statsResult.data.user)
      } else if (statsResult.success && statsResult.data.platform) {
        // Fallback to platform stats if user stats not available
        setStats({
          totalEfforts: statsResult.data.platform.totalEfforts,
          activeEfforts: statsResult.data.platform.activeEfforts,
          totalVolunteers: statsResult.data.platform.totalVolunteers,
          totalRequests: statsResult.data.platform.totalHelpRequests,
          peopleHelped: statsResult.data.platform.peopleHelped,
          avgResponseTime: statsResult.data.platform.avgResponseTime
        })
      }

      // Fetch recent activity
      const activityResponse = await fetch('/api/activity?limit=5')
      const activityResult = await activityResponse.json()

      if (activityResult.success) {
        setRecentActivity(activityResult.data)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {session?.user?.name || 'User'}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your relief efforts
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Efforts</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalEfforts}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeEfforts} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Volunteers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalVolunteers}</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Help Requests</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRequests}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.peopleHelped} people helped
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgResponseTime}h</div>
                <p className="text-xs text-muted-foreground">
                  -0.5h from last week
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Efforts */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Your Relief Efforts</CardTitle>
                    <CardDescription>
                      Manage your active and completed relief efforts
                    </CardDescription>
                  </div>
                  <Button asChild>
                    <Link href="/efforts/create">
                      <Plus className="w-4 h-4 mr-2" />
                      New Effort
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentEfforts.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No relief efforts yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Start your first relief effort to help your community
                    </p>
                    <Button asChild>
                      <Link href="/efforts/create">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Relief Effort
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentEfforts.map((effort) => (
                      <div
                        key={effort.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {effort.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {effort.disasterType} • {formatTimeAgo(new Date(effort.createdAt))}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {effort._count.helpRequests} requests
                            </div>
                            <div className="text-xs text-gray-500">
                              {effort._count.volunteers} volunteers
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={cn(
                              effort.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                              effort.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            )}>
                              {effort.status}
                            </Badge>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/efforts/${effort.slug}`}>
                                View
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks and shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full justify-start">
                  <Link href="/efforts/create">
                    <Plus className="w-4 h-4 mr-2" />
                    Start New Effort
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/efforts">
                    <MapPin className="w-4 h-4 mr-2" />
                    Browse Efforts
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/volunteer">
                    <Users className="w-4 h-4 mr-2" />
                    Find Volunteer Work
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/profile">
                    <Shield className="w-4 h-4 mr-2" />
                    Update Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest updates from your efforts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <div className="text-center py-4 text-sm text-gray-500">
                    No recent activity
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className={`w-2 h-2 bg-${activity.color}-500 rounded-full mt-2`}></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">
                            {activity.message}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatTimeAgo(new Date(activity.timestamp))}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
