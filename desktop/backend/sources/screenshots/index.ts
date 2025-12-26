import { desktopCapturer, screen } from 'electron'
import { store, addRequestLog, getDeviceId, getDeviceSecret } from '../../store'

export async function captureScreen(): Promise<Buffer | null> {
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.size

  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: { width, height },
  })

  if (sources.length === 0) {
    console.error('No screen sources found')
    return null
  }

  const primarySource = sources[0]
  const thumbnail = primarySource.thumbnail

  if (thumbnail.isEmpty()) {
    console.error('Screen capture returned empty thumbnail')
    return null
  }

  const pngBuffer = thumbnail.toPNG()
  if (pngBuffer.length === 0) {
    console.error('Screen capture returned empty PNG buffer')
    return null
  }

  return pngBuffer
}

export async function uploadScreenshot(imageBuffer: Buffer): Promise<void> {
  const serverUrl = store.get('serverUrl')
  const deviceId = getDeviceId()
  const deviceSecret = getDeviceSecret()
  const path = '/api/screenshots'
  const uploadUrl = `${serverUrl}${path}`

  const formData = new FormData()
  const uint8Array = new Uint8Array(imageBuffer)
  const blob = new Blob([uint8Array], { type: 'image/png' })
  formData.append('screenshot', blob, `screenshot-${Date.now()}.png`)

  const startTime = Date.now()

  let response: Response
  try {
    response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'x-device-id': deviceId,
        Authorization: `Bearer ${deviceSecret}`,
      },
    })
  } catch (error) {
    addRequestLog({
      timestamp: startTime,
      method: 'POST',
      path,
      status: 'error',
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Network error',
    })
    throw error
  }

  const duration = Date.now() - startTime

  if (!response.ok) {
    addRequestLog({
      timestamp: startTime,
      method: 'POST',
      path,
      status: 'error',
      statusCode: response.status,
      duration,
      error: `${response.status} ${response.statusText}`,
    })
    throw new Error(`Upload failed: ${response.status} ${response.statusText}`)
  }

  addRequestLog({
    timestamp: startTime,
    method: 'POST',
    path,
    status: 'success',
    statusCode: response.status,
    duration,
  })

  console.log('Screenshot uploaded successfully')
}
