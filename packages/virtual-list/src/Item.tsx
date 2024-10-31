import { toArray } from '@v-c/util/dist/Children/toArray'
import { cloneVNode, defineComponent } from 'vue'

export interface ItemProps {
  setRef: (el: HTMLElement) => void
}

export default defineComponent<ItemProps>({
  setup(props, { slots }) {
    return () => {
      const children = toArray(slots?.default?.())
      if (children.length !== 1)
        console.warn('VirtualList.Item only accept 1 child.')
      return cloneVNode(children[0], {
        ref: (el) => {
          props?.setRef?.(el as HTMLElement)
        },
      })
    }
  },
})
