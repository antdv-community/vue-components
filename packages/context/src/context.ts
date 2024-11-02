import type { VueNode } from '@v-c/util/dist/type.ts'
import type { InjectionKey } from 'vue'
import useEvent from '@v-c/util/dist/hooks/useEvent.ts'
import { useLayoutEffect } from '@v-c/util/dist/hooks/useLayoutEffect.ts'
import isEqual from '@v-c/util/dist/isEqual.ts'
import { computed, defineComponent, inject, nextTick, provide, reactive, shallowRef, watch } from 'vue'

export type Selector<ContextProps, SelectorValue = ContextProps> = (value: ContextProps) => SelectorValue

export type Trigger<ContextProps> = (value: ContextProps) => void

export type Listeners<ContextProps> = Set<Trigger<ContextProps>>

export interface Context<ContextProps> {
  getValue: () => ContextProps
  listeners: Listeners<ContextProps>
}

export interface ContextSelectorProviderProps<T> {
  value: T
}

export interface SelectorContext<ContextProps> {
  Context: InjectionKey<ContextProps>
  Provider: VueNode
  defaultValue?: ContextProps
}

export function createContext<ContextProps>(defaultValue: ContextProps): Selector<ContextProps> {
  const Context: InjectionKey<Context<ContextProps>> = Symbol('Context')
  const Provider = defineComponent(
    (props, { slots }) => {
      const value = computed(() => props.value)
      const context = reactive({
        getValue: () => value.value,
        listeners: new Set(),
      })
      watch(
        value,
        async () => {
          await nextTick()
          context.listeners.forEach(listener => listener(value.value))
        },
        {
          flush: 'post',
        },
      )

      provide(Context, context)
      return () => {
        return slots?.default?.()
      }
    },
    {
      props: {
        value: {
          type: Object,
          required: true,
        },
      },
    },
  )
  return {
    Context,
    Provider,
    defaultValue,
  }
}
/** e.g. useSelect(userContext) => user */
export function useContext<ContextProps>(holder: SelectorContext<ContextProps>): ContextProps

/** e.g. useSelect(userContext, user => user.name) => user.name */
export function useContext<ContextProps, SelectorValue>(
  holder: SelectorContext<ContextProps>,
  selector: Selector<ContextProps, SelectorValue>,
): SelectorValue

/** e.g. useSelect(userContext, ['name', 'age']) => user { name, age } */
export function useContext<ContextProps, SelectorValue extends Partial<ContextProps>>(
  holder: SelectorContext<ContextProps>,
  selector: (keyof ContextProps)[],
): SelectorValue

/** e.g. useSelect(userContext, 'name') => user.name */
export function useContext<ContextProps, PropName extends keyof ContextProps>(
  holder: SelectorContext<ContextProps>,
  selector: PropName,
): ContextProps[PropName]

export function useContext<ContextProps, SelectorValue>(
  holder: SelectorContext<ContextProps>,
  selector?: Selector<ContextProps, SelectorValue> | (keyof ContextProps)[] | keyof ContextProps,
) {
  const eventSelector = useEvent<Selector<ContextProps, SelectorValue>>(typeof selector === 'function'
    ? selector
    : (ctx) => {
        if (selector === undefined) {
          return ctx
        }
        if (!Array.isArray(selector)) {
          return ctx[selector]
        }
        const obj = {} as SelectorValue
        selector.forEach((key) => {
          obj[key] = ctx[key]
        })
        return obj
      })

  const context = inject(holder.Context, undefined)
  const valueRef = shallowRef<SelectorValue>()
  valueRef.value = eventSelector(context?.getValue() ?? holder.defaultValue)
  function trigger(value: ContextProps) {
    const nextSelectorValue = eventSelector(value)
    if (!isEqual(valueRef.value, nextSelectorValue, true)) {
      valueRef.value = nextSelectorValue
    }
  }

  useLayoutEffect(() => {
    if (!context) {
      return
    }
    context.listeners.add(trigger)
    return () => {
      context.listeners.delete(trigger)
    }
  }, context)
  return valueRef
}
