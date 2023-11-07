import { defineComponent } from 'vue'

export interface PortalProps {
  didUpdate?: (prevProps: PortalProps) => void
  getContainer: () => HTMLElement
}

const Portal = defineComponent<PortalProps>((props, ctx) => {
  return () => {
    return ctx.slots.default?.()
  }
})

export default Portal
