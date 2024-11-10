import { getShadowRoot } from '@v-c/util/dist/Dom/shadow'
import { warning } from '@v-c/util/dist/warning'
import {
  ref,
  watchEffect,
} from 'vue'
import { getWin } from '../util'

export default function useWinClick(
  open: boolean,
  clickToHide: boolean,
  targetEle: HTMLElement,
  popupEle: HTMLElement,
  mask: boolean,
  maskClosable: boolean,
  inPopupOrChild: (target: EventTarget) => boolean,
  triggerOpen: (open: boolean) => void,
) {
  const openRef = ref(open)
  openRef.value = open

  // Click to hide is special action since click popup element should not hide
  watchEffect(() => {
    if (clickToHide && popupEle && (!mask || maskClosable)) {
      const onTriggerClose = (e: MouseEvent) => {
        if (
          openRef.value
          && !inPopupOrChild(e.composedPath?.()?.[0] || e.target)
        ) {
          triggerOpen(false)
        }
      }

      const win = getWin(popupEle)

      win.addEventListener('mousedown', onTriggerClose, true)
      win.addEventListener('contextmenu', onTriggerClose, true)

      // shadow root
      const targetShadowRoot = getShadowRoot(targetEle)
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
  })
}
