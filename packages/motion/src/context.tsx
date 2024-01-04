import type { InjectionKey } from 'vue'
import { defineComponent, inject, provide } from 'vue'

interface MotionContextProps {
  motion?: boolean
}

export const Context: InjectionKey<MotionContextProps> = Symbol('MotionContext')

export function useMotionContext() {
  return inject(Context, { motion: true })
}

export default defineComponent<MotionContextProps>({
  setup(props, { slots }) {
    provide(Context, props)
    return () => {
      return slots.default?.()
    }
  },
})
