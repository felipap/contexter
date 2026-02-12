import { desktopCapturer, screen } from 'electron'
import sharp from 'sharp'

const IMAGE_CONFIG = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 80,
}

async function resizeScreenshot(buffer: Buffer): Promise<Buffer> {
  const image = sharp(buffer)
  const metadata = await image.metadata()

  const needsResize =
    (metadata.width && metadata.width > IMAGE_CONFIG.maxWidth) ||
    (metadata.height && metadata.height > IMAGE_CONFIG.maxHeight)

  let pipeline = image

  if (needsResize) {
    pipeline = pipeline.resize(IMAGE_CONFIG.maxWidth, IMAGE_CONFIG.maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    })
  }

  return pipeline.webp({ quality: IMAGE_CONFIG.quality }).toBuffer()
}

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

  return resizeScreenshot(pngBuffer)
}
