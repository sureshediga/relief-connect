'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

function Tab({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={
        `px-3 py-2 text-sm rounded-md border ${active ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`
      }
    >
      {label}
    </Link>
  )
}

export function EffortSubnav({ slug }: { slug: string }) {
  const pathname = usePathname() || ''
  const base = `/efforts/${slug}`
  const items = [
    { href: base, label: 'Overview' },
    { href: `${base}/volunteer`, label: 'Join As a Volunteer' },
    { href: `${base}/volunteers`, label: 'Volunteers' },
    { href: `${base}/resources`, label: 'Resources' },
    { href: `${base}/donations`, label: 'Donations' },
    { href: `${base}/help-requests/new`, label: 'Submit Help Request' },
    { href: `${base}/media`, label: 'Media Gallery' },
    { href: `${base}/members`, label: 'Members' },
  ]
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(i => (
        <Tab key={i.href} href={i.href} label={i.label} active={pathname === i.href} />
      ))}
    </div>
  )
}


