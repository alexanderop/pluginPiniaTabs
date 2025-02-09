import type { PiniaPluginContext, StateTree, DefineStoreOptions } from 'pinia'

type Serializer<T extends StateTree> = {
  serialize: (value: T) => string
  deserialize: (value: string) => T
}

interface BroadcastMessage {
  type: 'STATE_UPDATE' | 'SYNC_REQUEST'
  timestamp?: number
  state?: string
}

type PluginOptions<T extends StateTree> = {
  enable?: boolean
  initialize?: boolean
  serializer?: Serializer<T>
}

export interface StoreOptions<S extends StateTree = StateTree, G = object, A = object>
  extends DefineStoreOptions<string, S, G, A> {
  share?: PluginOptions<S>
}

// Add type extension for Pinia
declare module 'pinia' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export interface DefineStoreOptionsBase<S, Store> {
    share?: PluginOptions<S>
  }
}

export function PiniaSharedState<T extends StateTree>({
  enable = false,
  initialize = false,
  serializer = {
    serialize: JSON.stringify,
    deserialize: JSON.parse,
  },
}: PluginOptions<T> = {}) {
  return ({ store, options }: PiniaPluginContext) => {
    if (!(options.share?.enable ?? enable)) return

    const channel = new BroadcastChannel(store.$id)
    let timestamp = 0
    let externalUpdate = false

    // Initial state sync
    if (options.share?.initialize ?? initialize) {
      channel.postMessage({ type: 'SYNC_REQUEST' })
    }

    // State change listener
    store.$subscribe((_mutation, state) => {
      if (externalUpdate) return

      timestamp = Date.now()
      channel.postMessage({
        type: 'STATE_UPDATE',
        timestamp,
        state: serializer.serialize(state as T),
      })
    })

    // Message handler
    channel.onmessage = (event: MessageEvent<BroadcastMessage>) => {
      const data = event.data
      if (
        data.type === 'STATE_UPDATE' &&
        data.timestamp &&
        data.timestamp > timestamp &&
        data.state
      ) {
        externalUpdate = true
        timestamp = data.timestamp
        store.$patch(serializer.deserialize(data.state))
        externalUpdate = false
      }

      if (data.type === 'SYNC_REQUEST') {
        channel.postMessage({
          type: 'STATE_UPDATE',
          timestamp,
          state: serializer.serialize(store.$state as T),
        })
      }
    }
  }
}
