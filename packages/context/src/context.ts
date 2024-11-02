import type { ComputedRef, DefineSetupFnComponent, InjectionKey, PropType } from 'vue'
import { computed, defineComponent, inject, provide } from 'vue'

const globalContext = new Map<SelectorContext<any>, any>()

export interface SelectorContext<ContextProps> {
  Context: InjectionKey<ComputedRef<ContextProps>>
  Provider: DefineSetupFnComponent<{ value: any }>
  defaultValue?: ContextProps
}

export function createContext<ContextProps>(defaultValue?: ContextProps): SelectorContext<ContextProps> {
  const Context: InjectionKey<ComputedRef<ContextProps>> = Symbol('Context')
  const Provider = defineComponent((props, { slots }) => {
    provide(Context, computed(() => props.value))

    return () => {
      return slots.default?.()
    }
  }, {
    props: {
      value: {
        type: Object as PropType<ContextProps>,
        default: () => defaultValue,
      },
    },
  })

  const state = {
    Provider,
    Context,
    defaultValue,
  }
  if (!globalContext.has(state))
    globalContext.set(state, defaultValue)

  return state
}

export function useContext<ContextProps>(holder: SelectorContext<ContextProps>) {
  const context = holder.Context
  return inject(context, (globalContext.get(holder) ?? computed(() => holder.defaultValue)) as ComputedRef<ContextProps>)
}
