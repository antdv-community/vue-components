import canUseDom from '@vue-components/util/Dom/canUseDom'
import { Teleport, computed, defineComponent, onMounted, shallowRef, watch } from 'vue'
import { warning } from '@vue-components/util'
import { filterEmpty } from '@vue-components/util/props-util'
import useDom from './useDom.tsx'
import useScrollLocker from './useScrollLocker.tsx'
import { useContextProvider } from './Context.tsx'

export type ContainerType = Element | DocumentFragment

export type GetContainer =
  | string
  | ContainerType
  | (() => ContainerType)
  | false

export interface PortalProps {
  /** Customize container element. Default will create a div in document.body when `open` */
  getContainer?: GetContainer
  // children?: React.ReactNode
  /** Show the portal children */
  open?: boolean
  /** Remove `children` when `open` is `false`. Set `false` will not handle remove process */
  autoDestroy?: boolean
  /** Lock screen scroll when open */
  autoLock?: boolean

  /** @private debug name. Do not use in prod */
  debug?: string
}

function getPortalContainer(getContainer: GetContainer) {
  if (getContainer === false)
    return false

  if (!canUseDom() || !getContainer)
    return null

  if (typeof getContainer === 'string')
    return document.querySelector(getContainer)

  if (typeof getContainer === 'function')
    return getContainer()

  return getContainer
}

const defaults = {
  autoDestroy: true,
}

const Portal = defineComponent<PortalProps>((props = defaults, { slots }) => {
  const shouldRender = shallowRef(props.open)
  const mergedRender = computed(() => shouldRender.value || props.open)

  // ========================= Warning =========================
  if (process.env.NODE_ENV !== 'production') {
    warning(
      canUseDom() || !open,
            `Portal only work in client side. Please call 'useEffect' to show Portal instead default render in SSR.`,
    )
  }
  // ====================== Should Render ======================
  watch(
    [() => props.open, () => props.autoDestroy],
    () => {
      if (props.autoDestroy || props.open)
        shouldRender.value = props.open
    },
  )

  // ======================== Container ========================
  const innerContainer = shallowRef<ContainerType | false | null>(getPortalContainer(props.getContainer!))
  onMounted(() => {
    const customizeContainer = getPortalContainer(props.getContainer!)
    // Tell component that we check this in effect which is safe to be `null`
    innerContainer.value = customizeContainer ?? null
  })

  const [defaultContainer, queueCreate] = useDom(
    computed(() => !!(mergedRender.value && !innerContainer.value)),
    props.debug,
  )
  useContextProvider(queueCreate)

  const mergedContainer = computed(() => innerContainer.value ?? defaultContainer.value)

  // ========================= Locker ==========================
  useScrollLocker(
    computed(() => !!(props.autoLock
    && props.open
    && canUseDom()
    && (mergedContainer.value === defaultContainer.value
    || mergedContainer.value === document.body))),
  )
  return () => {
    // ========================= Render ==========================
    // Do not render when nothing need render
    // When innerContainer is `undefined`, it may not ready since user use ref in the same render
    if (!mergedRender.value || !canUseDom() || innerContainer.value === undefined)
      return null
    // Render inline
    const renderInline = mergedContainer.value === false

    const reffedChildren = filterEmpty((slots as any).default?.() ?? [])
    if (renderInline) {
      return reffedChildren
    }
    else {
      return (
        <Teleport to={mergedContainer.value}>
          {reffedChildren}
        </Teleport>
      )
    }
  }
}, {
  name: 'Portal',
  inheritAttrs: false,
})

export default Portal
