import type { WatchSource } from 'vue'
import { nextTick, watch } from 'vue'

export function useLayoutEffect(callback: Function, deps: WatchSource<unknown>[]) {
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
    immediate: true,
    flush: 'post',
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
