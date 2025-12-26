import { IMessageSDK } from '@photon-ai/imessage-kit'
import { store, addRequestLog, getDeviceId, getDeviceSecret } from '../../store'

export type Message = {
  id: string
  text: string
  sender: string
  isFromMe: boolean
  date: Date
  chatId: string
  isGroup: boolean
}

export function createIMessageSDK(): IMessageSDK {
  return new IMessageSDK({ debug: false })
}

export async function fetchMessages(
  sdk: IMessageSDK,
  since: Date,
): Promise<Message[]> {
  const result = await sdk.getMessages({
    since,
    limit: 100,
  })

  return result.messages.map((msg) => ({
    id: msg.id,
    text: msg.text || '',
    sender: msg.sender,
    isFromMe: msg.isFromMe,
    date: msg.date,
    chatId: msg.chatId,
    isGroup: msg.isGroupChat,
  }))
}

export async function uploadMessages(messages: Message[]): Promise<void> {
  if (messages.length === 0) {
    return
  }

  const serverUrl = store.get('serverUrl')
  const deviceId = getDeviceId()
  const deviceSecret = getDeviceSecret()
  const path = '/api/messages'
  const uploadUrl = `${serverUrl}${path}`

  const startTime = Date.now()

  let response: Response
  try {
    response = await fetch(uploadUrl, {
      method: 'POST',
      body: JSON.stringify({ messages }),
      headers: {
        'Content-Type': 'application/json',
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

  console.log(`Uploaded ${messages.length} messages successfully`)
}
