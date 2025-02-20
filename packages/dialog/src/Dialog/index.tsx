import type { CSSProperties } from 'vue'
import type { IDialogPropTypes } from '../IDialogPropTypes.ts'
import type { ContentRef } from './Content/Panel.tsx'
import { warning } from '@v-c/util'
import contains from '@v-c/util/dist/Dom/contains.ts'
import KeyCode from '@v-c/util/dist/KeyCode.ts'
import pickAttrs from '@v-c/util/dist/pickAttrs.ts'
import { defineComponent, onUnmounted, shallowRef, useId, watch } from 'vue'
import { getMotionName } from '../util.ts'
import Content from './Content'
import Mask from './Mask.tsx'

const defaults = {
  prefixCls: 'vc-dialog',
  visible: true,
  keyboard: true,
  focusTriggerAfterClose: true,
  closable: true,
  mask: true,
  maskClosable: true,
  forceRender: false,
} as IDialogPropTypes

const Dialog = defineComponent<IDialogPropTypes>(
  (props = defaults, { expose, slots }) => {
    if (process.env.NODE_ENV !== 'production') {
      ['wrapStyle', 'bodyStyle', 'maskStyle'].forEach((prop) => {
        // (prop in props) && console.error(`Warning: ${prop} is deprecated, please use styles instead.`)
        warning(!(prop in props && (props as any)[prop]), `${prop} is deprecated, please use styles instead.`)
      })
      if ('wrapClassName' in props && props.wrapClassName) {
        warning(false, `wrapClassName is deprecated, please use classNames instead.`)
      }
    }

    const lastOutSideActiveElementRef = shallowRef<HTMLDivElement | null>(null)
    const wrapperRef = shallowRef<HTMLDivElement>()
    const contentRef = shallowRef<ContentRef>()
    const animatedVisible = shallowRef(props.visible)
    // ========================== Init ==========================
    const ariaId = useId()

    function saveLastOutSideActiveElementRef() {
      if (!contains(wrapperRef.value, (document as any).activeElement)) {
        lastOutSideActiveElementRef.value = document.activeElement as HTMLDivElement
      }
    }
    function focusDialogContent() {
      if (!contains(wrapperRef.value, (document as any).activeElement)) {
        contentRef.value?.focus?.()
      }
    }

    // ========================= Events =========================
    function onDialogVisibleChanged(newVisible: boolean) {
      // Try to focus
      if (newVisible) {
        focusDialogContent()
      }
      else {
        // Clean up scroll bar & focus back
        animatedVisible.value = false

        if (props.mask && lastOutSideActiveElementRef.value && props.focusTriggerAfterClose) {
          try {
            lastOutSideActiveElementRef.value?.focus?.({ preventScroll: true })
          }
          catch (e) {
            // Do nothing
          }
          lastOutSideActiveElementRef.value = null
        }

        // Trigger afterClose only when change visible from true to false
        if (animatedVisible.value) {
          props?.afterClose?.()
        }
        props?.afterOpenChange?.(newVisible)
      }
    }

    function onInternalClose(e: any) {
      props?.onClose?.(e)
    }

    // >>> Content
    const contentClickRef = shallowRef(false)
    const contentTimeoutRef = shallowRef<ReturnType<typeof setTimeout>>()
    // We need record content click incase content popup out of dialog
    const onContentMouseDown = () => {
      clearTimeout(contentTimeoutRef.value)
      contentClickRef.value = true
    }

    const onContentMouseUp = () => {
      contentTimeoutRef.value = setTimeout(() => {
        contentClickRef.value = false
      })
    }

    // >>> Wrapper
    // Close only when element not on dialog
    let onWrapperClick: any = null
    watch(
      () => props.maskClosable,
      () => {
        if (props.maskClosable) {
          onWrapperClick = (e: any) => {
            if (contentClickRef.value) {
              contentClickRef.value = false
            }
            else if (wrapperRef.value === e.target) {
              onInternalClose(e)
            }
          }
        }
      },
      {
        immediate: true,
      },
    )
    function onWrapperKeyDown(e: any) {
      if (props.keyboard && e === KeyCode.ESC) {
        e.stopPropagation()
        onInternalClose(e)
      }

      // keep focus inside dialog
      if (props.visible && e.keyCode === KeyCode.TAB) {
        contentRef.value?.changeActive?.(!e.shiftKey)
      }
    }

    // ========================= Effect =========================
    watch(
      () => props.visible,
      () => {
        if (props.visible) {
          animatedVisible.value = true
          saveLastOutSideActiveElementRef()
        }
      },
      {
        immediate: true,
      },
    )

    onUnmounted(() => {
      clearTimeout(contentTimeoutRef.value)
    })

    expose({})
    return () => {
      const {
        zIndex,
        wrapStyle,
        wrapProps,
        wrapClassName,
        closable,
        // Dialog
        transitionName,
        animation,
        styles: modalStyles,
        prefixCls,
        rootClassName,
        visible,
        mask,
        maskAnimation,
        maskTransitionName,
        maskStyle,
        maskProps,
        classNames: modalClassNames,
      } = props
      const mergedStyle: CSSProperties = {
        zIndex,
        ...wrapStyle,
        ...modalStyles?.wrapper,
        display: !animatedVisible.value ? 'none' : undefined,
      }

      // ========================= Render =========================
      return (
        <div
          class={[`${prefixCls}-root`, rootClassName]}
          {...pickAttrs(props, { data: true })}
        >
          <Mask
            prefixCls={prefixCls!}
            visible={!!(mask && visible)}
            motionName={getMotionName(prefixCls!, maskTransitionName, maskAnimation)}
            style={{ zIndex, ...maskStyle, ...modalStyles?.mask }}
            maskProps={maskProps}
            className={modalClassNames?.mask}
          />
          <div
            tabindex={-1}
            onKeydown={onWrapperKeyDown}
            class={[`${prefixCls}-wrap`, wrapClassName, modalClassNames?.wrapper]}
            ref={wrapperRef}
            onClick={onWrapperClick}
            style={mergedStyle}
            {...wrapProps}
          >
            <Content
              {
                ...{
                  ...props,
                  onMouseDown: onContentMouseDown,
                  onMouseUp: onContentMouseUp,
                  onClose: onInternalClose,
                  onVisibleChanged: onDialogVisibleChanged,
                }
              }
              ref={contentRef}
              closable={closable}
              ariaId={ariaId}
              prefixCls={prefixCls!}
              visible={!!visible}
              motionName={getMotionName(prefixCls!, transitionName, animation)!}
              v-slots={slots}
            />
          </div>
        </div>
      )
    }
  },
  {
    name: 'Dialog',
  },
)

export default Dialog
