import type { TriggerProps } from './index.tsx'
import { filterEmpty } from '@v-c/input/utils/commonUtils.ts'
import { cloneVNode, defineComponent } from 'vue'

export interface TriggerWrapperProps {
  getTriggerDOMNode?: TriggerProps['getTriggerDOMNode']
}
export const TriggerWrapper = defineComponent<TriggerWrapperProps>((props, { slots }) => {
  const setRef = (el: any) => {
    props.getTriggerDOMNode && props.getTriggerDOMNode(el)
  }
  return () => {
    const child = filterEmpty(slots?.default?.() as any)?.[0]
    return cloneVNode(child, {
      ref: setRef,
    })
  }
}, {
  name: 'TriggerWrapper',
})
