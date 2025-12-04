'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Search,
  Eye,
  Clock,
  MapPin,
  Building2,
  Mail,
  Phone,
  Globe,
  Loader2
} from 'lucide-react'
import { EffortStatus, DisasterType } from '@/types'
import { toast } from 'react-hot-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Effort {
  id: string
  slug: string
  name: string
  description?: string
  disasterType: DisasterType
  status: EffortStatus
  verified: boolean
  verifiedAt?: string
  verificationNotes?: string
  organizationName: string
  organizationType: string
  primaryContactName: string
  primaryContactEmail: string
  primaryContactPhone: string
  website?: string
  createdAt: string
  organizer: {
    id: string
    name?: string
    email: string
  }
}

export default function AdminEffortsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [efforts, setEfforts] = useState<Effort[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEffort, setSelectedEffort] = useState<Effort | null>(null)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [verificationNotes, setVerificationNotes] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin/efforts')
      return
    }

    if (status === 'authenticated') {
      // Check if user is admin
      console.log('Session check:', { 
        isAdmin: session?.user?.isAdmin, 
        email: session?.user?.email 
      }) // Debug log
      
      if (!session?.user?.isAdmin) {
        router.push('/dashboard')
        toast.error('Admin privileges required. Make sure your email is in ADMIN_EMAILS environment variable.')
        return
      }
      fetchEfforts()
    }
  }, [status, session, router])

  const fetchEfforts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/efforts?status=PENDING&limit=100')
      const result = await response.json()

      console.log('Fetch efforts response:', result) // Debug log

      if (result.success) {
        setEfforts(result.data || [])
        if (result.data && result.data.length === 0) {
          toast.success('No pending efforts found', { duration: 3000 })
        }
      } else {
        toast.error(result.error || 'Failed to fetch pending efforts')
        console.error('API error:', result)
      }
    } catch (error) {
      console.error('Error fetching efforts:', error)
      toast.error('Error loading efforts. Please check the console for details.')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!selectedEffort) return

    setProcessing(true)
    try {
      console.log('Approving effort:', selectedEffort.slug)
      const response = await fetch(`/api/efforts/${selectedEffort.slug}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'ACTIVE',
          verified: true,
          verificationNotes: verificationNotes || undefined,
        }),
      })

      console.log('Approve response status:', response.status)
      const result = await response.json()
      console.log('Approve response:', result)

      if (result.success) {
        toast.success('Effort approved successfully')
        setApproveDialogOpen(false)
        setSelectedEffort(null)
        setVerificationNotes('')
        // Wait a bit before refreshing to ensure DB is updated
        setTimeout(() => {
          fetchEfforts()
        }, 500)
      } else {
        console.error('Approve failed:', result)
        toast.error(result.error || 'Failed to approve effort')
      }
    } catch (error) {
      console.error('Error approving effort:', error)
      toast.error(`Error approving effort: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedEffort) return

    setProcessing(true)
    try {
      console.log('Rejecting effort:', selectedEffort.slug)
      const response = await fetch(`/api/efforts/${selectedEffort.slug}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'CANCELLED',
          verified: false,
          verificationNotes: verificationNotes || undefined,
        }),
      })

      console.log('Reject response status:', response.status)
      const result = await response.json()
      console.log('Reject response:', result)

      if (result.success) {
        toast.success('Effort rejected')
        setRejectDialogOpen(false)
        setSelectedEffort(null)
        setVerificationNotes('')
        // Wait a bit before refreshing to ensure DB is updated
        setTimeout(() => {
          fetchEfforts()
        }, 500)
      } else {
        console.error('Reject failed:', result)
        toast.error(result.error || 'Failed to reject effort')
      }
    } catch (error) {
      console.error('Error rejecting effort:', error)
      toast.error(`Error rejecting effort: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setProcessing(false)
    }
  }

  const getDisasterTypeColor = (type: DisasterType) => {
    const colors: Record<string, string> = {
      HURRICANE: 'bg-red-100 text-red-800',
      FLOOD: 'bg-blue-100 text-blue-800',
      WILDFIRE: 'bg-orange-100 text-orange-800',
      EARTHQUAKE: 'bg-yellow-100 text-yellow-800',
      TORNADO: 'bg-purple-100 text-purple-800',
      DROUGHT: 'bg-amber-100 text-amber-800',
      PANDEMIC: 'bg-pink-100 text-pink-800',
      OTHER: 'bg-gray-100 text-gray-800',
    }
    return colors[type] || colors.OTHER
  }

  const filteredEfforts = efforts.filter(effort =>
    effort.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    effort.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    effort.organizer.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Shield className="w-8 h-8 text-primary" />
                Admin - Pending Relief Efforts
              </h1>
              <p className="text-lg text-gray-600">
                Review and approve pending relief effort submissions
              </p>
            </div>
            <Button onClick={fetchEfforts} variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by effort name, organization, or organizer email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-yellow-600 mr-4" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{efforts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-600 mr-4" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Filtered</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredEfforts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Efforts List */}
        {filteredEfforts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">
                {searchQuery ? 'No efforts found matching your search' : 'No pending efforts'}
              </p>
              {!searchQuery && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-500">
                    All relief efforts that are submitted will appear here for approval.
                  </p>
                  <p className="text-sm text-gray-500">
                    Efforts are created with status "PENDING" and need admin approval to become "ACTIVE".
                  </p>
                  <Button
                    onClick={fetchEfforts}
                    variant="outline"
                    className="mt-4"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredEfforts.map((effort) => (
              <Card key={effort.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{effort.name}</CardTitle>
                      <CardDescription className="text-base">
                        {effort.description || 'No description provided'}
                      </CardDescription>
                    </div>
                    <Badge className={getDisasterTypeColor(effort.disasterType)}>
                      {effort.disasterType.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium">Organization:</span>
                        <span className="ml-2">{effort.organizationName}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium">Contact:</span>
                        <span className="ml-2">{effort.primaryContactName}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="ml-6">{effort.primaryContactPhone}</span>
                      </div>
                      {effort.website && (
                        <div className="flex items-center text-sm">
                          <Globe className="w-4 h-4 mr-2 text-gray-400" />
                          <a href={effort.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {effort.website}
                          </a>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium">Organizer:</span>
                        <span className="ml-2">{effort.organizer.email}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium">Submitted:</span>
                        <span className="ml-2">
                          {new Date(effort.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-4 border-t">
                    <Button
                      onClick={() => {
                        setSelectedEffort(effort)
                        setApproveDialogOpen(true)
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedEffort(effort)
                        setRejectDialogOpen(true)
                      }}
                      variant="destructive"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => router.push(`/efforts/${effort.slug}`)}
                      variant="outline"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Approve Dialog */}
        <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Relief Effort</DialogTitle>
              <DialogDescription>
                Are you sure you want to approve "{selectedEffort?.name}"? This will make it active and visible to users.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Notes (optional)
                </label>
                <Textarea
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder="Add any notes about the verification process..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setApproveDialogOpen(false)
                  setVerificationNotes('')
                }}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApprove}
                disabled={processing}
                className="bg-green-600 hover:bg-green-700"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Relief Effort</DialogTitle>
              <DialogDescription>
                Are you sure you want to reject "{selectedEffort?.name}"? This will cancel the effort.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason (optional)
                </label>
                <Textarea
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder="Provide a reason for rejection..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setRejectDialogOpen(false)
                  setVerificationNotes('')
                }}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                disabled={processing}
                variant="destructive"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

