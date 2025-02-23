import type { ComputedRef, InjectionKey } from 'vue'
import { inject, provide } from 'vue'

export interface TriggerContextProps {
  registerSubPopup: (id: string, node: HTMLElement) => void
}

const TriggerContextKey: InjectionKey<ComputedRef<TriggerContextProps>> = Symbol('TriggerContextKey')

export function useTriggerContext() {
  return inject(TriggerContextKey, null)
}

export function useTriggerProvide(props: ComputedRef<TriggerContextProps>) {
  provide(TriggerContextKey, props)
}
