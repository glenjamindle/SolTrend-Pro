import { NextRequest, NextResponse } from 'next/server'
import { uploadFile } from '@/lib/storage'

// POST /api/upload-document
// body: { dataUrl: "data:application/pdf;base64,...", context: "document"|"coi" }
// Same idea as /api/upload, but for arbitrary file types (PDFs, drawing
// sets) rather than photos only - used by the Documents library and COI
// uploads. Returns { key, url, size, contentType }; url is a same-origin
// path (/api/photos/...) that proxies the bytes back through this app.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dataUrl, context } = body

    if (!dataUrl || typeof dataUrl !== 'string') {
      return NextResponse.json({ error: 'dataUrl is required' }, { status: 400 })
    }

    const safeContext = ['document', 'coi'].includes(context) ? context : 'misc'
    const { key, url, size, contentType } = await uploadFile(dataUrl, safeContext)
    return NextResponse.json({ key, url, size, contentType })
  } catch (error) {
    console.error('Error uploading document:', error)
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 })
  }
}
