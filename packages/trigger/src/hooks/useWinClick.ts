import type { MaybeRef } from 'vue'
import { warning } from '@v-c/util'
import { getShadowRoot } from '@v-c/util/dist/Dom/shadow.ts'
import { nextTick, shallowRef, unref, watch } from 'vue'
import { getWin } from '../util.ts'

export default function useWinClick(
  open: MaybeRef<boolean>,
  clickToHide: MaybeRef<boolean>,
  targetEle: MaybeRef<HTMLElement>,
  popupEle: MaybeRef<HTMLElement>,
  mask: MaybeRef<boolean>,
  maskCloseable: MaybeRef<boolean>,
  inPopupOrChild: (target: EventTarget) => boolean,
  triggerOpen: (open: boolean) => void,
) {
  const openRef = shallowRef(unref(open))
  watch(
    () => unref(open),
    () => {
      openRef.value = unref(open)
    },
    {
      immediate: true,
    },
  )

  const popupPointerDownRef = shallowRef(false)

  const onPopupPointerDown = () => {
    popupPointerDownRef.value = true
  }
  watch([
    () => unref(clickToHide),
    () => unref(targetEle),
    () => unref(popupEle),
    () => unref(mask),
    () => unref(maskCloseable),
  ], async ([clickToHide, targetEle, popupEle, mask, maskClosable]) => {
    await nextTick()
    if (clickToHide && popupEle && (!mask || maskClosable)) {
      const onPointerDown = () => {
        popupPointerDownRef.value = false
      }

      const onTriggerClose = (e: MouseEvent) => {
        if (
          openRef.value
          && !inPopupOrChild(e.composedPath?.()?.[0] || e.target)
          && !popupPointerDownRef.value
        ) {
          triggerOpen(false)
        }
      }

      const win = getWin(popupEle)!

      win.addEventListener('pointerdown', onPointerDown, true)
      win.addEventListener('mousedown', onTriggerClose, true)
      win.addEventListener('contextmenu', onTriggerClose, true)

      // shadow root
      const targetShadowRoot: any = getShadowRoot(targetEle)!
      if (targetShadowRoot) {
        targetShadowRoot.addEventListener('mousedown', onTriggerClose, true)
        targetShadowRoot.addEventListener('contextmenu', onTriggerClose, true)
      }

      // Warning if target and popup not in same root
      if (process.env.NODE_ENV !== 'production') {
        const targetRoot = targetEle?.getRootNode?.()
        const popupRoot = popupEle.getRootNode?.()

        warning(
          targetRoot === popupRoot,
          `trigger element and popup element should in same shadow root.`,
        )
      }

      return () => {
        win.removeEventListener('pointerdown', onPointerDown, true)
        win.removeEventListener('mousedown', onTriggerClose, true)
        win.removeEventListener('contextmenu', onTriggerClose, true)

        if (targetShadowRoot) {
          targetShadowRoot.removeEventListener(
            'mousedown',
            onTriggerClose,
            true,
          )
          targetShadowRoot.removeEventListener(
            'contextmenu',
            onTriggerClose,
            true,
          )
        }
      }
    }
  }, {
    immediate: true,
    flush: 'post',
  })

  return onPopupPointerDown
}
