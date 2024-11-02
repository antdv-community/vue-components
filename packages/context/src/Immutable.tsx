import type { InjectionKey, Ref } from 'vue'
import { defineComponent, inject, isVNode } from 'vue'

export type CompareProps = (prevProps: any, nextProps: any) => boolean

export default function createImmutable() {
  const ImmutableContext: InjectionKey<Ref<number>> = Symbol('ImmutableContext')

  function useImmutableMark() {
    return inject(ImmutableContext, null)
  }

  function makeImmutable<T>(Component: T, shouldTriggerRender?: CompareProps<T>) {
    const refAble = isVNode(Component)

    const ImmutableComponent = defineComponent(
      (props, { attrs }) => {
        return () => {
          return <Component {...attrs} />
        }
      },
      {
        name: 'ImmutableComponent',
      },
    )
  }
  return {}
}
