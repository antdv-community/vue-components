import type { CSSProperties } from 'vue'
import { defineComponent } from 'vue'
import type { MotionEndEventHandler, MotionEventHandler, MotionPrepareEventHandler, MotionStatus } from './interface'
import { supportTransition } from './util/motion.ts'

export type CSSMotionConfig =
    | boolean
    | {
      transitionSupport?: boolean
      /** @deprecated, no need this anymore since `rc-motion` only support latest react */
      forwardRef?: boolean
    }

export type MotionName =
    | string
    | {
      appear?: string
      enter?: string
      leave?: string
      appearActive?: string
      enterActive?: string
      leaveActive?: string
    }
export interface CSSMotionProps {
  motionName?: MotionName
  visible?: boolean
  motionAppear?: boolean
  motionEnter?: boolean
  motionLeave?: boolean
  motionLeaveImmediately?: boolean
  motionDeadline?: number
  /**
   * Create element in view even the element is invisible.
   * Will patch `display: none` style on it.
   */
  forceRender?: boolean
  /**
   * Remove element when motion end. This will not work when `forceRender` is set.
   */
  removeOnLeave?: boolean
  leavedClassName?: string
  /** @private Used by CSSMotionList. Do not use in your production. */
  eventProps?: object

  // Prepare groups
  /** Prepare phase is used for measure element info. It will always trigger even motion is off */
  onAppearPrepare?: MotionPrepareEventHandler
  /** Prepare phase is used for measure element info. It will always trigger even motion is off */
  onEnterPrepare?: MotionPrepareEventHandler
  /** Prepare phase is used for measure element info. It will always trigger even motion is off */
  onLeavePrepare?: MotionPrepareEventHandler

  // Normal motion groups
  onAppearStart?: MotionEventHandler
  onEnterStart?: MotionEventHandler
  onLeaveStart?: MotionEventHandler

  onAppearActive?: MotionEventHandler
  onEnterActive?: MotionEventHandler
  onLeaveActive?: MotionEventHandler

  onAppearEnd?: MotionEndEventHandler
  onEnterEnd?: MotionEndEventHandler
  onLeaveEnd?: MotionEndEventHandler

  // Special
  /** This will always trigger after final visible changed. Even if no motion configured. */
  onVisibleChanged?: (visible: boolean) => void

  // internalRef?: React.Ref<any>

  // children?: (
  //   props: {
  //     visible?: boolean
  //     className?: string
  //     style?: React.CSSProperties
  //     [key: string]: any
  //   },
  //   ref: (node: any) => void,
  // ) => React.ReactElement
}

export interface CSSMotionState {
  status?: MotionStatus
  statusActive?: boolean
  newStatus?: boolean
  statusStyle?: CSSProperties
  prevProps?: CSSMotionProps
}

/**
 * `transitionSupport` is used for none transition test case.
 * Default we use browser transition event support check.
 */
export function genCSSMotion(
  config: CSSMotionConfig,
) {
  let transitionSupport = config

  if (typeof config === 'object') {
    // @ts-expect-error this
    ({ transitionSupport } = config)
  }

  function isSupportTransition(props: CSSMotionProps, contextMotion?: boolean) {
    return !!(props.motionName && transitionSupport && contextMotion !== false)
  }
  return defineComponent<CSSMotionProps>({
    name: 'CSSMotion',
    setup() {
      return () => {
        return <></>
      }
    },
  })
}

export default genCSSMotion(supportTransition)
