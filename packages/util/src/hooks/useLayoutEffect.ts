import type { WatchSource } from 'vue'
import { nextTick, onMounted, onUnmounted, onUpdated, watch } from 'vue'

export function useLayoutEffect(callback: Function, deps: WatchSource<unknown>[] = []) {
  let close: Function | null = null
  if (deps && deps.length) {
    watch(deps, async () => {
      if (close) {
        close?.()
      }
      await nextTick()
      if (typeof callback === 'function') {
        close = callback()
      }
    }, {
      immediate: true,
      flush: 'post',
    })
  }
  else {
    onMounted(() => {
      if (close) {
        close?.()
      }
      if (typeof callback === 'function') {
        close = callback()
      }
    })

    onUpdated(() => {
      if (close) {
        close?.()
      }
      if (typeof callback === 'function') {
        close = callback()
      }
    })
  }

  onUnmounted(() => {
    if (close) {
      close?.()
    }
  })
}

export function useLayoutUpdateEffect(callback: Function, deps: WatchSource<unknown>[]) {
  let close: Function | null = null

  watch(deps, async () => {
    if (close) {
      close?.()
    }
    await nextTick()
    if (typeof callback === 'function') {
      close = callback()
    }
  }, {
    flush: 'post',
  })
}
