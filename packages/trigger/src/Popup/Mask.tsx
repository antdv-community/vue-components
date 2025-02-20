// import type { CSSMotionProps } from 'rc-motion'
// import CSSMotion from 'rc-motion'
import { defineComponent, Transition, type TransitionProps } from 'vue'

export interface MaskProps {
  prefixCls: string
  open?: boolean
  zIndex?: number
  mask?: boolean

  // Motion
  motion?: object
}
function getTransitionProps(transitionName: string, opt: TransitionProps = {}) {
  const transitionProps: TransitionProps = transitionName
    ? {
        name: transitionName,
        appear: true,
        // type: 'animation',
        // appearFromClass: `${transitionName}-appear ${transitionName}-appear-prepare`,
        // appearActiveClass: `antdv-base-transtion`,
        // appearToClass: `${transitionName}-appear ${transitionName}-appear-active`,
        enterFromClass: `${transitionName}-enter ${transitionName}-enter-prepare ${transitionName}-enter-start`,
        enterActiveClass: `${transitionName}-enter ${transitionName}-enter-prepare`,
        enterToClass: `${transitionName}-enter ${transitionName}-enter-active`,
        leaveFromClass: ` ${transitionName}-leave`,
        leaveActiveClass: `${transitionName}-leave ${transitionName}-leave-active`,
        leaveToClass: `${transitionName}-leave ${transitionName}-leave-active`,
        ...opt,
      }
    : { css: false, ...opt }
  return transitionProps
}

export default defineComponent<MaskProps>((props) => {
  return () => {
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
    const maskMotion = getTransitionProps((motion as any).name, motion)

    return (
      <Transition appear {...maskMotion}>
        {open && <div style={{ zIndex }} class={`${prefixCls}-mask`} />}
      </Transition>
    )
  }
})
