import type { Ref } from 'vue'
import type { GetKey, GetSize, Key } from '../interface'
import type CacheMap from '../utils/CacheMap'
import { shallowRef, watch } from 'vue'

/**
 * Size info need loop query for the `heights` which will has the perf issue.
 * Let cache result for each render phase.
 */
export function useGetSize<T>(
  _mergedData: Ref<T[]>,
  getKey: GetKey<T>,
  heights: CacheMap,
  _itemHeight: Ref<number | undefined>,
) {
  const sizeComputed = shallowRef<[key2Index: Map<Key, number>, bottomList: number[]]>([new Map(), []])
  watch([_mergedData, heights.id, _itemHeight], () => {
    sizeComputed.value = [new Map(), []]
  })

  const getSize: GetSize = (startKey, endKey = startKey) => {
    const [key2Index, bottomList] = sizeComputed.value
    const mergedData = _mergedData.value
    const itemHeight = _itemHeight.value
    // Get from cache first
    let startIndex = key2Index.get(startKey)
    let endIndex = key2Index.get(endKey)

    // Loop to fill the cache
    if (startIndex === undefined || endIndex === undefined) {
      const dataLen = mergedData.length
      for (let i = bottomList.length; i < dataLen; i += 1) {
        const item = mergedData[i]
        const key = getKey(item)
        key2Index.set(key, i)
        const cacheHeight = heights.get(key) ?? itemHeight
        bottomList[i] = (bottomList[i - 1] || 0) + cacheHeight
        if (key === startKey)
          startIndex = i

        if (key === endKey)
          endIndex = i

        if (startIndex !== undefined && endIndex !== undefined)
          break
      }
    }

    return {
      top: bottomList[startIndex! - 1] || 0,
      bottom: bottomList[endIndex!],
    }
  }

  return getSize
}
