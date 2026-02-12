import sharp from 'sharp'
import { apiFormDataRequest } from '../../lib/contexter-api'
import { encryptBuffer } from '../../lib/encryption'
import { getEncryptionKey } from '../../store'

export async function uploadScreenshot(imageBuffer: Buffer): Promise<void> {
  const metadata = await sharp(imageBuffer).metadata()
  const width = metadata.width || 0
  const height = metadata.height || 0

  const encryptionKey = getEncryptionKey()
  if (!encryptionKey) {
    return
  }
  const finalBuffer = encryptBuffer(imageBuffer, encryptionKey)

  const mimeType = 'application/octet-stream'
  const extension = 'enc'

  const formData = new FormData()
  const uint8Array = new Uint8Array(finalBuffer)
  const blob = new Blob([uint8Array], { type: mimeType })
  formData.append('screenshot', blob, `screenshot-${Date.now()}.${extension}`)
  formData.append('encrypted', 'true')
  formData.append('width', String(width))
  formData.append('height', String(height))

  await apiFormDataRequest({
    path: '/api/screenshots',
    formData,
  })

  console.log('Screenshot uploaded successfully')
}
