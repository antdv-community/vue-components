import type { InjectionKey } from 'vue'
import { inject, provide } from 'vue'

export interface RefContextProps {
  panel?: HTMLDivElement
}

const RefContext: InjectionKey<RefContextProps> = Symbol('RefContext')

export function useRefProvide(context: RefContextProps) {
  provide(RefContext, context)
}

export function useGetRefContext() {
  return inject(RefContext, {})
}
