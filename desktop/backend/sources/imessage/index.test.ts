import { createIMessageSDK, fetchMessages } from './index'

async function main() {
  console.log('Testing iMessage export...')

  const sdk = createIMessageSDK()
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000) // last 24 hours

  const messages = await fetchMessages(sdk, since)

  console.log(`✓ Fetched ${messages.length} messages`)

  if (messages.length > 0) {
    console.log('Sample message:', {
      id: messages[0].id,
      text: messages[0].text.slice(0, 50),
      sender: messages[0].sender,
      isFromMe: messages[0].isFromMe,
      date: messages[0].date,
    })
  }
}

main().catch((err) => {
  console.error('✗ Test failed:', err.message)
  process.exit(1)
})
