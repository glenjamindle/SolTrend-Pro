import { NextRequest, NextResponse } from 'next/server'
import { getPhotoBytes } from '@/lib/storage'

// GET /api/photos/<key...>
// Streams a photo's bytes back from the private storage bucket. The bucket
// itself has no public access - this route is the only way to read a photo,
// and it sits behind the same auth middleware as the rest of the app (this
// path is not excluded in middleware.ts), so only logged-in users can view
// photos, and browsers include the session cookie automatically for <img>
// requests to the same origin.
export async function GET(request: NextRequest, { params }: { params: { key: string[] } }) {
  try {
    const key = params.key.join('/')
    const photo = await getPhotoBytes(key)
    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
    }
    return new NextResponse(Buffer.from(photo.bytes), {
      headers: {
        'Content-Type': photo.contentType,
        'Cache-Control': 'private, max-age=86400',
      },
    })
  } catch (error) {
    console.error('Error fetching photo:', error)
    return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
  }
}
