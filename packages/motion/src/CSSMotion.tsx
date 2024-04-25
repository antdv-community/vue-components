import type { CSSProperties, VNodeChild } from 'vue'
import { computed, defineComponent, shallowRef, watch } from 'vue'
import findDOMNode from '@vue-components/util/Dom/findDOMNode'
import type { MotionEndEventHandler, MotionEventHandler, MotionPrepareEventHandler, MotionStatus } from './interface'
import { getTransitionName, supportTransition } from './util/motion.ts'
import { useMotionContext } from './context.tsx'
import useStatus from './hooks/useStatus.ts'
import { STATUS_NONE, STEP_PREPARED, STEP_START } from './interface'
import { isActive } from './hooks/useStepQueue.ts'
import DomWrapper from './DomWrapper.tsx'

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
    setup(props, { slots }) {
      const context = useMotionContext()
      const supportMotion = computed(() => isSupportTransition(props, context.motion))
      const visible = computed(() => !!(props.visible ?? true))
      // Ref to the react node, it may be a HTMLElement
      const nodeRef = shallowRef()
      // Ref to the dom wrapper in case ref can not pass to HTMLElement
      const wrapperNodeRef = shallowRef()

      function getDomElement() {
        try {
          // Here we're avoiding call for findDOMNode since it's deprecated
          // in strict mode. We're calling it only when node ref is not
          // an instance of DOM HTMLElement. Otherwise use
          // findDOMNode as a final resort
          return nodeRef.value instanceof HTMLElement
            ? nodeRef.value
            : findDOMNode<HTMLElement>(wrapperNodeRef.value)
        }
        catch (e) {
          // Only happen when `motionDeadline` trigger but element removed.
          return null
        }
      }

      const [status, statusStep, statusStyle, mergedVisible] = useStatus(supportMotion, visible, getDomElement, props)
      // Record whether content has rendered
      // Will return null for un-rendered even when `removeOnLeave={false}`.

      const renderedRef = shallowRef(false)
      watch(mergedVisible, () => {
        if (mergedVisible.value)
          renderedRef.value = true
      })
      // ====================== Refs ======================
      const setNodeRef = (node: any) => {
        nodeRef.value = node
      }

      return () => {
        const { removeOnLeave = true, motionName, forceRender, leavedClassName, eventProps } = props
        // ===================== Render =====================
        let motionChildren: VNodeChild
        const mergedProps = { ...eventProps, visible: visible.value }
        const children = slots.default?.()
        if (!children) {
          motionChildren = null
        }
        else if (status.value === STATUS_NONE) {
          // Stable children
          if (!removeOnLeave && renderedRef.value && leavedClassName) {
            motionChildren = slots.default?.({
              props: { ...mergedProps, class: leavedClassName },
              setNodeRef,
            },
            )
          }
          else if (forceRender || (!removeOnLeave && !leavedClassName)) {
            motionChildren = slots.default?.({
              props: { ...mergedProps, style: { display: 'none' } },
              setNodeRef,
            },
            )
          }
          else {
            motionChildren = null
          }
        }
        else {
          // In motion
          let statusSuffix: string
          if (statusStep.value === STEP_PREPARED)
            statusSuffix = 'prepare'

          else if (isActive(statusStep.value))
            statusSuffix = 'active'

          else if (statusStep.value === STEP_START)
            statusSuffix = 'start'

          const motionCls = getTransitionName(motionName!, `${status.value}-${statusSuffix!}`)
          motionChildren = slots.default?.({ props:
            {
              ...mergedProps,
              class: [getTransitionName(motionName!, status.value), {
                [motionCls!]: motionCls && statusSuffix!,
                [motionName as string]: typeof motionName === 'string',
              }],
              style: statusStyle.value,
            }, setNodeRef },
          )
          // Auto inject ref if child node not have `ref` props
        }
        return (
          <DomWrapper ref={wrapperNodeRef}>
            {motionChildren}
          </DomWrapper>
        )
      }
    },
  })
}

export default genCSSMotion(supportTransition)
