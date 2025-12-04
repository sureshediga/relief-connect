'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function TestLinksPage() {
  const router = useRouter()
  const [clicked, setClicked] = useState('')

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-8">Link Test Page</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Next.js Link Components:</h2>
          <div className="space-x-2">
            <Link href="/" className="text-blue-600 underline">
              Home (Link)
            </Link>
            <Link href="/auth/signin" className="text-blue-600 underline">
              Sign In (Link)
            </Link>
            <Link href="/efforts/create" className="text-blue-600 underline">
              Create Effort (Link)
            </Link>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Router.push() Buttons:</h2>
          <div className="space-x-2">
            <Button onClick={() => {
              setClicked('Home')
              router.push('/')
            }}>
              Home (router.push)
            </Button>
            <Button onClick={() => {
              setClicked('Sign In')
              router.push('/auth/signin')
            }}>
              Sign In (router.push)
            </Button>
            <Button onClick={() => {
              setClicked('Create')
              router.push('/efforts/create')
            }}>
              Create Effort (router.push)
            </Button>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Window.location:</h2>
          <div className="space-x-2">
            <Button onClick={() => {
              setClicked('Home (window)')
              window.location.href = '/'
            }}>
              Home (window.location)
            </Button>
            <Button onClick={() => {
              setClicked('Sign In (window)')
              window.location.href = '/auth/signin'
            }}>
              Sign In (window.location)
            </Button>
          </div>
        </div>

        {clicked && (
          <div className="mt-4 p-4 bg-green-100 rounded">
            <p>Last clicked: {clicked}</p>
            <p className="text-sm text-gray-600">If you see this, JavaScript is working!</p>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">Check Console:</h2>
          <p className="text-sm text-gray-600">
            Open your browser console (F12) and check for any JavaScript errors.
          </p>
        </div>
      </div>
    </div>
  )
}

