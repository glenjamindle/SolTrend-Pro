import { NextRequest, NextResponse } from 'next/server'
import JSZip from 'jszip'
import { getPhotoBytes } from '@/lib/storage'

// POST /api/gallery/zip
// body: { keys: string[] } - the bucket object keys (not the /api/photos/...
// urls) for whichever photos the user selected in the Gallery tab, from any
// of the four sources it draws from (inspection, refusal, production, or a
// standalone gallery upload - all photos in this app share the same bucket
// and the same key shape, so one endpoint covers all of them). Builds the
// zip in memory and returns it in one response rather than streaming,
// which is simpler and plenty fast for a selection sized for a phone
// screen; a selection in the thousands isn't a realistic case here.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { keys } = body as { keys: string[] }

    if (!Array.isArray(keys) || keys.length === 0) {
      return NextResponse.json({ error: 'keys is required and must be a non-empty array' }, { status: 400 })
    }
    if (keys.length > 200) {
      return NextResponse.json({ error: 'Select 200 photos or fewer at a time' }, { status: 400 })
    }

    const zip = new JSZip()
    let included = 0
    for (const key of keys) {
      const photo = await getPhotoBytes(key)
      if (!photo) continue
      const ext = photo.contentType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg'
      // Flatten to a readable filename - the key itself is a path like
      // "inspection/12-7/1234-ab.jpg", which makes a fine unique name once
      // the slashes are swapped out, without a visible folder structure the
      // user never asked for.
      const safeName = key.replace(/\//g, '-').replace(/\.[a-zA-Z0-9]+$/, '') + '.' + ext
      zip.file(safeName, photo.bytes)
      included++
    }

    if (included === 0) {
      return NextResponse.json({ error: 'None of the selected photos could be found' }, { status: 404 })
    }

    const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } })
    const stamp = new Date().toISOString().slice(0, 10)

    // NextResponse's BodyInit typing doesn't accept a Node Buffer directly
    // (it's missing the Blob/ArrayBufferView overlap TS wants) - wrapping it
    // in a Uint8Array view is a zero-copy reinterpretation of the same bytes.
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="soltrend-photos-${stamp}.zip"`,
      },
    })
  } catch (error) {
    console.error('Error building gallery zip:', error)
    return NextResponse.json({ error: 'Failed to build the download' }, { status: 500 })
  }
}
