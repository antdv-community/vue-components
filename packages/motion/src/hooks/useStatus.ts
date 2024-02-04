import { computed, nextTick, onBeforeUnmount, ref, shallowRef, toRef, watch } from 'vue'
import type { CSSProperties, Ref } from 'vue'
import useState from '@vue-components/util/hooks/useState'
import type { CSSMotionProps } from '../CSSMotion'

import type {
  MotionEvent,
  MotionEventHandler,
  MotionPrepareEventHandler,
  MotionStatus,
  StepStatus,
} from '../interface'
import {
  STATUS_APPEAR,
  STATUS_ENTER,
  STATUS_LEAVE,
  STATUS_NONE,
  STEP_ACTIVE,
  STEP_PREPARE,
  STEP_PREPARED,
  STEP_START,
} from '../interface'
import useStepQueue, { DoStep, SkipStep, isActive } from './useStepQueue'
import useDomMotionEvents from './useDomMotionEvents'

export default function useStatus(
  supportMotion: Ref<boolean>,
  visible: Ref<boolean>,
  getElement: () => HTMLElement | null,
  props: CSSMotionProps,
): [Ref<MotionStatus>, Ref<StepStatus>, Ref<CSSProperties>, Ref<boolean>] {
  // Used for outer render usage to avoid `visible: false & status: none` to render nothing
  const [asyncVisible, setAsyncVisible] = useState<boolean>()
  const [status, setStatus] = useState<MotionStatus>(STATUS_NONE)
  const [style, setStyle] = useState<CSSProperties | null>(null)

  const mountedRef = ref(false)
  const deadlineRef = ref<any>(null)

  // =========================== Dom Node ===========================
  function getDomElement() {
    return getElement()
  }

  // ========================== Motion End ==========================
  const activeRef = ref(false)

  /**
   * Clean up status & style
   */
  function updateMotionEndStatus() {
    setStatus(STATUS_NONE)
    setStyle(null)
  }

  function onInternalMotionEnd(event: MotionEvent) {
    const element = getDomElement() as HTMLElement

    if (event && !event.deadline && event.target !== element) {
      // event exists
      // not initiated by deadline
      // transitionEnd not fired by inner elements
      return
    }
    const currentActive = activeRef.value

    let canEnd: boolean | void
    if (status.value === STATUS_APPEAR && currentActive)
      canEnd = props?.onAppearEnd?.(element, event)
    else if (status.value === STATUS_ENTER && currentActive)
      canEnd = props?.onEnterEnd?.(element, event)
    else if (status.value === STATUS_LEAVE && currentActive)
      canEnd = props?.onLeaveEnd?.(element, event)

    // Only update status when `canEnd` and not destroyed
    if (status.value !== STATUS_NONE && currentActive && canEnd! !== false)
      updateMotionEndStatus()
  }

  const [patchMotionEvents] = useDomMotionEvents(onInternalMotionEnd)

  // ============================= Step =============================
  const getEventHandlers = (targetStatus: MotionStatus) => {
    const {
      onAppearPrepare,
      onAppearStart,
      onAppearActive,
      onEnterPrepare,
      onEnterStart,
      onEnterActive,
      onLeavePrepare,
      onLeaveStart,
      onLeaveActive,
    } = props
    switch (targetStatus) {
      case STATUS_APPEAR:
        return {
          [STEP_PREPARE]: onAppearPrepare,
          [STEP_START]: onAppearStart,
          [STEP_ACTIVE]: onAppearActive,
        }

      case STATUS_ENTER:
        return {
          [STEP_PREPARE]: onEnterPrepare,
          [STEP_START]: onEnterStart,
          [STEP_ACTIVE]: onEnterActive,
        }

      case STATUS_LEAVE:
        return {
          [STEP_PREPARE]: onLeavePrepare,
          [STEP_START]: onLeaveStart,
          [STEP_ACTIVE]: onLeaveActive,
        }

      default:
        return {}
    }
  }
  const eventHandlers = computed<{
    [STEP_PREPARE]?: MotionPrepareEventHandler
    [STEP_START]?: MotionEventHandler
    [STEP_ACTIVE]?: MotionEventHandler
  }>(() => getEventHandlers(status.value))

  const [startStep, step] = useStepQueue(status, computed(() => !supportMotion.value), (newStep) => {
    // Only prepare step can be skip
    if (newStep === STEP_PREPARE) {
      const onPrepare = eventHandlers.value[STEP_PREPARE]
      if (!onPrepare)
        return SkipStep

      return onPrepare(getDomElement() as HTMLElement)
    }

    // Rest step is sync update
    if (step.value in eventHandlers.value) {
      setStyle(
        (eventHandlers.value as any)[step.value]?.(getDomElement(), null) || null,
      )
    }

    if (step.value === STEP_ACTIVE) {
      // Patch events when motion needed
      patchMotionEvents(getDomElement() as HTMLElement)

      if (props.motionDeadline! > 0) {
        clearTimeout(deadlineRef.value)

        deadlineRef.value = setTimeout(() => {
          onInternalMotionEnd({
            deadline: true,
          } as MotionEvent)
        }, props.motionDeadline)
      }
    }

    if (step.value === STEP_PREPARED)
      updateMotionEndStatus()

    return DoStep
  })

  watch(
    step,
    (step) => {
      activeRef.value = isActive(step)
    },
    { immediate: true },
  )

  // ============================ Status ============================
  // Update with new status
  watch(
    visible,
    (visible) => {
      setAsyncVisible(visible)

      // if (!supportMotion.value)
      //   return

      const isMounted = mountedRef.value
      mountedRef.value = true

      let nextStatus: MotionStatus

      // Appear
      if (!isMounted && visible && props.motionAppear)
        nextStatus = STATUS_APPEAR

      // Enter
      if (isMounted && visible && props.motionEnter)
        nextStatus = STATUS_ENTER

      // Leave
      if (
        (isMounted && !visible && props.motionLeave)
        || (!isMounted
        && props.motionLeaveImmediately
        && !visible
        && props.motionLeave)
      )
        nextStatus = STATUS_LEAVE

      const nextEventHandlers = getEventHandlers(nextStatus!)

      // Update to next status
      if (nextStatus! && (supportMotion.value || nextEventHandlers[STEP_PREPARE])) {
        setStatus(nextStatus)
        nextTick(startStep)
      }
      else {
        // Set back in case no motion but prev status has prepare step
        setStatus(STATUS_NONE)
      }
    },
    { immediate: true },
  )

  // ============================ Effect ============================
  // Reset when motion changed
  watch(
    [
      toRef(props, 'motionAppear'),
      toRef(props, 'motionEnter'),
      toRef(props, 'motionLeave'),
    ] as const,
    ([motionAppear, motionEnter, motionLeave]) => {
      if (
      // Cancel appear
        (status.value === STATUS_APPEAR && !motionAppear)
        // Cancel enter
        || (status.value === STATUS_ENTER && !motionEnter)
        // Cancel leave
        || (status.value === STATUS_LEAVE && !motionLeave)
      )
        setStatus(STATUS_NONE)
    },
    {
      immediate: true,
    },
  )

  onBeforeUnmount(() => {
    mountedRef.value = false
    if (deadlineRef.value)
      clearTimeout(deadlineRef.value)
  })

  // Trigger `onVisibleChanged`
  const firstMountChangeRef = shallowRef(false)
  watch(
    [asyncVisible, status],
    ([asyncVisible, status]) => {
      if (asyncVisible)
        firstMountChangeRef.value = true

      if (asyncVisible !== undefined && status === STATUS_NONE) {
        // Skip first render is invisible since it's nothing changed
        if (firstMountChangeRef.value || asyncVisible)
          props?.onVisibleChanged?.(asyncVisible)

        firstMountChangeRef.value = true
      }
    },
    { immediate: true },
  )

  // ============================ Styles ============================
  if (eventHandlers.value[STEP_PREPARE] && step.value === STEP_START)
    style.value = { transition: 'none', ...style.value }

  return [status, step, style as Ref<CSSProperties>, asyncVisible ?? visible]
}
