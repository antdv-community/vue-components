import type { InjectionKey } from 'vue'
import { inject, provide } from 'vue'

export interface TriggerContextProps {
  registerSubPopup: (id: string, node: HTMLElement) => void
}

export const TriggerContextKey: InjectionKey<TriggerContextProps> = Symbol('TriggerContextKey')

export function useProviderTriggerContext() {
  provide(TriggerContextKey, null)
  return {
    registerSubPopup: (id: string, node: HTMLElement) => {
      return null
    },
  }
}

export function useInjectTriggerContext() {
  return inject(TriggerContextKey, null)
}
