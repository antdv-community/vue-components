import findDOMNode from '@vue-components/util/Dom/findDOMNode'
import raf from '@vue-components/util/raf'
import type { ShallowRef } from 'vue'
import { onBeforeUnmount, shallowRef } from 'vue'
import type { GetKey, Key } from '../interface'
import CacheMap from '../utils/CacheMap'

export default function useHeights<T>(
  getKey: GetKey<T>,
  onItemAdd?: (item: T) => void,
  onItemRemove?: (item: T) => void,
): [
    setInstanceRef: (item: T, instance: HTMLElement) => void,
    collectHeight: (sync?: boolean) => void,
    cacheMap: CacheMap,
    updatedMark: ShallowRef<number>,
  ] {
  const updatedMark = shallowRef(0)
  const instanceRef = new Map<Key, HTMLElement>()
  const heightsRef = new CacheMap()
  let collectRafRef: number

  function cancelRaf() {
    if (collectRafRef)
      raf.cancel(collectRafRef)
  }

  function collectHeight(sync = false) {
    cancelRaf()

    const doCollect = () => {
      instanceRef.forEach((element, key) => {
        if (element && element.offsetParent) {
          const htmlElement = findDOMNode<HTMLElement>(element) as HTMLElement
          const { offsetHeight } = htmlElement
          if (heightsRef.get(key) !== offsetHeight)
            heightsRef.set(key, htmlElement.offsetHeight)
        }
      })

      // Always trigger update mark to tell parent that should re-calculate heights when resized
      updatedMark.value += 1
    }

    if (sync)
      doCollect()
    else
      collectRafRef = raf(doCollect)
  }

  function setInstanceRef(item: T, instance: HTMLElement) {
    const key = getKey(item)
    const origin = instanceRef.get(key)

    if (instance) {
      instanceRef.set(key, instance)
      collectHeight()
    }
    else {
      instanceRef.delete(key)
    }

    // Instance changed
    if (!origin !== !instance) {
      if (instance)
        onItemAdd?.(item)
      else
        onItemRemove?.(item)
    }
  }

  onBeforeUnmount(() => {
    cancelRaf()
  })

  return [setInstanceRef, collectHeight, heightsRef, updatedMark]
}
