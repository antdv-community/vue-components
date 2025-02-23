import type { MaybeRef } from 'vue'
import { nextTick, unref, watch } from 'vue'
import { collectScroller, getWin } from '../util.ts'

export default function useWatch(
  open: MaybeRef<boolean>,
  target: MaybeRef<HTMLElement>,
  popup: MaybeRef<HTMLElement>,
  onAlign: VoidFunction,
  onScroll: VoidFunction,
) {
  watch([
    () => unref(open),
    () => unref(target),
    () => unref(popup),
  ], async ([open, target, popup], _, onCleanup) => {
    await nextTick()
    if (open && target && popup) {
      const targetElement = target
      const popupElement = popup
      const targetScrollList = collectScroller(targetElement)
      const popupScrollList = collectScroller(popupElement)

      const win = getWin(popupElement)!

      const mergedList = new Set([
        win,
        ...targetScrollList,
        ...popupScrollList,
      ])

      function notifyScroll() {
        onAlign()
        onScroll()
      }

      mergedList.forEach((scroller) => {
        scroller.addEventListener('scroll', notifyScroll, { passive: true })
      })

      win.addEventListener('resize', notifyScroll, { passive: true })

      // First time always do align
      onAlign()
      onCleanup(() => {
        mergedList.forEach((scroller) => {
          scroller.removeEventListener('scroll', notifyScroll)
          win.removeEventListener('resize', notifyScroll)
        })
      })
    }
  }, {
    immediate: true,
    flush: 'post',
  })
}
