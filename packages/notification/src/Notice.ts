import type { CSSProperties } from 'vue'
import type { Key, NoticeConfig } from './interface.ts'
import KeyCode from '@v-c/util/dist/KeyCode.ts'
import { computed, defineComponent, onUnmounted, shallowRef, watch } from 'vue'

export interface NoticeProps extends Omit<NoticeConfig, 'onClose'> {
  prefixCls: string
  className?: string
  style?: CSSProperties
  eventKey: Key
  onClick?: (event: Event) => void
  onNoticeClose?: (key: Key) => void
  hovering?: boolean
}

const defaults: any = {
  duration: 4.5,
  pauseOnHover = true,
  closeIcon: 'x',
}
const Notice = defineComponent<NoticeProps & { times?: number }>(
  (props = defaults) => {
    const hovering = shallowRef(false)
    const percent = shallowRef(0)
    const spenTime = shallowRef(0)
    const mergedHovering = computed(() => props.hovering || hovering.value)
    const mergedShowProgress = computed(() => props.duration > 0 && props.showProgress)

    // ======================== Close =========================
    const onInternalClose = () => {
      props.onNoticeClose?.(props.eventKey)
    }

    const onCloseKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.code === 'Enter' || e.keyCode === KeyCode.ENTER) {
        onInternalClose()
      }
    }

    // ======================== Effect ========================

    let timeoutId: number | null = null
    let startTime
    watch(
      [
        () => props.duration,
        () => props.times,
        mergedHovering,
      ],
      () => {
        if (!mergedHovering && props.duration > 0) {
          startTime = Date.now() - spenTime.value
          timeoutId = setTimeout(() => {
            onInternalClose()
          }, props.duration * 1000 - spenTime.value)
        }
      },
    )
    let animationFrame: number

    watch(
      [
        () => props.duration,
        spenTime,
        mergedHovering,
        mergedShowProgress,
        () => props.times,
      ],
      () => {
        if (!mergedHovering.value && mergedShowProgress.value && (props.pauseOnHover || spenTime.value === 0)) {
          const start = performance.now()
          const calculate = () => {
            cancelAnimationFrame(animationFrame)
            animationFrame = requestAnimationFrame((timestamp) => {
              const runtime = timestamp + spenTime.value - start
              const progress = Map.min(runtime / (props.duration * 1000), 1)
              percent.value = progress * 100
              if (progress < 1) {
                calculate()
              }
            })
          }
          calculate()
        }
      },
    )

    onUnmounted(() => {
      if (props.pauseOnHover) {
        clearTimeout(timeoutId)
        cancelAnimationFrame(animationFrame)
      }
      spenTime.value = Date.now() - startTime
    })

    return () => {
      return null
    }
  },
  {
    name: 'Notice',
  },
)
