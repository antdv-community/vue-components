import type { InjectionKey, ShallowRef } from 'vue'
import { inject, provide } from 'vue'

export interface DrawerContextProps {
  pushDistance?: number | string
  push: VoidFunction
  pull: VoidFunction
}

export interface RefContextProps {
  panel: ShallowRef<HTMLDivElement | undefined>
  setPanel: (panel: HTMLDivElement) => void
}

const DrawerContext: InjectionKey<DrawerContextProps> = Symbol('DrawerContext')

export function useDrawerProvide() {
  provide(DrawerContext, {
    pushDistance: 0,
    push: () => {},
    pull: () => {},
  })
}

export function useDrawerContext() {
  return inject(DrawerContext, {
    pushDistance: 0,
    push: () => {},
    pull: () => {},
  })
}

export function useDrawerInject(props: DrawerContextProps) {
  return inject(DrawerContext, props)
}
