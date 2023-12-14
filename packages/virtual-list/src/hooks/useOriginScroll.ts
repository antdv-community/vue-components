import { shallowRef } from 'vue'

export default (isScrollAtTop: boolean, isScrollAtBottom: boolean) => {
  // Do lock for a wheel when scrolling
  const lockRef = shallowRef(false)
  const lockTimeoutRef = shallowRef<ReturnType<typeof setTimeout>>(null)
  function lockScroll() {
    clearTimeout(lockTimeoutRef.value)

    lockRef.value = true

    lockTimeoutRef.value = setTimeout(() => {
      lockRef.value = false
    }, 50)
  }

  // Pass to ref since global add is in closure
  const scrollPingRef = shallowRef({
    top: isScrollAtTop,
    bottom: isScrollAtBottom,
  })
  scrollPingRef.value.top = isScrollAtTop
  scrollPingRef.value.bottom = isScrollAtBottom

  return (deltaY: number, smoothOffset = false) => {
    const originScroll
            // Pass origin wheel when on the top
            = (deltaY < 0 && scrollPingRef.value.top)
            // Pass origin wheel when on the bottom
            || (deltaY > 0 && scrollPingRef.value.bottom)

    if (smoothOffset && originScroll) {
      // No need lock anymore when it's smooth offset from touchMove interval
      clearTimeout(lockTimeoutRef.value)
      lockRef.value = false
    }
    else if (!originScroll || lockRef.value) {
      lockScroll()
    }

    return !lockRef.value && originScroll
  }
}
