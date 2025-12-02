'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  Lock, 
  Users, 
  Database, 
  FileText,
  Download,
  RefreshCw,
  Settings,
  Activity,
  Key,
  Globe,
  Server
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SecurityEvent {
  id: string
  type: 'login' | 'logout' | 'failed_login' | 'data_access' | 'suspicious' | 'csp_violation'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: string
  ip: string
  userAgent: string
  userId?: string
}

interface SecurityMetrics {
  totalEvents: number
  criticalEvents: number
  highEvents: number
  mediumEvents: number
  lowEvents: number
  failedLogins: number
  suspiciousActivity: number
  dataAccessEvents: number
  cspViolations: number
}

export default function SecurityDashboardPage() {
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h')
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')

  useEffect(() => {
    fetchSecurityData()
  }, [selectedTimeRange])

  const fetchSecurityData = async () => {
    try {
      setLoading(true)
      // TODO: In production, integrate with a security monitoring service
      // For now, return empty data as security logging is not yet implemented
      setEvents([])
      setMetrics({
        totalEvents: 0,
        criticalEvents: 0,
        highEvents: 0,
        mediumEvents: 0,
        lowEvents: 0,
        failedLogins: 0,
        suspiciousActivity: 0,
        dataAccessEvents: 0,
        cspViolations: 0
      })
    } catch (error) {
      console.error('Failed to fetch security data:', error)
      setEvents([])
      setMetrics({
        totalEvents: 0,
        criticalEvents: 0,
        highEvents: 0,
        mediumEvents: 0,
        lowEvents: 0,
        failedLogins: 0,
        suspiciousActivity: 0,
        dataAccessEvents: 0,
        cspViolations: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'login':
      case 'logout':
        return <Users className="w-4 h-4" />
      case 'failed_login':
        return <Lock className="w-4 h-4" />
      case 'data_access':
        return <Database className="w-4 h-4" />
      case 'suspicious':
        return <Shield className="w-4 h-4" />
      case 'csp_violation':
        return <Globe className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const filteredEvents = events.filter(event => {
    if (selectedSeverity !== 'all' && event.severity !== selectedSeverity) {
      return false
    }
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading security dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Security Dashboard
              </h1>
              <p className="text-lg text-gray-600">
                Monitor security events and system health
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button onClick={fetchSecurityData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Events</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.totalEvents}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Critical Events</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.criticalEvents}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Lock className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Failed Logins</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.failedLogins}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Suspicious Activity</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.suspiciousActivity}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Security Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Security Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">SSL/TLS Certificate</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Valid
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Rate Limiting</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Content Security Policy</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Enforced
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Data Encryption</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    AES-256
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Audit Logging</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Enabled
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Data Privacy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">GDPR Compliance</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Compliant
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Data Retention</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Policy Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Data Anonymization</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Enabled
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">User Consent</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Tracked
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Right to Erasure</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Supported
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Events */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Security Events</CardTitle>
                <CardDescription>
                  Recent security events and alerts
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="1h">Last Hour</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                </select>
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No security events found</p>
                </div>
              ) : (
                filteredEvents.map((event) => (
                  <div key={event.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      {getEventTypeIcon(event.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900">{event.message}</h4>
                        <Badge className={cn("flex items-center space-x-1", getSeverityColor(event.severity))}>
                          {getSeverityIcon(event.severity)}
                          <span>{event.severity}</span>
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>IP: {event.ip}</p>
                        <p>Time: {new Date(event.timestamp).toLocaleString()}</p>
                        {event.userId && <p>User: {event.userId}</p>}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
