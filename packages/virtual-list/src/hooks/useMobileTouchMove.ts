import type { ComputedRef, Ref } from 'vue'
import { onBeforeUnmount, onBeforeUpdate, onMounted, onUpdated, shallowRef } from 'vue'

const SMOOTH_PTG = 14 / 15

export default function useMobileTouchMove(
  inVirtual: ComputedRef<boolean>,
  listRef: Ref<HTMLDivElement | undefined>,
  callback: (offsetY: number, smoothOffset?: boolean) => boolean,
) {
  const touchedRef = shallowRef(false)
  const touchYRef = shallowRef(0)

  const elementRef = shallowRef<HTMLElement>()

  // Smooth scroll
  const intervalRef = shallowRef()

  let cleanUpEvents: () => void

  const onTouchMove = (e: TouchEvent) => {
    if (touchedRef.value) {
      const currentY = Math.ceil(e.touches[0].pageY)
      let offsetY = touchYRef.value - currentY
      touchYRef.value = currentY

      if (callback(offsetY))
        e.preventDefault()

      // Smooth interval
      clearInterval(intervalRef.value)
      intervalRef.value = setInterval(() => {
        offsetY *= SMOOTH_PTG

        if (!callback(offsetY, true) || Math.abs(offsetY) <= 0.1)
          clearInterval(intervalRef.value)
      }, 16)
    }
  }

  const onTouchEnd = () => {
    touchedRef.value = false

    cleanUpEvents()
  }

  const onTouchStart = (e: TouchEvent) => {
    cleanUpEvents()

    if (e.touches.length === 1 && !touchedRef.value) {
      touchedRef.value = true
      touchYRef.value = Math.ceil(e.touches[0].pageY)

      elementRef.value = e.target as HTMLElement
      elementRef.value.addEventListener('touchmove', onTouchMove, { passive: true })
      elementRef.value.addEventListener('touchend', onTouchEnd, { passive: true })
    }
  }

  cleanUpEvents = () => {
    if (elementRef.value) {
      elementRef.value.removeEventListener('touchmove', onTouchMove)
      elementRef.value.removeEventListener('touchend', onTouchEnd)
    }
  }

  onMounted(() => {
    if (inVirtual.value)
      listRef.value?.addEventListener('touchstart', onTouchStart, { passive: true })
  })

  onBeforeUnmount(() => {
    listRef.value?.removeEventListener('touchstart', onTouchStart)
    cleanUpEvents()
    clearInterval(intervalRef.value)
  })

  onUpdated(() => {
    if (inVirtual.value)
      listRef.value?.addEventListener('touchstart', onTouchStart, { passive: true })
  })

  onBeforeUpdate(() => {
    listRef.value?.removeEventListener('touchstart', onTouchStart)
    cleanUpEvents()
    clearInterval(intervalRef.value)
  })
}
