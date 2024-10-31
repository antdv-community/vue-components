import type { Key } from '../interface.ts'
// Firefox has low performance of map.
import { shallowRef } from 'vue'

class CacheMap {
  maps: Record<string, number>

  // Used for cache key
  // `useMemo` no need to update if `id` not change
  id = shallowRef(0)

  constructor() {
    this.maps = Object.create(null)
  }

  set(key: Key, value: number) {
    this.maps[key as string] = value
    this.id.value += 1
  }

  get(key: Key) {
    return this.maps[key as string]
  }
}

export default CacheMap
