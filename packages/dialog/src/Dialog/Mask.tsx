import type { CSSProperties, HTMLAttributes } from 'vue'
import classNames from 'classnames'
import { defineComponent, Transition } from 'vue'

export interface MaskProps {
  prefixCls: string
  visible: boolean
  motionName?: string
  style?: CSSProperties
  maskProps?: HTMLAttributes
  className?: string
}

const Mask = defineComponent<MaskProps>(
  (props) => {
    return () => {
      const { maskProps, prefixCls, className, style, visible } = props
      return (
        <Transition
          key="mask"
          leaveToClass={`${prefixCls}-mask-hidden`}
        >
          {
            visible && (
              <div
                style={[style]}
                class={classNames(`${prefixCls}-mask`, className)}
                {...maskProps}
              >
                aa
              </div>
            )
          }

        </Transition>
      )
    }
  },
  {
    name: 'Mask',
  },
)

export default Mask
