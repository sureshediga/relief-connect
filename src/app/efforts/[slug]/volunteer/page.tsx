'use client'

export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import VolunteerRegistrationPage from '@/app/volunteers/register/page'

export default function EffortVolunteerPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const slug = params.slug as string

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/auth/signin?callbackUrl=/efforts/${slug}/volunteer`)
    }
  }, [status, router, slug])

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (status === 'unauthenticated') {
    return null
  }

  return <VolunteerRegistrationPage />
}



