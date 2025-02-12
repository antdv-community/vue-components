import type { CSSProperties } from 'vue'
import type { ProgressProps } from './interface.ts'
import { defineComponent } from 'vue'
import { defaultProps, useTransitionDuration } from './common.ts'

const Line = defineComponent<ProgressProps>(
  (props = defaultProps, { attrs }) => {
    const paths = useTransitionDuration()

    return () => {
      const {
        className,
        percent,
        prefixCls,
        strokeColor,
        strokeLinecap,
        strokeWidth,
        trailColor,
        trailWidth,
        transition,
        ...restProps
      } = props

      delete restProps.gapPosition
      const percentList = Array.isArray(percent) ? percent : [percent]
      const strokeColorList = Array.isArray(strokeColor) ? strokeColor : [strokeColor]

      const center = strokeWidth! / 2
      const right = 100 - strokeWidth! / 2
      const pathString = `M ${strokeLinecap === 'round' ? center : 0},${center}
         L ${strokeLinecap === 'round' ? right : 100},${center}`
      const viewBoxString = `0 0 100 ${strokeWidth}`
      let stackPtg = 0
      return (
        <svg
          class={{
            [`${prefixCls}-line`]: true,
            className,
          }}
          preserveAspectRatio="none"
          viewBox={viewBoxString}
          style={[(attrs as any).style]}
          {...restProps}
        >
          <path
            class={[
              `${prefixCls}-line-trail`,
            ]}
            d={pathString}
            stroke-linecap={strokeLinecap}
            stroke={trailColor}
            stroke-width={trailWidth || strokeWidth}
            fill-opacity="0"
          />
          {
            percentList.map((ptg, index) => {
              let dashPercent = 1
              switch (strokeLinecap) {
                case 'round':
                  dashPercent = 1 - strokeWidth! / 100
                  break
                case 'square':
                  dashPercent = 1 - strokeWidth! / 2 / 100
                  break
                default:
                  dashPercent = 1
                  break
              }
              const pathStyle: CSSProperties = {
                strokeDasharray: `${ptg! * dashPercent}px, 100px`,
                strokeDashoffset: `-${stackPtg}px`,
                transition:
                    transition
                    || 'stroke-dashoffset 0.3s ease 0s, stroke-dasharray .3s ease 0s, stroke 0.3s linear',
              }
              const color = strokeColorList[index] || strokeColorList[strokeColorList.length - 1]
              stackPtg += ptg!
              return (
                <path
                  key={index}
                  class={`${prefixCls}-line-path`}
                  d={pathString}
                  stroke-linecap={strokeLinecap}
                  stroke={color as string}
                  stroke-width={strokeWidth}
                  fill-opacity="0"
                  ref={(elem) => {
                    // https://reactjs.org/docs/refs-and-the-dom.html#callback-refs
                    // React will call the ref callback with the DOM element when the component mounts,
                    // and call it with `null` when it unmounts.
                    // Refs are guaranteed to be up-to-date before componentDidMount or componentDidUpdate fires.

                    paths.value[index] = elem as SVGPathElement
                  }}
                  style={pathStyle}
                />
              )
            })
          }
        </svg>
      )
    }
  },
  {
    name: 'Line',
  },
)

export default Line
