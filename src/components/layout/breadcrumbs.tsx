'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Breadcrumbs() {
  const pathname = usePathname()
  const segments = (pathname || '/').split('/').filter(Boolean)

  if (segments.length === 0) {
    return (
      <nav aria-label="Breadcrumb" className="text-sm text-gray-500">
        <span>Home</span>
      </nav>
    )
  }

  const parts = segments.map((seg, idx) => {
    const href = '/' + segments.slice(0, idx + 1).join('/')
    const label = decodeURIComponent(seg).replace(/-/g, ' ')
    const isLast = idx === segments.length - 1
    return (
      <span key={href} className="inline-flex items-center">
        <span className="mx-2 text-gray-300">/</span>
        {isLast ? (
          <span className="text-gray-700 capitalize">{label}</span>
        ) : (
          <Link href={href} className="text-blue-600 hover:underline capitalize">
            {label}
          </Link>
        )}
      </span>
    )
  })

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-gray-500">
      <Link href="/" className="text-blue-600 hover:underline">Home</Link>
      {parts}
    </nav>
  )
}




