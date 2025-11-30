'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { EffortSubnav } from '@/components/efforts/effort-subnav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Users, UserPlus, Mail, X, Shield, UserCheck, Eye } from 'lucide-react'
import { EffortRole, EffortMember, EffortInvitation } from '@/types'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function EffortMembersPage() {
  const params = useParams()
  const { data: session } = useSession()
  const slug = params.slug as string

  const [members, setMembers] = useState<EffortMember[]>([])
  const [invitations, setInvitations] = useState<EffortInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<EffortRole | null>(null)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<EffortRole>(EffortRole.VOLUNTEER)
  const [inviteLoading, setInviteLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const isAdmin = userRole === EffortRole.ORGANIZER || userRole === EffortRole.COORDINATOR

  useEffect(() => {
    if (session?.user?.id) {
      loadData()
    }
  }, [session, slug])

  const loadData = async () => {
    try {
      setLoading(true)
      const [membersRes, invitationsRes] = await Promise.all([
        fetch(`/api/efforts/${slug}/members`),
        fetch(`/api/efforts/${slug}/invitations`)
      ])

      const membersData = await membersRes.json()
      const invitationsData = await invitationsRes.json()

      if (membersData.success) {
        setMembers(membersData.data)
        // Find current user's role
        const currentUserMember = membersData.data.find((m: EffortMember) => m.userId === session?.user?.id)
        setUserRole(currentUserMember?.role || null)
      }

      if (invitationsData.success) {
        setInvitations(invitationsData.data)
      }
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Failed to load members')
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async () => {
    if (!inviteEmail || !inviteEmail.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    try {
      setInviteLoading(true)
      setError(null)
      const response = await fetch(`/api/efforts/${slug}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole })
      })

      const data = await response.json()
      if (data.success) {
        setSuccess(`Invitation sent to ${inviteEmail}`)
        setInviteEmail('')
        setInviteRole(EffortRole.VOLUNTEER)
        setShowInviteDialog(false)
        loadData()
      } else {
        setError(data.error || 'Failed to send invitation')
      }
    } catch (err) {
      setError('Failed to send invitation')
    } finally {
      setInviteLoading(false)
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/efforts/${slug}/invitations?id=${invitationId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      if (data.success) {
        loadData()
      } else {
        setError(data.error || 'Failed to cancel invitation')
      }
    } catch (err) {
      setError('Failed to cancel invitation')
    }
  }

  const handleUpdateRole = async (memberId: string, newRole: EffortRole) => {
    try {
      const response = await fetch(`/api/efforts/${slug}/members?id=${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })

      const data = await response.json()
      if (data.success) {
        loadData()
      } else {
        setError(data.error || 'Failed to update role')
      }
    } catch (err) {
      setError('Failed to update role')
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    try {
      const response = await fetch(`/api/efforts/${slug}/members?id=${memberId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      if (data.success) {
        loadData()
      } else {
        setError(data.error || 'Failed to remove member')
      }
    } catch (err) {
      setError('Failed to remove member')
    }
  }

  const getRoleIcon = (role: EffortRole) => {
    switch (role) {
      case EffortRole.ORGANIZER:
        return <Shield className="w-4 h-4" />
      case EffortRole.COORDINATOR:
        return <UserCheck className="w-4 h-4" />
      case EffortRole.VOLUNTEER:
        return <Users className="w-4 h-4" />
      case EffortRole.VIEWER:
        return <Eye className="w-4 h-4" />
    }
  }

  const getRoleColor = (role: EffortRole) => {
    switch (role) {
      case EffortRole.ORGANIZER:
        return 'bg-purple-100 text-purple-800'
      case EffortRole.COORDINATOR:
        return 'bg-blue-100 text-blue-800'
      case EffortRole.VOLUNTEER:
        return 'bg-green-100 text-green-800'
      case EffortRole.VIEWER:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <EffortSubnav slug={slug} />
          <div className="flex items-center justify-center h-64">
            <div>Loading...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <EffortSubnav slug={slug} />

        <div className="mt-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Team Members</h1>
          {isAdmin && (
            <Button onClick={() => setShowInviteDialog(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Member
            </Button>
          )}
        </div>

        {error && (
          <Alert className="mt-4 bg-red-50 border-red-200">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mt-4 bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Members ({members.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={member.user?.avatar || undefined} />
                        <AvatarFallback>
                          {member.user?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.user?.name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{member.user?.email}</div>
                        <div className="text-xs text-gray-400">
                          Joined {new Date(member.joinedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getRoleColor(member.role)}>
                        <span className="flex items-center">
                          {getRoleIcon(member.role)}
                          <span className="ml-1">{member.role}</span>
                        </span>
                      </Badge>
                      {isAdmin && member.userId !== session?.user?.id && member.role !== EffortRole.ORGANIZER && (
                        <div className="flex space-x-1">
                          <Select
                            value={member.role}
                            onValueChange={(value) => handleUpdateRole(member.id, value as EffortRole)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={EffortRole.COORDINATOR}>Coordinator</SelectItem>
                              <SelectItem value={EffortRole.VOLUNTEER}>Volunteer</SelectItem>
                              <SelectItem value={EffortRole.VIEWER}>Viewer</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Pending Invitations ({invitations.filter(i => i.status === 'PENDING').length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invitations
                    .filter((inv) => inv.status === 'PENDING')
                    .map((invitation) => (
                      <div
                        key={invitation.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <div className="font-medium">{invitation.email}</div>
                          <div className="text-sm text-gray-500">
                            Invited as {invitation.role}
                          </div>
                          <div className="text-xs text-gray-400">
                            Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelInvitation(invitation.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  {invitations.filter((inv) => inv.status === 'PENDING').length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      No pending invitations
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as EffortRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EffortRole.COORDINATOR}>Coordinator</SelectItem>
                    <SelectItem value={EffortRole.VOLUNTEER}>Volunteer</SelectItem>
                    <SelectItem value={EffortRole.VIEWER}>Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleInvite} disabled={inviteLoading}>
                {inviteLoading ? 'Sending...' : 'Send Invitation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}


