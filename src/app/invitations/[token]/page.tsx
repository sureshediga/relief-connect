'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { EffortInvitation } from '@/types'

export default function InvitationAcceptPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const token = params.token as string

  const [invitation, setInvitation] = useState<EffortInvitation | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (token) {
      loadInvitation()
    }
  }, [token])

  const loadInvitation = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/invitations/${token}`)
      const data = await response.json()

      if (data.success) {
        setInvitation(data.data)
      } else {
        setError(data.error || 'Invitation not found')
      }
    } catch (err) {
      setError('Failed to load invitation')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async () => {
    if (!session?.user?.id) {
      router.push(`/auth/signin?callbackUrl=/invitations/${token}`)
      return
    }

    try {
      setAccepting(true)
      setError(null)
      const response = await fetch(`/api/invitations/${token}`, {
        method: 'POST'
      })

      const data = await response.json()
      if (data.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push(`/efforts/${data.data.effortSlug}`)
        }, 2000)
      } else {
        setError(data.error || 'Failed to accept invitation')
      }
    } catch (err) {
      setError('Failed to accept invitation')
    } finally {
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <XCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Invitation Accepted!</h2>
              <p className="text-gray-600">Redirecting to the effort page...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>You've been invited!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {invitation && (
            <>
              <div>
                <h3 className="font-semibold text-lg">{invitation.effort?.name}</h3>
                <p className="text-gray-600 text-sm mt-1">{invitation.effort?.description}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm space-y-2">
                  <div>
                    <span className="font-medium">Role:</span> {invitation.role}
                  </div>
                  <div>
                    <span className="font-medium">Organization:</span>{' '}
                    {invitation.effort?.organizationName}
                  </div>
                  {invitation.inviter && (
                    <div>
                      <span className="font-medium">Invited by:</span>{' '}
                      {invitation.inviter.name || invitation.inviter.email}
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {status === 'unauthenticated' ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Please sign in to accept this invitation.
                  </p>
                  <Button
                    className="w-full"
                    onClick={() => router.push(`/auth/signin?callbackUrl=/invitations/${token}`)}
                  >
                    Sign In
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full"
                  onClick={handleAccept}
                  disabled={accepting}
                >
                  {accepting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Accepting...
                    </>
                  ) : (
                    'Accept Invitation'
                  )}
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


