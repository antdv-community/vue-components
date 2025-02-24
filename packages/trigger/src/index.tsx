import type { MouseEventHandler } from '@v-c/util/dist/EventInterface'
import type { CSSMotionProps } from '@v-c/util/dist/utils/transition'
import type { Component, CSSProperties, VNodeChild } from 'vue'
import type { TriggerContextProps } from './content.ts'
import type { ActionType, AlignType, ArrowPos, ArrowTypeOuter, BuildInPlacements } from './interface.ts'
import { filterEmpty } from '@v-c/input/utils/commonUtils.ts'
import Portal from '@v-c/portal'
import ResizeObserver from '@v-c/resize-observer'
import { isDOM } from '@v-c/util/dist/Dom/findDOMNode.ts'
import { getShadowRoot } from '@v-c/util/dist/Dom/shadow.ts'
import isMobile from '@v-c/util/dist/isMobile'
import classNames from 'classnames'
import { cloneVNode, computed, defineComponent, nextTick, onBeforeUnmount, onMounted, reactive, ref, shallowRef, toValue, useId, watch } from 'vue'
import { useTriggerContext, useTriggerProvide } from './content.ts'
import useAction from './hooks/useAction.ts'
import useAlign from './hooks/useAlign.ts'
import useWatch from './hooks/useWatch.ts'
import useWinClick from './hooks/useWinClick.ts'
import Popup from './Popup'
import { TriggerWrapper } from './TriggerWrapper.tsx'
import { getAlignPopupClassName } from './util.ts'

export type {
  ActionType,
  AlignType,
  ArrowTypeOuter as ArrowType,
  BuildInPlacements,
}

export interface TriggerRef {
  nativeElement: HTMLElement
  popupElement: HTMLDivElement
  forceAlign: VoidFunction
}

// Removed Props List
// Seems this can be auto
// getDocument?: (element?: HTMLElement) => Document;

// New version will not wrap popup with `vc-trigger-popup-content` when multiple children
export interface TriggerProps {
  action?: ActionType | ActionType[]
  showAction?: ActionType[]
  hideAction?: ActionType[]

  prefixCls?: string

  zIndex?: number

  onPopupAlign?: (element: HTMLElement, align: AlignType) => void

  stretch?: string

  // ==================== Open =====================
  popupVisible?: boolean
  defaultPopupVisible?: boolean
  onPopupVisibleChange?: (visible: boolean) => void
  afterPopupVisibleChange?: (visible: boolean) => void

  // =================== Portal ====================
  getPopupContainer?: (node: HTMLElement) => HTMLElement
  forceRender?: boolean
  autoDestroy?: boolean

  // ==================== Mask =====================
  mask?: boolean
  maskClosable?: boolean

  // =================== Motion ====================
  /** Set popup motion. You can ref `rc-motion` for more info. */
  popupMotion?: CSSMotionProps
  /** Set mask motion. You can ref `rc-motion` for more info. */
  maskMotion?: CSSMotionProps

  // ==================== Delay ====================
  mouseEnterDelay?: number
  mouseLeaveDelay?: number

  focusDelay?: number
  blurDelay?: number

  // ==================== Popup ====================
  popup: VNodeChild | (() => VNodeChild)
  popupPlacement?: string
  builtinPlacements?: BuildInPlacements
  popupAlign?: AlignType
  popupClassName?: string
  popupStyle?: CSSProperties
  getPopupClassNameFromAlign?: (align: AlignType) => string
  onPopupClick?: MouseEventHandler

  alignPoint?: boolean // Maybe we can support user pass position in the future

  /**
   * Trigger will memo content when close.
   * This may affect the case if want to keep content update.
   * Set `fresh` to `false` will always keep update.
   */
  fresh?: boolean

  // ==================== Arrow ====================
  arrow?: boolean | ArrowTypeOuter

  // =================== Private ===================
  /**
   * @private Get trigger DOM node.
   * Used for some component is function component which can not access by `findDOMNode`
   */
  getTriggerDOMNode?: (node: VNodeChild) => HTMLElement

