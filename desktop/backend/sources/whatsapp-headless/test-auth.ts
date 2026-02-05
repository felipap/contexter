// Test script for whatsapp-web.js authentication
// Run with: npx ts-node backend/sources/whatsapp-headless/test-auth.ts

import { WhatsAppHeadlessClient, displayQrCode } from './index'

async function main() {
  console.log('Initializing WhatsApp Web client...')
  console.log('This will open a headless Chromium browser.\n')

  const client = new WhatsAppHeadlessClient({
    dataPath: '/tmp/whatsapp-headless-test-session',
  })

  client.on('qr', (qr: string) => {
    console.log('\n📱 Scan this QR code with WhatsApp on your phone:\n')
    displayQrCode(qr)
    console.log('\n(QR code refreshes every ~20 seconds)\n')
  })

  client.on('authenticated', () => {
    console.log('✅ Authenticated! Session saved.\n')
  })

  client.on('ready', async () => {
    console.log('🚀 Client is ready!\n')

    // Fetch and display chats
    const chats = await client.getChats()
    console.log(`Found ${chats.length} chats:\n`)

    for (const chat of chats.slice(0, 10)) {
      console.log(`  - ${chat.name} (${chat.isGroup ? 'group' : 'dm'})`)
    }

    if (chats.length > 10) {
      console.log(`  ... and ${chats.length - 10} more`)
    }

    console.log('\n✅ Test successful! Press Ctrl+C to exit.')
  })

  client.on('disconnected', (reason: string) => {
    console.log('❌ Disconnected:', reason)
    process.exit(1)
  })

  client.on('message', (msg) => {
    console.log(
      `📨 New message from ${msg.senderName || msg.senderNumber}: ${msg.text?.slice(0, 50)}...`,
    )
  })

  await client.initialize()
}

main()
  .catch((err) => {
    console.error('Error:', err.message)
    process.exit(1)
  })
  .then(() => {
    console.log('Test successful!')
    process.exit(0)
  })
