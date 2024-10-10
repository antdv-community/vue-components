import type { ComputedRef, Ref } from 'vue'
import { shallowRef, watch } from 'vue'
import { warning } from '@v-c/util'
import raf from '@v-c/util/raf'
import type CacheMap from '../utils/CacheMap.ts'
import type { GetKey, Key } from '../interface.ts'

const MAX_TIMES = 10

export type ScrollAlign = 'top' | 'bottom' | 'auto'

export interface ScrollPos {
  left?: number
  top?: number
}

export type ScrollTarget =
  | {
    index: number
    align?: ScrollAlign
    offset?: number
  }
  | {
    key: Key
    align?: ScrollAlign
    offset?: number
  }

export default function useScrollTo<T>(
  containerRef: Ref<HTMLDivElement | undefined>,
  data: Ref<T[]>,
  heights: CacheMap,
  itemHeight: Ref<number> | ComputedRef<number>,
  getKey: GetKey<T>,
  collectHeight: () => void,
  syncScrollTop: (newTop: number) => void,
  triggerFlash: () => void,
) {
  const scrollRef = shallowRef<number>()

  const syncState = shallowRef<{
    times: number
    index: number
    offset: number
    originAlign: ScrollAlign
    targetAlign?: 'top' | 'bottom' | null
    lastTop?: number
  }>()

  const effectLayout = () => {
    if (syncState.value && syncState.value.times < MAX_TIMES) {
      if (!containerRef.value) {
        syncState.value = { ...syncState.value }
        return
      }
      collectHeight()
      const { targetAlign, originAlign, index, offset } = syncState.value!
      const height = containerRef.value.clientHeight
      let needCollectHeight = false
      let newTargetAlign: 'top' | 'bottom' | null = targetAlign!
      let targetTop: number | null = null

      // Go to next frame if height not exist
      if (height) {
        const mergedAlign = targetAlign || originAlign

        // Get top & bottom
        let stackTop = 0
        let itemTop = 0
        let itemBottom = 0

        const maxLen = Math.min(data.value.length - 1, index)

        for (let i = 0; i <= maxLen; i += 1) {
          const key = getKey(data.value[i])
          itemTop = stackTop
          const cacheHeight = heights.get(key)
          itemBottom = itemTop + (cacheHeight === undefined ? itemHeight.value : cacheHeight)

          stackTop = itemBottom
        }

        // Check if need sync height (visible range has item not record height)
        let leftHeight = mergedAlign === 'top' ? offset : height - offset
        for (let i = maxLen; i >= 0; i -= 1) {
          const key = getKey(data.value[i])
          const cacheHeight = heights.get(key)

          if (cacheHeight === undefined) {
            needCollectHeight = true
            break
          }

          leftHeight -= cacheHeight
          if (leftHeight <= 0)
            break
        }

        // Scroll to
        switch (mergedAlign) {
          case 'top':
            targetTop = itemTop - offset
            break
          case 'bottom':
            targetTop = itemBottom - height + offset
            break

          default: {
            const { scrollTop } = containerRef.value
            const scrollBottom = scrollTop + height
            if (itemTop < scrollTop)
              newTargetAlign = 'top'
            else if (itemBottom > scrollBottom)
              newTargetAlign = 'bottom'
          }
        }

        if (targetTop !== null)
          syncScrollTop(targetTop)

        // One more time for sync
        if (targetTop !== syncState.value!.lastTop)
          needCollectHeight = true

        // Trigger next effect
        if (needCollectHeight) {
          syncState.value = {
            ...syncState.value,
            times: syncState.value!.times + 1,
            targetAlign: newTargetAlign!,
            lastTop: targetTop!,
          } as any
        }
      }
    }

    else if (process.env.NODE_ENV !== 'production' && syncState.value?.times === MAX_TIMES) {
      warning(
        false,
        'Seems `scrollTo` with `vc-virtual-list` reach the max limitation. Please fire issue for us. Thanks.',
      )
    }
  }

  watch([syncState, containerRef], () => {
    if (containerRef.value && syncState.value)
      effectLayout()
  }, {
    flush: 'post',
  })
  // =========================== Scroll To ===========================
  return (arg: any) => {
    // When not argument provided, we think dev may want to show the scrollbar
    if (arg === null || arg === undefined) {
      triggerFlash()
      return
    }
    // Normal scroll logic
    raf.cancel(scrollRef.value!)

    if (typeof arg === 'number') {
      syncScrollTop(arg)
    }
    else if (arg && typeof arg === 'object') {
      let index: number
      const { align } = arg

      if ('index' in arg)
        ({ index } = arg)
      else
        index = data.value.findIndex(item => getKey(item) === arg.key)

      const { offset = 0 } = arg

      syncState.value = {
        times: 0,
        index,
        offset,
        originAlign: align,
      }
    }
  }
}
