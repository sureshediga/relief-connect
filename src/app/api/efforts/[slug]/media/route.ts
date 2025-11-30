import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { promises as fs } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params
  const effort = await db.effort.findUnique({ where: { slug } })
  if (!effort) return NextResponse.json({ success: false, error: 'Effort not found' }, { status: 404 })
  const media = await db.media.findMany({
    where: { effortId: effort.id },
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { id: true, name: true } } }
  })
  return NextResponse.json({ success: true, data: media })
}

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
  }
  const { slug } = params
  const effort = await db.effort.findUnique({ where: { slug } })
  if (!effort) return NextResponse.json({ success: false, error: 'Effort not found' }, { status: 404 })

  if (!request.headers.get('content-type')?.startsWith('multipart/form-data')) {
    return NextResponse.json({ success: false, error: 'Only multipart/form-data supported' }, { status: 415 })
  }

  const boundary = request.headers.get('content-type')?.split('boundary=')[1]
  if (!boundary) return NextResponse.json({ success: false, error: 'Invalid form' }, { status: 400 })
  const buffer = Buffer.from(await request.arrayBuffer())
  const delimiter = Buffer.from(`--${boundary}`)
  const parts = buffer.toString().split(delimiter)
  const files: { name: string; content: Buffer }[] = []
  let caption: string | undefined = undefined
  parts.forEach(part => {
    if (part.includes('name="caption"')) {
      const start = part.indexOf('\r\n\r\n')
      if (start !== -1) {
        const text = part.slice(start + 4, part.lastIndexOf('\r\n'))
        caption = text.trim()
      }
    }
    if (part.includes('name="file"')) {
      const match = /filename="([^"]+)"/.exec(part)
      const original = match?.[1] || `${randomUUID()}.jpg`
      const fileStart = part.indexOf('\r\n\r\n')
      if (fileStart !== -1) {
        const fileContent = part.slice(fileStart + 4, part.lastIndexOf('\r\n'))
        files.push({ name: original, content: Buffer.from(fileContent, 'binary') })
      }
    }
  })

  if (files.length === 0) return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })

  await fs.mkdir(UPLOAD_DIR, { recursive: true })
  const created: any[] = []
  for (const f of files) {
    const ext = path.extname(f.name) || '.jpg'
    const destName = `${Date.now()}-${randomUUID()}${ext}`
    const destPath = path.join(UPLOAD_DIR, destName)
    await fs.writeFile(destPath, f.content)
    const publicUrl = `/uploads/${destName}`
    const media = await db.media.create({
      data: {
        effortId: effort.id,
        userId: session.user.id,
        url: publicUrl,
        type: 'IMAGE',
        caption: caption,
      },
    })
    created.push(media)
  }
  return NextResponse.json({ success: true, data: created })
}
