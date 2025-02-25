import type { CSSMotionProps } from '@v-c/util/dist/utils/transition'
import { defineComponent, Transition } from 'vue'

export interface MaskProps {
  prefixCls: string
  open?: boolean
  zIndex?: number
  mask?: boolean

  // Motion
  motion?: CSSMotionProps
}

const Mask = defineComponent<MaskProps>(
  (props, { attrs }) => {
    return () => {
      const {
        prefixCls,
        open,
        zIndex,
        mask,
        motion,
      } = props

      if (!mask) {
        return null
      }
      return (
        <Transition {...motion}>
          {open && <div style={{ zIndex }} class={[`${prefixCls}-mask`, attrs.class]} />}
        </Transition>
      )
    }
  },
  {
    name: 'Mask',
    inheritAttrs: false,
  },
)

export default Mask
