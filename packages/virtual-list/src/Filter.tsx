import type { CSSProperties, VNodeChild } from 'vue'
import { defineComponent, shallowRef } from 'vue'
import classNames from 'classnames'
import ResizeObserver from '@v-c/resize-observer'
import { checkSlotProp } from '@v-c/util/dist/utils/checkSlotProp'

export interface InnerProps {
  role?: string
  id?: string
}

interface FillerProps {
  prefixCls?: string
  /** Virtual filler height. Should be `count * itemMinHeight` */
  height?: number
  /** Set offset of visible items. Should be the top of start item position */
  offsetY?: number
  offsetX?: number

  scrollWidth?: number

  onInnerResize?: () => void

  innerProps?: InnerProps

  rtl: boolean

  extra?: VNodeChild
}

/**
 * Fill component to provided the scroll content real height.
 */

const Filter = defineComponent<FillerProps>({
  name: 'Filter',
  setup(props, { slots, expose }) {
    const innerRef = shallowRef<HTMLDivElement>()
    expose({
      innerRef,
    })
    return () => {
      const { offsetY, offsetX, height, rtl, onInnerResize, innerProps, prefixCls } = props
      let outerStyle: CSSProperties = {}
      let innerStyle: CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
      }
      if (offsetY !== undefined) {
        // Not set `width` since this will break `sticky: right`
        outerStyle = {
          height: `${height}px`,
          position: 'relative',
          overflow: 'hidden',
        }

        innerStyle = {
          ...innerStyle,
          transform: `translateY(${offsetY}px)`,
          [rtl ? 'marginRight' : 'marginLeft']: `${-offsetX!}px`,
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
        }
      }

      return (
        <div style={outerStyle}>
          <ResizeObserver
            onResize={({ offsetHeight }) => {
              if (offsetHeight && onInnerResize)
                onInnerResize()
            }}
          >
            <div
              style={innerStyle}
              class={classNames({
                [`${prefixCls}-holder-inner`]: prefixCls,
              })}
              ref={innerRef}
              {...innerProps}
            >
              {slots?.default?.()}
              {checkSlotProp(props, slots, 'extra')}
            </div>
          </ResizeObserver>
        </div>
      )
    }
  },
})

export default Filter
