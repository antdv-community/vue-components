// import type { CSSMotionProps } from 'rc-motion'
// import CSSMotion from 'rc-motion'
import { Transition } from 'vue'

export interface MaskProps {
  prefixCls: string
  open?: boolean
  zIndex?: number
  mask?: boolean

  // Motion
  motion?: object
}

export default function Mask(props: MaskProps) {
  const {
    prefixCls,
    open,
    zIndex,
    mask,
    motion = {},
  } = props

  if (!mask) {
    return null
  }

  return (
    <Transition appear {...motion}>
      {open && <div style={{ zIndex }} class={`${prefixCls}-mask`} />}
    </Transition>
  )
}
