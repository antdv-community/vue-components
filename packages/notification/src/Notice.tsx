import type { Key, NoticeConfig } from './interface.ts'
import KeyCode from '@v-c/util/dist/KeyCode.ts'
import pickAttrs from '@v-c/util/dist/pickAttrs.ts'
import classNames from 'classnames'
import { computed, defineComponent, onUnmounted, shallowRef, watch } from 'vue'

export interface NoticeProps extends Omit<NoticeConfig, 'onClose'> {
  prefixCls: string
  eventKey: Key
  onClick?: (event: Event) => void
  onNoticeClose?: (key: Key) => void
  hovering?: boolean
  props?: any
}

const defaults: any = {
  duration: 4.5,
  pauseOnHover = true,
  closeIcon: 'x',
}
const Notify = defineComponent<NoticeProps & { times?: number }>(
  (props = defaults, { attrs }) => {
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
      const {
        closable,
        closeIcon,
        prefixCls,
        props: divProps,
        onClick,
        content,
      } = props
      // ======================== Closable ========================
      const closableObj = () => {
        if (typeof closable === 'object' && closable !== null) {
          return closable
        }
        if (closable) {
          return {
            closeIcon,
          }
        }
        return {}
      }
      const ariaProps = pickAttrs(closableObj, true)
      // ======================== Progress ========================
      const validPercent = 100 - (!percent.value || percent.value < 0 ? 0 : percent.value > 100 ? 100 : percent.value)

      // ======================== Render ========================
      const noticePrefixCls = `${prefixCls}-notice`
      return (
        <div
          {...divProps}
          class={
            classNames(noticePrefixCls, attrs.class, {
              [`${noticePrefixCls}-closable`]: closable,
            })
          }
          onMouseEnter={(e) => {
            hovering.value = true
            divProps?.onMouseEnter?.(e)
          }}
          onMouseLeave={(e) => {
            hovering.value = false
            divProps?.onMouseLeave?.(e)
          }}
          onClick={onClick}
        >
          {/* Content */}
          <div class={`${noticePrefixCls}-content`}>{content}</div>

          {/* Close Icon */}
          {closable && (
            <a
              tabIndex={0}
              class={`${noticePrefixCls}-close`}
              onKeyDown={onCloseKeyDown}
              aria-label="Close"
              {...ariaProps}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onInternalClose()
              }}
            >
              {closableObj.closeIcon}
            </a>
          )}

          {/* Progress Bar */}
          {mergedShowProgress.value && (
            <progress className={`${noticePrefixCls}-progress`} max="100" value={validPercent}>
              {`${validPercent}%`}
            </progress>
          )}
        </div>
      )
    }
  },
  {
    name: 'Notify',
  },
)

export default Notify
