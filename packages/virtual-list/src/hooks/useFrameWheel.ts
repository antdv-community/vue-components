import raf from '@vue-components/util/raf'
import { shallowRef } from 'vue'
import isFF from '../utils/isFirefox'
import useOriginScroll from './useOriginScroll'

interface FireFoxDOMMouseScrollEvent {
  detail: number
  preventDefault: VoidFunction
}

export default function useFrameWheel(
  inVirtual: boolean,
  isScrollAtTop: boolean,
  isScrollAtBottom: boolean,
  horizontalScroll: boolean,
  /***
     * Return `true` when you need to prevent default event
     */
  onWheelDelta: (offset: number, horizontal?: boolean) => void,
): [(e: WheelEvent) => void, (e: FireFoxDOMMouseScrollEvent) => void] {
  const offsetRef = shallowRef(0)
  const nextFrameRef = shallowRef<number>()

  // Firefox patch
  const wheelValueRef = shallowRef<number>()
  const isMouseScrollRef = shallowRef<boolean>(false)

  // Scroll status sync
  const originScroll = useOriginScroll(isScrollAtTop, isScrollAtBottom)

  function onWheelY(event: WheelEvent, deltaY: number) {
    if (nextFrameRef.value)
      raf.cancel(nextFrameRef.value)

    offsetRef.value += deltaY
    wheelValueRef.value = deltaY

    // Do nothing when scroll at the edge, Skip check when is in scroll
    if (originScroll(deltaY))
      return

    // Proxy of scroll events
    if (!isFF)
      event.preventDefault()

    nextFrameRef.value = raf(() => {
      // Patch a multiple for Firefox to fix wheel number too small
      // ref: https://github.com/ant-design/ant-design/issues/26372#issuecomment-679460266
      const patchMultiple = isMouseScrollRef.value ? 10 : 1
      onWheelDelta(offsetRef.value * patchMultiple)
      offsetRef.value = 0
    })
  }

  function onWheelX(event: WheelEvent, deltaX: number) {
    onWheelDelta(deltaX, true)

    if (!isFF)
      event.preventDefault()
  }

  // Check for which direction does wheel do. `sx` means `shift + wheel`
  const wheelDirectionRef = shallowRef<'x' | 'y' | 'sx' | null>(null)
  const wheelDirectionCleanRef = shallowRef<number>()

  function onWheel(event: WheelEvent) {
    if (!inVirtual)
      return

    // Wait for 2 frame to clean direction
    if (wheelDirectionCleanRef.value)
      raf.cancel(wheelDirectionCleanRef.value)
    wheelDirectionCleanRef.value = raf(() => {
      wheelDirectionRef.value = null
    }, 2)

    const { deltaX, deltaY, shiftKey } = event

    let mergedDeltaX = deltaX
    let mergedDeltaY = deltaY

    if (
      wheelDirectionRef.value === 'sx'
            || (!wheelDirectionRef.value && shiftKey && deltaY && !deltaX)
    ) {
      mergedDeltaX = deltaY
      mergedDeltaY = 0

      wheelDirectionRef.value = 'sx'
    }

    const absX = Math.abs(mergedDeltaX)
    const absY = Math.abs(mergedDeltaY)

    if (wheelDirectionRef.value === null)
      wheelDirectionRef.value = horizontalScroll && absX > absY ? 'x' : 'y'

    if (wheelDirectionRef.value === 'y')
      onWheelY(event, mergedDeltaY)
    else
      onWheelX(event, mergedDeltaX)
  }

  // A patch for firefox
  function onFireFoxScroll(event: FireFoxDOMMouseScrollEvent) {
    if (!inVirtual)
      return

    isMouseScrollRef.value = event.detail === wheelValueRef.value
  }

  return [onWheel, onFireFoxScroll]
}
