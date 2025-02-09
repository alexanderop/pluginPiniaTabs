interface BroadcastMessage {
  type: 'STATE_UPDATE' | 'SYNC_REQUEST'
  timestamp?: number
  state?: string
  storeId: string
}

interface WorkerMessage {
  type: 'INIT' | 'BROADCAST_STATE' | 'REQUEST_SYNC'
  storeId: string
  state?: string
}

const channels = new Map<string, BroadcastChannel>()
const timestamps = new Map<string, number>()

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { type, storeId, state } = event.data

  if (type === 'INIT') {
    if (!channels.has(storeId)) {
      const channel = new BroadcastChannel(storeId)
      channels.set(storeId, channel)
      timestamps.set(storeId, 0)

      channel.onmessage = (e: MessageEvent<BroadcastMessage>) => {
        const data = e.data
        const currentTimestamp = timestamps.get(storeId) || 0

        if (data.type === 'SYNC_REQUEST') {
          self.postMessage({ type: 'SYNC_REQUEST', storeId })
          return
        }

        if (
          data.type === 'STATE_UPDATE' &&
          data.timestamp &&
          data.timestamp > currentTimestamp &&
          data.state
        ) {
          timestamps.set(storeId, data.timestamp)
          self.postMessage({
            type: 'STATE_UPDATE',
            storeId,
            state: data.state,
            timestamp: data.timestamp,
          })
        }
      }
    }
  }

  if (type === 'BROADCAST_STATE') {
    const channel = channels.get(storeId)
    if (channel && state) {
      const timestamp = Date.now()
      timestamps.set(storeId, timestamp)
      channel.postMessage({
        type: 'STATE_UPDATE',
        timestamp,
        state,
        storeId,
      })
    }
  }

  if (type === 'REQUEST_SYNC') {
    const channel = channels.get(storeId)
    if (channel) {
      channel.postMessage({ type: 'SYNC_REQUEST', storeId })
    }
  }
}