  // // ========================== Mobile ==========================
  // /** @private Bump fixed position at bottom in mobile.
  //  * This is internal usage currently, do not use in your prod */
  // mobile?: MobileConfig;
}

const defaults = {
  prefixCls: 'vc-trigger-popup',
  action: 'hover',
  mouseLeaveDelay: 0.1,
  maskClosable: true,
  builtinPlacements: {},
  popupVisible: undefined,
  defaultPopupVisible: undefined,
} as TriggerProps

export function generateTrigger(PortalComponent: Component = Portal) {
  const Trigger = defineComponent<TriggerProps>(
    (props = defaults, { expose, slots, attrs }) => {
      const mergedAutoDestroy = computed(() => props.autoDestroy ?? false)
      // =========================== Mobile ===========================
      const mobile = shallowRef(false)
      onMounted(() => {
        mobile.value = isMobile()
      })

      // ========================== Context ===========================
      const subPopupElements = ref<Record<string, HTMLElement>>({})

      const parentContext = useTriggerContext()
      const context = computed(() => {
        return {
          registerSubPopup(id, subPopupEle) {
            subPopupElements.value[id] = subPopupEle
            parentContext?.value?.registerSubPopup?.(id, subPopupEle)
          },
        } as TriggerContextProps
      })
      useTriggerProvide(context)

      // =========================== Popup ============================
      const id = useId()
      const popupEle = shallowRef<HTMLDivElement | null>(null)

      // Used for forwardRef popup. Not use internal
      const externalPopupRef = shallowRef<HTMLDivElement | null>(null)

      const setPopupRef = (node: any) => {
        node = toValue(node)
        node = (node as any)?.$el || node
        externalPopupRef.value = node
        if (isDOM(node) && popupEle.value !== node) {
          popupEle.value = node as any
        }

        parentContext?.value?.registerSubPopup(id, node)
      }

      // =========================== Target ===========================
      // Use state to control here since `useRef` update not trigger render
      const targeEle = shallowRef<HTMLElement | null>(null)

      // Used for forwardRef target. Not use internal
      const externalForwardRef = shallowRef<HTMLElement | null>(null)
      const setTargetRef = (node: any) => {
        node = node?.$el ?? node
        if (isDOM(node) && targeEle.value !== node) {
          targeEle.value = node as any
          externalForwardRef.value = node as any
        }
      }

      // ========================== Children ==========================
      const inPopupOrChild = (ele: EventTarget) => {
        const childDOM = targeEle.value

        return (
          childDOM?.contains(ele as HTMLElement)
          || getShadowRoot(childDOM!)?.host === ele
          || ele === childDOM
          || popupEle?.value?.contains(ele as HTMLElement)
          || getShadowRoot(popupEle.value!)?.host === ele
          || ele === popupEle.value
          || Object.values(subPopupElements.value).some(
            subPopupEle =>
              subPopupEle?.contains(ele as HTMLElement) || ele === subPopupEle,
          )
        )
      }

      // ============================ Open ============================
      const internalOpen = shallowRef(props.defaultPopupVisible ?? false)

      // Render still use props as first priority
      const mergedOpen = computed(() => props?.popupVisible ?? internalOpen.value)

      // We use effect sync here in case `popupVisible` back to `undefined`
      const setMergedOpen = (nextOpen: boolean) => {
        if (props.popupVisible === undefined) {
          internalOpen.value = nextOpen
        }
      }

      watch(
        () => props.popupVisible,
        async (popupVisible) => {
          await nextTick()
          internalOpen.value = popupVisible || false
        },
        {
          immediate: true,
          flush: 'post',
        },
      )
      const openRef = shallowRef(mergedOpen.value)
      watch(mergedOpen, () => {
        openRef.value = mergedOpen.value
      }, {
        immediate: true,
      })

      const lastTriggerRef = ref<boolean[]>([])
      lastTriggerRef.value = []

      const internalTriggerOpen = (nextOpen: boolean) => {
        setMergedOpen(nextOpen)
        // Enter or Pointer will both trigger open state change
        // We only need take one to avoid duplicated change event trigger
        // Use `lastTriggerRef` to record last open type
        if (
          (lastTriggerRef.value[lastTriggerRef.value.length - 1]
            ?? mergedOpen.value) !== nextOpen
        ) {
          lastTriggerRef.value.push(nextOpen)
          props?.onPopupVisibleChange?.(nextOpen)
        }
      }

      // Trigger for delay
      const delayRef = ref<any>()

      const clearDelay = () => {
        clearTimeout(delayRef.value)
      }

      const triggerOpen = (nextOpen: boolean, delay = 0) => {
        clearDelay()
        if (delay === 0) {
          internalTriggerOpen(nextOpen)
        }
        else {
          delayRef.value = setTimeout(() => {
            internalTriggerOpen(nextOpen)
          }, delay * 1000)
        }
      }

      onBeforeUnmount(clearDelay)

      // ========================== Motion ============================
      const inMotion = shallowRef(false)

      watch(mergedOpen, async () => {
        await nextTick()
        if (mergedOpen.value) {
          inMotion.value = true
        }
      }, {
        flush: 'post',
      })

      const motionPrepareResolve = shallowRef<VoidFunction | null>(null)

      // =========================== Align ============================
      const mousePos = ref<[x: number, y: number] | null>(null)

      const setMousePosByEvent = (event: Pick<MouseEvent, 'clientY' | 'clientX'>) => {
        mousePos.value = [event.clientX, event.clientY]
      }
      const alignPoint = computed(() => props.alignPoint && mousePos.value !== null ? mousePos.value : targeEle.value)
      const alignState = useAlign(
        mergedOpen,
        popupEle as any,
        alignPoint as any,
        computed(() => props.popupPlacement!),
        computed(() => props.builtinPlacements!),
        computed(() => props.popupAlign!),
        props?.onPopupAlign,
      )

      const [showActions, hideActions] = useAction(
        mobile,
        computed(() => props.action!),
        computed(() => props.showAction!),
        computed(() => props.hideAction!),
      )

      const clickToShow = computed(() => showActions.value?.has?.('click'))

      const clickToHide = computed(() => hideActions.value?.has?.('click') || hideActions.value?.has?.('contextMenu'))

      const triggerAlign = () => {
        if (!inMotion.value) {
          alignState?.value?.[10]?.()
        }
      }
      const onScroll = () => {
        if (openRef.value && props?.alignPoint && clickToHide.value) {
          triggerOpen(false)
        }
      }

      useWatch(mergedOpen, targeEle as any, popupEle as any, triggerAlign, onScroll)

      watch([mousePos, () => props.popupPlacement], async () => {
        await nextTick()
        triggerAlign()
      }, {
        immediate: true,
        flush: 'post',
      })
      // When no builtinPlacements and popupAlign changed
      watch(() => JSON.stringify(props?.popupAlign ?? {}), async () => {
        await nextTick()
        const popupPlacement = props.popupPlacement!
        if (mergedOpen.value && !props?.builtinPlacements?.[popupPlacement]) {
          triggerAlign()
        }
      }, {
        immediate: true,
        flush: 'post',
      })

      const alignedClassName = computed(() => {
        const alignInfo = alignState.value?.[9]
        const baseClassName = getAlignPopupClassName(props.builtinPlacements!, props.prefixCls!, alignInfo, props.alignPoint!)

        return classNames(baseClassName, props?.getPopupClassNameFromAlign?.(alignInfo))
      })

      // ============================ Refs ============================
      expose(reactive({
        nativeElement: externalForwardRef,
        popupElement: externalPopupRef,
        forceAlign: triggerAlign,
      }))

      // ========================== Stretch ===========================
      const targetWidth = shallowRef(0)
      const targetHeight = shallowRef(0)

      const syncTargetSize = () => {
        if (props.stretch && targeEle.value) {
          const rect = targeEle.value.getBoundingClientRect()
          targetWidth.value = rect.width
          targetHeight.value = rect.height
        }
      }
      const onTargetResize = () => {
        syncTargetSize()
        triggerAlign()
      }

      // ========================== Motion ============================
      const onVisibleChanged = (visible: boolean) => {
        inMotion.value = false
        alignState.value?.[10]?.()
        props?.afterPopupVisibleChange?.(visible)
      }

      // We will trigger align when motion is in prepare
      const onPrepare = () => new Promise((resolve) => {
        syncTargetSize()
        motionPrepareResolve.value = resolve as any
      })

      watch(motionPrepareResolve, async () => {
        if (motionPrepareResolve.value) {
          alignState.value?.[10]?.()
          motionPrepareResolve.value?.()
          motionPrepareResolve.value = null
        }
      })
      // Click to hide is special action since click popup element should not hide
      const onPopupPointerDown = useWinClick(mergedOpen, clickToHide, targeEle as any, popupEle as any, computed(() => props.mask!), computed(() => props.maskClosable!), inPopupOrChild, triggerOpen)
      return () => {
        const child = filterEmpty(slots?.default?.() as any)?.[0]
        const originChildProps = child?.props || {}
        const cloneProps: Record<string, any> = {}

        // =========================== Action ===========================
        function wrapperAction(eventName: string, nextOpen: boolean, delay?: number, preEvent?: (event: any) => void) {
          cloneProps[eventName] = (event: any, ...args: any[]) => {
            preEvent?.(event)
            triggerOpen(nextOpen, delay)
            originChildProps[eventName]?.(event, ...args)
          }
        }

        // ======================= Action: Click ========================
        if (clickToShow.value || clickToHide.value) {
          cloneProps.onClick = (event: any, ...args: any[]) => {
            if (openRef.value && clickToHide.value) {
              triggerOpen(false)
            }
            else if (!openRef.value && clickToShow.value) {
              setMousePosByEvent(event)
              triggerOpen(true)
            }
            originChildProps?.onClick?.(event, ...args)
          }
        }

        // ======================= Action: Hover ========================
        const hoverToShow = showActions.value.has?.('hover')
        const hoverToHide = hideActions.value.has?.('hover')

        let onPopupMouseEnter: MouseEventHandler
        let onPopupMouseLeave: VoidFunction
        if (hoverToShow) {
          wrapperAction('onMouseEnter', true, props.mouseEnterDelay, setMousePosByEvent)
          wrapperAction('onPointerEnter', false, props.mouseLeaveDelay, setMousePosByEvent)
          onPopupMouseEnter = (event) => {
            // Only trigger re-open when popup is visible
            if ((mergedOpen.value || inMotion.value) && popupEle.value?.contains(event.target as HTMLElement)) {
              triggerOpen(true, props.mouseEnterDelay)
            }
          }
        }

        // Align Point
        if (props.alignPoint) {
          cloneProps.onMousemove = (event: any) => {
            originChildProps.onMousemove?.(event)
          }
        }

        if (hoverToHide) {
          wrapperAction('onMouseLeave', false, props.mouseLeaveDelay)
          wrapperAction('onPointerLeave', false, props.mouseLeaveDelay)
          onPopupMouseLeave = () => {
            triggerOpen(false, props.mouseLeaveDelay)
          }
        }

        // ======================= Action: Focus ========================
        if (showActions.value?.has?.('focus')) {
          wrapperAction('onFocus', true, props.focusDelay)
        }

        if (hideActions.value.has?.('focus')) {
          wrapperAction('onBlur', false, props.blurDelay)
        }

        // ==================== Action: ContextMenu =====================
        if (showActions.value?.has('contextMenu')) {
          cloneProps.onContextmenu = (event: any, ...args: any[]) => {
            if (openRef.value && hideActions.value.has('contextMenu')) {
              triggerOpen(false)
            }
            else {
              setMousePosByEvent(event)
              triggerOpen(true)
            }
            event.preventDefault?.()
            originChildProps.onContextmenu?.(event, ...args)
          }
        }

        // =========================== Render ===========================
        const mergedChildrenProps = {
          ...originChildProps,
          ...cloneProps,
        }

        // Pass props into cloneProps for nest usage
        const passedProps: Record<string, any> = {}
        const passedEventList = [
          'onContextmenu',
          'onClick',
          'onMousedown',
          'onTouchstart',
          'onMouseenter',
          'onMouseleave',
          'onFocus',
          'onBlur',
        ]

        const restProps: Record<string, any> = { ...attrs }
        passedEventList.forEach((eventName) => {
          if (restProps[eventName]) {
            passedProps[eventName] = (...args: any[]) => {
              mergedChildrenProps[eventName]?.(...args)
              restProps[eventName](...args)
            }
          }
        })

        const triggerNode = cloneVNode(child, {
          ...mergedChildrenProps,
          ...passedProps,
        })

        const [
          ready,
          offsetX,
          offsetY,
          offsetR,
          offsetB,
          arrowX,
          arrowY,
          scaleX,
          scaleY,
          alignInfo,
        ] = alignState.value

        const arrowPos: ArrowPos = {
          x: arrowX,
          y: arrowY,
        }

        const arrow = props.arrow
        const innerArrow: ArrowTypeOuter | null = arrow
          ? {
              // true and Object likely
              ...(arrow !== true ? arrow : {}),
            }
          : null

        const {
          prefixCls = 'vc-trigger-popup',

          // Mask
          mask,

          // Portal
          getPopupContainer,
          forceRender,

          // Popup
          popup,
          popupClassName,
          popupStyle,

          zIndex,
          stretch,
          fresh,
          onPopupClick,

          // Motion
          popupMotion,
          maskMotion,

        } = props
        console.log(arrowPos)
        return (
          <>
            <ResizeObserver disabled={!mergedOpen.value} onResize={onTargetResize}>
              <TriggerWrapper getTriggerDOMNode={props.getTriggerDOMNode} ref={setTargetRef}>
                {triggerNode}
              </TriggerWrapper>
            </ResizeObserver>
            <Popup
              portal={PortalComponent}
              setNodeRef={setPopupRef}
              prefixCls={prefixCls}
              popup={popup}
              className={classNames(popupClassName, alignedClassName.value)}
              style={popupStyle}
              target={targeEle.value!}
              {...{
                onMouseEnter: onPopupMouseEnter!,
                onMouseLeave: onPopupMouseLeave!,
                // https://github.com/ant-design/ant-design/issues/43924
                onPointerEnter: onPopupMouseEnter!,
              } as any}
              zIndex={zIndex}
              // Open
              open={mergedOpen.value}
              keepDom={inMotion.value}
              fresh={fresh}
              // Click
              onClick={onPopupClick}
              onPointerDownCapture={onPopupPointerDown}
              // Mask
              mask={mask}
              // Motion
              motion={popupMotion}
              maskMotion={maskMotion}
              onVisibleChanged={onVisibleChanged}
              onPrepare={onPrepare}
              // Portal
              forceRender={forceRender}
              autoDestroy={mergedAutoDestroy.value}
              getPopupContainer={getPopupContainer}
              // Arrow
              align={alignInfo}
              arrow={innerArrow}
              arrowPos={arrowPos}
              // Align
              ready={ready}
              offsetX={offsetX}
              offsetY={offsetY}
              offsetR={offsetR}
              offsetB={offsetB}
              onAlign={triggerAlign}
              // Stretch
              stretch={stretch}
              targetWidth={targetWidth.value / scaleX}
              targetHeight={targetHeight.value / scaleY}
            >
            </Popup>
          </>
        )
      }
    },
    {
      name: 'Trigger',
      inheritAttrs: false,
    },
  )

  return Trigger
}

const Trigger = generateTrigger(Portal)

export {
  Trigger,
}
export default Trigger
