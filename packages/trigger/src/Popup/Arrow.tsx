import type { CSSProperties } from 'vue'
import type { AlignType, ArrowPos, ArrowTypeOuter } from '../interface'
import classNames from 'classnames'
import { defineComponent, ref } from 'vue'

export interface ArrowProps {
  prefixCls: string
  align: AlignType
  arrow: ArrowTypeOuter
  arrowPos: ArrowPos
}

export const Arrow = defineComponent<ArrowProps>({
  name: 'Arrow',
  setup(props, { expose }) {
    const arrowRef = ref<HTMLDivElement>()

    expose({
      arrowRef,
    })
    return () => {
      const { prefixCls, align, arrow, arrowPos } = props

      const { className, content } = arrow || {}
      const { x = 0, y = 0 } = arrowPos

      // Skip if no align
      if (!align || !align.points) {
        return null
      }

      const alignStyle: CSSProperties = {
        position: 'absolute',
      }

      // Skip if no need to align
      if (align.autoArrow !== false) {
        const popupPoints = align.points[0]
        const targetPoints = align.points[1]
        const popupTB = popupPoints[0]
        const popupLR = popupPoints[1]
        const targetTB = targetPoints[0]
        const targetLR = targetPoints[1]

        // Top & Bottom
        if (popupTB === targetTB || !['t', 'b'].includes(popupTB)) {
          alignStyle.top = y
        }
        else if (popupTB === 't') {
          alignStyle.top = 0
        }
        else {
          alignStyle.bottom = 0
        }

        // Left & Right
        if (popupLR === targetLR || !['l', 'r'].includes(popupLR)) {
          alignStyle.left = x
        }
        else if (popupLR === 'l') {
          alignStyle.left = 0
        }
        else {
          alignStyle.right = 0
        }
      }
      return (
        <div
          ref={arrowRef}
          class={classNames(`${prefixCls}-arrow`, className)}
          style={alignStyle}
        >
          {content}
        </div>
      )
    }
  },
})
