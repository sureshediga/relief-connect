'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Users, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  Phone, 
  Mail,
  Star,
  Calendar,
  MoreVertical,
  UserCheck,
  UserX,
  MessageSquare
} from 'lucide-react'
import { cn, formatTimeAgo } from '@/lib/utils'
import { VolunteerStatus } from '@/types'

interface VolunteerWithHours {
  id: string
  name: string
  email: string
  phone: string
  status: VolunteerStatus
  skills: string[]
  languages?: string[]
  verified: boolean
  backgroundCheckPassed: boolean
  totalHours: number
  lastActive?: string
  createdAt: string
  canTravel?: boolean
  maxTravelDistance?: number
  user?: {
    id: string
    name: string | null
    avatar: string | null
  }
  hours: Array<{
    id: string
    date: string
    hours: number
    activity: string
    description: string
    verified: boolean
  }>
}


export default function VolunteersManagementPage() {
  const params = useParams()
  const effortSlug = params.slug as string
  
  const [volunteers, setVolunteers] = useState<VolunteerWithHours[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [skillFilter, setSkillFilter] = useState('all')

  useEffect(() => {
    fetchVolunteers()
  }, [effortSlug])

  const fetchVolunteers = async () => {
    try {
      const response = await fetch(`/api/efforts/${effortSlug}/volunteers`)
      if (!response.ok) {
        throw new Error('Failed to fetch volunteers')
      }
      
      const data = await response.json()
      setVolunteers(data.volunteers)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (volunteerId: string, newStatus: VolunteerStatus) => {
    try {
      const response = await fetch(`/api/volunteers/${volunteerId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update volunteer status')
      }

      setVolunteers(prev => 
        prev.map(volunteer => 
          volunteer.id === volunteerId 
            ? { ...volunteer, status: newStatus }
            : volunteer
        )
      )
    } catch (err) {
      console.error('Error updating volunteer status:', err)
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
        return <XCircle className="w-4 h-4" />
      default:
        return <Users className="w-4 h-4" />
    }
  }

  const filteredVolunteers = volunteers.filter(volunteer => {
    const matchesSearch = 
      volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      volunteer.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || volunteer.status === statusFilter
    const matchesSkill = skillFilter === 'all' || volunteer.skills.includes(skillFilter)
    
    return matchesSearch && matchesStatus && matchesSkill
  })

  const totalHours = volunteers.reduce((sum, volunteer) => 
    sum + volunteer.hours.reduce((volunteerSum, hour) => volunteerSum + hour.hours, 0), 0
  )

  const approvedVolunteers = volunteers.filter(v => v.status === VolunteerStatus.ACTIVE).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading volunteers...</p>
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
            Volunteer Management
          </h1>
          <p className="text-lg text-gray-600">
            Manage volunteers for this relief effort
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Volunteers</p>
                  <p className="text-2xl font-bold text-gray-900">{volunteers.length}</p>
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
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">{approvedVolunteers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {volunteers.filter(v => v.status === VolunteerStatus.REGISTERED).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Hours</p>
                  <p className="text-2xl font-bold text-gray-900">{totalHours}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search volunteers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value={VolunteerStatus.REGISTERED}>Registered</SelectItem>
                  <SelectItem value={VolunteerStatus.ACTIVE}>Active</SelectItem>
                  <SelectItem value={VolunteerStatus.INACTIVE}>Inactive</SelectItem>
                  <SelectItem value={VolunteerStatus.REMOVED}>Removed</SelectItem>
                  <SelectItem value={VolunteerStatus.SUSPENDED}>Suspended</SelectItem>
                </SelectContent>
              </Select>

              <Select value={skillFilter} onValueChange={setSkillFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by skill" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Skills</SelectItem>
                  <SelectItem value="medical">Medical/Healthcare</SelectItem>
                  <SelectItem value="logistics">Logistics/Transportation</SelectItem>
                  <SelectItem value="construction">Construction/Repair</SelectItem>
                  <SelectItem value="communication">Communication/Translation</SelectItem>
                  <SelectItem value="counseling">Counseling/Support</SelectItem>
                  <SelectItem value="administration">Administration/Coordination</SelectItem>
                  <SelectItem value="cooking">Food Service/Cooking</SelectItem>
                  <SelectItem value="technology">Technology/IT Support</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="justify-start">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Volunteers List */}
        <div className="space-y-4">
          {filteredVolunteers.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No volunteers found
                </h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter || skillFilter
                    ? 'Try adjusting your filters to see more volunteers.'
                    : 'No volunteers have registered for this effort yet.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredVolunteers.map((volunteer) => (
              <Card key={volunteer.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        {volunteer.user?.avatar ? (
                          <img 
                            src={volunteer.user.avatar} 
                            alt={volunteer.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-semibold text-gray-600">
                            {volunteer.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {volunteer.name}
                          </h3>
                          <Badge className={cn("flex items-center space-x-1", getStatusColor(volunteer.status))}>
                            {getStatusIcon(volunteer.status)}
                            <span>{volunteer.status}</span>
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                          <div className="flex items-center space-x-1">
                            <Mail className="w-4 h-4" />
                            <span>{volunteer.email}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Phone className="w-4 h-4" />
                            <span>{volunteer.phone}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>
                              {volunteer.canTravel ? `Can travel ${volunteer.maxTravelDistance}mi` : 'Local only'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {volunteer.skills.slice(0, 5).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {volunteer.skills.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{volunteer.skills.length - 5} more
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Joined {formatTimeAgo(new Date(volunteer.createdAt))}</span>
                          <span>•</span>
                          <span>
                            {volunteer.hours.reduce((sum, hour) => sum + hour.hours, 0)} hours logged
                          </span>
                          <span>•</span>
                          <span>
                            {volunteer.languages?.length || 0} languages
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {volunteer.status === VolunteerStatus.REGISTERED && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(volunteer.id, VolunteerStatus.ACTIVE)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <UserCheck className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(volunteer.id, VolunteerStatus.REMOVED)}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <UserX className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      
                      <Button size="sm" variant="outline">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Contact
                      </Button>
                      
                      <Button size="sm" variant="outline">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
