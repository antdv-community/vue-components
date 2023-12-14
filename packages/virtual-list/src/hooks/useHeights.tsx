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
  const instanceRef = shallowRef(new Map<Key, HTMLElement>())
  const heightsRef = shallowRef(new CacheMap())
  const collectRafRef = shallowRef<number>()

  function cancelRaf() {
    if (collectRafRef.value)
      raf.cancel(collectRafRef.value)
  }

  function collectHeight(sync = false) {
    cancelRaf()

    const doCollect = () => {
      instanceRef.value.forEach((element, key) => {
        if (element && element.offsetParent) {
          const htmlElement = findDOMNode<HTMLElement>(element) as HTMLElement
          const { offsetHeight } = htmlElement
          if (heightsRef.value.get(key) !== offsetHeight)
            heightsRef.value.set(key, htmlElement.offsetHeight)
        }
      })

      // Always trigger update mark to tell parent that should re-calculate heights when resized
      updatedMark.value += 1
    }

    if (sync)
      doCollect()
    else
      collectRafRef.value = raf(doCollect)
  }

  function setInstanceRef(item: T, instance: HTMLElement) {
    const key = getKey(item)
    const origin = instanceRef.value.get(key)

    if (instance) {
      instanceRef.value.set(key, instance)
      collectHeight()
    }
    else {
      instanceRef.value.delete(key)
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

  return [setInstanceRef, collectHeight, heightsRef.value, updatedMark]
}
