import type { MaybeRef } from 'vue'
import { nextTick, onBeforeUnmount, onMounted, unref, watch } from 'vue'
import { collectScroller, getWin } from '../util'

export default function useWatch(
  open: MaybeRef< boolean>,
  target: MaybeRef<HTMLElement | null>,
  popup: MaybeRef<HTMLElement | null>,
  onAlign: VoidFunction,
  onScroll: VoidFunction,
) {
  let mergedList = new Set()
  let win: Window | null = null
  function notifyScroll() {
    onAlign()
    onScroll()
  }
  const watchData = () => {
    const _open = unref(open)
    const _target = unref(target)
    const _popup = unref(popup)
    if (_open && _target && _popup) {
      const targetElement = _target
      const popupElement = _popup
      const targetScrollList = collectScroller(targetElement)
      const popupScrollList = collectScroller(popupElement)

      win = getWin(popupElement)

      mergedList = new Set([
        win,
        ...targetScrollList,
        ...popupScrollList,
      ])

      mergedList.forEach((scroller) => {
        scroller && (scroller as any)?.addEventListener?.('scroll', notifyScroll, { passive: true })
      })

      win && win.addEventListener('resize', notifyScroll, { passive: true })

      // First time always do align
      onAlign()
    }
  }
  watch(
    [open, target, popup],
    async () => {
      await nextTick()
      watchData()
    },
    {
      flush: 'post',
    },
  )
  onBeforeUnmount(() => {
    mergedList.forEach((scroller) => {
      scroller && (scroller as any).removeEventListener('scroll', notifyScroll)
      win && win.removeEventListener('resize', notifyScroll)
    })
  })

  onMounted(() => {
    watchData()
  })
}
