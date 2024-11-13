import type { InjectionKey, ShallowRef } from 'vue'
import { inject, provide, shallowRef } from 'vue'

export interface RefContextProps {
  panel: ShallowRef<HTMLDivElement | undefined>
  setPanel: (panel: HTMLDivElement) => void
}

const RefContext: InjectionKey<RefContextProps> = Symbol('RefContext')

export function useRefProvide() {
  const panel = shallowRef<HTMLDivElement>()
  const setPanelRef = (el: HTMLDivElement) => {
    panel.value = el
  }
  provide(RefContext, {
    panel,
    setPanel(panel) {
      setPanelRef(panel)
    },
  })
  return {
    panel,
    setPanelRef,
  }
}

export function useGetRefContext() {
  return inject(RefContext, {} as RefContextProps)
}
