import { defineComponent } from 'vue'

export interface PopupContentProps {
  cache?: boolean
}

const PopupContent = defineComponent<PopupContentProps>((_props, { slots }) => {
  return () => {
    // const { cache } = props
    return slots.default?.()
  }
})

export default PopupContent
