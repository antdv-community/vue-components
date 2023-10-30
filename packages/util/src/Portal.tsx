import { defineComponent } from 'vue'

export interface PortalProps {
  didUpdate?: (prevProps: PortalProps) => void
  getContainer: () => HTMLElement
}

const Portal = defineComponent<PortalProps>((props, ctx) => {})

export default Portal
