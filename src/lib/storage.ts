import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'

// Railway Storage Bucket (S3-compatible). Credentials come from variable
// references to the "soltrend-photos" bucket - see BUCKET_* env vars.
const BUCKET = process.env.BUCKET_NAME as string

function getClient() {
  return new S3Client({
    region: process.env.BUCKET_REGION || 'auto',
    endpoint: process.env.BUCKET_ENDPOINT,
    credentials: {
      accessKeyId: process.env.BUCKET_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.BUCKET_SECRET_ACCESS_KEY as string,
    },
  })
}

// Accepts a data: URL (as produced by the client-side photo capture/resize
// canvas) and uploads the decoded bytes to the bucket under keyPrefix.
// Returns the object key and a same-origin URL that proxies the bytes back
// through /api/photos/[...key] - the bucket itself is private, so nothing
// outside this app can read the object directly.
export async function uploadPhoto(dataUrl: string, keyPrefix: string): Promise<{ key: string; url: string }> {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl)
  if (!match) throw new Error('Invalid image data URL')

  const contentType = match[1]
  const buffer = Buffer.from(match[2], 'base64')
  const ext = contentType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg'
  const key = `${keyPrefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  await getClient().send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  )

  return { key, url: `/api/photos/${key}` }
}

export async function getPhotoBytes(key: string): Promise<{ bytes: Uint8Array; contentType: string } | null> {
  const res = await getClient().send(new GetObjectCommand({ Bucket: BUCKET, Key: key }))
  if (!res.Body) return null
  const bytes = await res.Body.transformToByteArray()
  return { bytes, contentType: res.ContentType || 'application/octet-stream' }
}
