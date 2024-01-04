import { computed, onBeforeUnmount, ref } from 'vue'
import { animationEndName, transitionEndName } from '../util/motion'
import type { MotionEvent } from '../interface'

export default (
  callback: (event: MotionEvent) => void,
): [(element: HTMLElement) => void, (element: HTMLElement) => void] => {
  const cacheElementRef = ref<HTMLElement>()

  // Cache callback
  const callbackRef = ref(callback)

  // Internal motion event handler
  const onInternalMotionEnd = computed(() => callbackRef.value)

  // Remove events
  function removeMotionEvents(element: HTMLElement) {
    if (element) {
      element.removeEventListener(transitionEndName, onInternalMotionEnd.value)
      element.removeEventListener(animationEndName, onInternalMotionEnd.value)
    }
  }

  // Patch events
  function patchMotionEvents(element: HTMLElement) {
    if (cacheElementRef.value && cacheElementRef.value !== element)
      removeMotionEvents(cacheElementRef.value)

    if (element && element !== cacheElementRef.value) {
      element.addEventListener(transitionEndName, onInternalMotionEnd.value)
      element.addEventListener(animationEndName, onInternalMotionEnd.value)

      // Save as cache in case dom removed trigger by `motionDeadline`
      cacheElementRef.value = element
    }
  }

  // Clean up when removed
  onBeforeUnmount(() => {
    if (cacheElementRef.value)
      removeMotionEvents(cacheElementRef.value)
  })

  return [patchMotionEvents, removeMotionEvents]
}
