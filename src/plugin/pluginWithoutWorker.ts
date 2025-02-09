import type { PiniaPluginContext, StateTree, DefineStoreOptions } from 'pinia'

type Serializer<T extends StateTree> = {
  serialize: (value: T) => string
  deserialize: (value: string) => T
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

/**
 * Creates a worker handler for state synchronization
 */
function createWorkerHandler<T extends StateTree>({
  store,
  worker,
  serializer,
}: {
  store: PiniaPluginContext['store']
  worker: Worker
  serializer: Serializer<T>
}) {
  let externalUpdate = false

  // Initialize the worker for this store
  worker.postMessage({ type: 'INIT', storeId: store.$id })

  // State change listener
  store.$subscribe(() => {
    if (externalUpdate) return
    worker.postMessage({
      type: 'BROADCAST_STATE',
      storeId: store.$id,
      state: serializer.serialize(store.$state as T),
    })
  })

  // Worker message handler
  worker.addEventListener('message', (event) => {
    const { type, state, storeId } = event.data

    if (storeId !== store.$id) return

    if (type === 'SYNC_REQUEST') {
      worker.postMessage({
        type: 'BROADCAST_STATE',
        storeId: store.$id,
        state: serializer.serialize(store.$state as T),
      })
      return
    }

    if (type === 'STATE_UPDATE' && state) {
      externalUpdate = true
      store.$patch(serializer.deserialize(state))
      externalUpdate = false
    }
  })

  return {
    requestSync: () => worker.postMessage({ type: 'REQUEST_SYNC', storeId: store.$id }),
  }
}

// Create a single shared worker instance
const worker = new Worker(new URL('./sync.worker.ts', import.meta.url), { type: 'module' })

/**
 * Pinia plugin for state sharing across browser tabs using Web Workers
 */
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

    const handler = createWorkerHandler({ store, worker, serializer })

    // Initial state sync
    if (options.share?.initialize ?? initialize) {
      handler.requestSync()
    }
  }
}
