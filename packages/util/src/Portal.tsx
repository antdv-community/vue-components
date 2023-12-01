import { Teleport, defineComponent, onBeforeUnmount, onMounted, onUnmounted, shallowRef } from 'vue'
import canUseDom from './Dom/canUseDom'

export interface PortalProps {
  didUpdate?: (prevProps: PortalProps) => void
  getContainer: () => HTMLElement
}

export interface PortalRef {

}

const Portal = defineComponent<PortalProps>((props, ctx) => {
  const parentRef = shallowRef()
  const containerRef = shallowRef()

  // Create container in client side with sync to avoid useEffect not get ref
  const initRef = shallowRef(false)

  if (!initRef.value && canUseDom()) {
    containerRef.value = props.getContainer()
    parentRef.value = containerRef.value?.parentNode
    initRef.value = true
  }

  onMounted(() => {
    if (containerRef.value?.parentNode === null && parentRef.value !== null)
      parentRef.value.appendChild(containerRef.value)
  })

  onBeforeUnmount(() => {
    props.didUpdate?.(props)
  })

  onUnmounted(() => {
    containerRef.value?.parentNode?.removeChild?.(containerRef.value)
  })
  return () => {
    if (containerRef.value) {
      return (
        <Teleport to={containerRef.value}>
          {ctx.slots.default?.()}
        </Teleport>
      )
    }
    return null
  }
}, { inheritAttrs: false })

export default Portal
