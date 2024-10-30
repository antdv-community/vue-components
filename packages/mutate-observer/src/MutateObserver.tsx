import type { PropType } from 'vue'
import { defineComponent, ref, shallowRef, toRef } from 'vue'
import findDOMNode from '@v-c/util/Dom/findDOMNode'
import { cloneElement } from '@v-c/util/vnode'
import DomWrapper from './wrapper'
import useMutateObserver from './useMutateObserver'

type OnMutateFn = (mutations: MutationRecord[], observer: MutationObserver) => void

export default defineComponent({
  name: 'VCMutateObserver',
  props: {
    onMutate: {
      type: Function as PropType<OnMutateFn>,
      default: () => {},
    },
    options: {
      type: Object as PropType<MutationObserverInit>,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    const internalOptions = toRef(props, 'options')

    const elementRef = ref(null)

    const wrapperRef = ref(null)

    const target = shallowRef<Element | null | Text>(null)

    const callback: OnMutateFn = (...args) => props.onMutate(...args)

    const getDom = () => {
      const dom = findDOMNode(elementRef as any)
        || (elementRef.value && typeof elementRef.value === 'object' ? findDOMNode((elementRef.value as any).nativeElement) : null)
        || (wrapperRef.value && findDOMNode(wrapperRef.value))

      if (dom && dom.nodeType === 3 && dom.nextElementSibling)
        return dom.nextElementSibling as HTMLElement

      return dom
    }

    useMutateObserver(target, callback, internalOptions)

    return () => {
      const children = slots?.default?.()
      if (!children) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('MutationObserver need children props')
        }
        return null
      }

      target.value = getDom()

      return (
        <DomWrapper ref={wrapperRef}>
          {cloneElement(children, { ref: elementRef }, true, true)}
        </DomWrapper>
      )
    }
  },
})
