import { readFile, readdir } from 'fs/promises'
import { join } from 'path'
import { homedir } from 'os'
import { convertHeicToJpeg } from './images'

async function findHeicFiles(dir: string, limit = 5): Promise<string[]> {
  const heicFiles: string[] = []

  async function walk(currentDir: string) {
    if (heicFiles.length >= limit) {
      return
    }

    let entries
    try {
      entries = await readdir(currentDir, { withFileTypes: true })
    } catch {
      return // Skip directories we can't read
    }

    for (const entry of entries) {
      if (heicFiles.length >= limit) {
        break
      }

      const fullPath = join(currentDir, entry.name)

      if (entry.isDirectory()) {
        await walk(fullPath)
      } else if (
        entry.isFile() &&
        (entry.name.toLowerCase().endsWith('.heic') ||
          entry.name.toLowerCase().endsWith('.heif'))
      ) {
        heicFiles.push(fullPath)
      }
    }
  }

  await walk(dir)
  return heicFiles
}

async function main() {
  console.log('Testing HEIC conversion...\n')

  const attachmentsDir = join(homedir(), 'Library/Messages/Attachments')

  console.log(`Looking for HEIC files in ${attachmentsDir}...`)
  const heicFiles = await findHeicFiles(attachmentsDir, 5)

  if (heicFiles.length === 0) {
    console.log('⚠ No HEIC files found in Messages attachments')
    return
  }

  console.log(`Found ${heicFiles.length} HEIC files to test\n`)

  let passed = 0
  let failed = 0

  for (const filePath of heicFiles) {
    const filename = filePath.split('/').pop()
    try {
      const inputBuffer = await readFile(filePath)
      const outputBuffer = await convertHeicToJpeg(inputBuffer)

      // Basic validation: JPEG files start with 0xFF 0xD8
      const isValidJpeg = outputBuffer[0] === 0xff && outputBuffer[1] === 0xd8

      if (isValidJpeg) {
        console.log(`✓ ${filename} (${inputBuffer.length} → ${outputBuffer.length} bytes)`)
        passed++
      } else {
        console.log(`✗ ${filename} - Output is not valid JPEG`)
        failed++
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.log(`✗ ${filename} - ${message}`)
      failed++
    }
  }

  console.log(`\nHEIC conversion: ${passed} passed, ${failed} failed`)

  if (failed > 0) {
    throw new Error(`${failed} HEIC conversion(s) failed`)
  }

  console.log('\n✓ All tests passed')
}

main().catch((err) => {
  console.error('\n✗ Test failed:', err.message)
  process.exit(1)
})
