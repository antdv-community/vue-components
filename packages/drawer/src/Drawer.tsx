import type { PortalProps } from '@v-c/portal'
import type { ExtractPropTypes, PropType } from 'vue'
import type { DrawerPopupProps } from './DrawerPopup'
import Portal from '@v-c/portal'
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import DrawerPopup from './DrawerPopup'
import { warnCheck } from './util'

export type Placement = 'left' | 'top' | 'right' | 'bottom'

function drawerProps() {
  return {
    open: { type: Boolean, default: false },
    prefixCls: { type: String, default: 'vc-drawer' },
    placement: { type: String as PropType<Placement>, default: 'right' },
    autoFocus: { type: Boolean, default: true },
    keyboard: { type: Boolean, default: true },
    width: { type: [Number, String], default: 378 },
    mask: { type: Boolean, default: true },
    maskClosable: { type: Boolean, default: true },
    getContainer: { type: [Function, Boolean] as PropType<PortalProps['getContainer']>, default: undefined },
    forceRender: { type: Boolean, default: false },
    onAfterOpenChange: { type: Function },
    destroyOnClose: { type: Boolean, default: false },
    motion: { type: [Function, Object] },
    maskMotion: { type: Object },
  }
}

export type DrawerProps = Omit<DrawerPopupProps, 'prefixCls' | 'inline' | 'scrollLocker'> & Partial<ExtractPropTypes<ReturnType<typeof drawerProps>>>

export default defineComponent({
  name: 'Drawer',
  props: drawerProps(),
  emits: ['close', 'afterOpenChange', 'mouseenter', 'mouseover', 'mouseleave', 'click', 'keydown', 'keyup'],
  setup(props, { emit, slots }) {
    const animatedVisible = ref(false)
    const mounted = ref(false)
    const popupRef = ref<HTMLDivElement>()
    const lastActiveRef = ref<HTMLElement>()

    // ============================= Warn =============================
    if (process.env.NODE_ENV !== 'production') {
      warnCheck(props)
    }

    // ============================= Open =============================
    onMounted(() => {
      mounted.value = true
    })

    const mergedOpen = computed(() => mounted.value ? props.open : false)

    // ============================ Focus =============================
    watch(mergedOpen, (value) => {
      if (value) {
        lastActiveRef.value = document.activeElement as HTMLElement
      }
    })

    // ============================= Open =============================
    const internalAfterOpenChange: DrawerProps['onAfterOpenChange'] = (nextVisible: boolean) => {
      animatedVisible.value = nextVisible
      emit('afterOpenChange', nextVisible)

      if (
        !nextVisible
        && lastActiveRef.value
        && !popupRef.value?.contains(lastActiveRef.value)
      ) {
        lastActiveRef.value?.focus({ preventScroll: true })
      }
    }

    return () => {
      const {
        prefixCls = 'vc-drawer',
        placement = 'right' as Placement,
        autoFocus = true,
        keyboard = true,
        width = 378,
        mask = true,
        maskClosable = true,
        getContainer,
        forceRender,
        destroyOnClose,
      } = props
      // ============================ Render ============================
      if (!forceRender && !animatedVisible.value && !mergedOpen.value && destroyOnClose) {
        return null
      }

      const eventHandlers = {
        onMouseenter: (e: MouseEvent) => emit('mouseenter', e),
        onMouseover: (e: MouseEvent) => emit('mouseover', e),
        onMouseleave: (e: MouseEvent) => emit('mouseleave', e),
        onClick: (e: MouseEvent) => emit('click', e),
        onKeydown: (e: KeyboardEvent) => emit('keydown', e),
        onKeyup: (e: KeyboardEvent) => emit('keyup', e),
      }

      const drawerPopupProps = {
        ...props,
        open: mergedOpen.value,
        prefixCls,
        placement,
        autoFocus,
        keyboard,
        width,
        mask,
        maskClosable,
        inline: getContainer === false,
        afterOpenChange: internalAfterOpenChange,
        ref: popupRef,
        onClose: () => {
          emit('close')
        },
        ...eventHandlers,
      }
      return (
        <Portal
          open={mergedOpen.value || forceRender || animatedVisible.value}
          autoDestroy={false}
          getContainer={getContainer}
          autoLock={mask && (mergedOpen.value || animatedVisible.value)}
        >
          <DrawerPopup {...drawerPopupProps} v-slots={slots} />
        </Portal>
      )
    }
  },
})
