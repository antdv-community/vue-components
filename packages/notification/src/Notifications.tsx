import type { VueNode } from '@v-c/util/dist/type'
import type { CSSProperties } from 'vue'
import type { InnerOpenConfig, Key, OpenConfig, Placement, Placements, StackConfig } from './interface.ts'
import { defineComponent, shallowRef, Teleport, watch } from 'vue'
import NoticeList from './NoticeList.tsx'

export interface NotificationsProps {
  prefixCls?: string
  motion?: any | ((placement: Placement) => any)
  container?: HTMLElement | ShadowRoot
  maxCount?: number
  className?: (placement: Placement) => string
  style?: (placement: Placement) => CSSProperties
  onAllRemoved?: VoidFunction
  stack?: StackConfig
  renderNotifications?: (
    node: VueNode,
    info: { prefixCls: string, key: Key },
  ) => VueNode
}

export interface NotificationsRef {
  open: (config: OpenConfig) => void
  close: (key: Key) => void
  destroy: () => void
}

const defaults = {
  prefixCls: 'vc-notification',
} as NotificationsProps

const Notifications = defineComponent<NotificationsProps>(
  (props = defaults, { expose }) => {
    const configList = shallowRef<OpenConfig[]>([])
    // ======================== Close =========================
    const onNoticeClose = (key: Key) => {
      // Trigger close event
      const config = configList.find(item => item.key === key)
      config?.onClose?.()
      configList.value = configList.value.filter(item => item.key !== key)
    }

    // ========================= Refs =========================
    expose({
      open: (config: OpenConfig) => {
        const list = configList.value
        let clone = [...configList.value]
        // Replace if exist
        const index = clone.findIndex(item => item.key === config.key)
        const innerConfig: InnerOpenConfig = {
          ...config,
        }
        if (index > 0) {
          innerConfig.times = ((list[index] as InnerOpenConfig)?.times || 0) + 1
          clone[index] = innerConfig
        }
        else {
          innerConfig.times = 0
          clone.push(innerConfig)
        }
        if (props.maxCount && props.maxCount > 0 && clone.length > props.maxCount) {
          clone = clone.slice(-props.maxCount)
        }
        configList.value = clone
      },
      close: onNoticeClose,
      destroy: () => {
        configList.value = []
      },
    })

    // ====================== Placements ======================

    const placements = shallowRef<Placements>({})

    watch(
      configList,
      () => {
        const nextPlacements: Placement = {}
        configList.value.forEach((config) => {
          const { placement = 'topRight' } = config
          if (placement) {
            nextPlacements[placement] = nextPlacements[placement] || []
            nextPlacements[placement].push(config)
          }
        })
        // Fill exist placements to avoid empty list causing remove without motion
        Object.keys(placements.value).forEach((placement) => {
          nextPlacements[placement] = nextPlacements[placement] || []
        })
        placements.value = nextPlacements
      },
    )

    // Clean up container if all notices fade out
    const onAllNoticeRemoved = (placement: Placement) => {
      const clone = { ...placements.value }
      const list = clone[placement] || []
      if (!list.length) {
        delete clone[placement]
      }
      placements.value = clone
    }

    // Effect tell that placements is empty now
    const emptyRef = shallowRef(false)

    watch(
      placements,
      () => {
        if (Object.keys(placements.value).length > 0) {
          emptyRef.value = true
        }
        else if (emptyRef.value) {
        // Trigger only when from exist to empty
          onAllRemoved?.()
          emptyRef.value = false
        }
      },
    )

    return () => {
      const { container } = props
      // ======================== Render ========================
      if (!container) {
        return null
      }

      return (
        <Teleport to={container}>
          {Object.keys(placements.value).map((placement) => {
            const placementConfigList = placements.value[placement]
            const list = (
              <NoticeList
                key={placement}
                configList={placementConfigList}
                placement={placement}
                prefixCls={props.prefixCls}
                class={props.className?.(placement)}
                style={props.style?.(placement)}
                motion={props.motion}
                stack={props.stack}
                onAllNoticeRemoved={() => onAllNoticeRemoved(placement)}
                onNoticeClose={onNoticeClose}
              />
            )
            return props.renderNotifications ? props.renderNotifications(list, { prefixCls, key: placement }) : list
          })}
        </Teleport>
      )
    }
  },
  {
    name: 'Notifications',
  },
)
