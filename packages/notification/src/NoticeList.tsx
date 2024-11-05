import type { CSSProperties } from 'vue'
import type { InnerOpenConfig, Key, NoticeConfig, OpenConfig, Placement, StackConfig } from './interface.ts'
import { unrefElement } from '@v-c/util/dist/vueuse/unref-element'
import clsx from 'classnames'
import { computed, defineComponent, reactive, ref, shallowRef, toRef, TransitionGroup, watch } from 'vue'
import useStack from './hooks/useStack.ts'
import Notice from './Notice.tsx'
import { useNotificationContext } from './NotificationProvider.tsx'

export interface NoticeListProps {
  configList?: OpenConfig[]
  placement?: Placement
  prefixCls?: string
  motion?: any | ((placement: Placement) => any)
  stack?: StackConfig

  // Events
  onAllNoticeRemoved?: (placement: Placement) => void
  onNoticeClose?: (key: Key) => void
}

const NoticeList = defineComponent<NoticeListProps>(
  (props, { attrs }) => {
    const ctx = useNotificationContext()
    const lastestNotice = shallowRef<HTMLDivElement | null>(null)
    const dictRef = reactive<Record<string, HTMLDivElement>>({})
    const hoverKeys = ref<string[]>([])
    const keys = computed(() => {
      return props.configList?.map(config => ({
        config,
        key: String(config.key),
      }))
    })

    const stackConfig = toRef(props, 'stack')
    const [stack, { offset, threshold, gap }] = useStack(stackConfig)
    const expanded = computed(() => stack.value && (hoverKeys.value.length > 0 || keys.value?.length <= threshold?.value))
    const placementMotion = computed(() => typeof props.motion === 'function' ? props?.motion(props.placement) : props.motion)

    // Clean hover key
    watch(
      [hoverKeys, keys, stack],
      () => {
        if (stack.value && hoverKeys.value.length > 1) {
          hoverKeys.value = hoverKeys.value.filter(key => keys.value?.some(({ key: dataKey }) => key === dataKey))
        }
      },
    )
    // Force update latest notice
    watch(
      [keys, stack],
      () => {
        if (stack.value && dictRef[keys[keys.value?.length - 1]?.key]) {
          lastestNotice.value = dictRef[keys[keys.value?.length - 1]?.key]
        }
      },
    )

    return () => {
      const { prefixCls, placement, onNoticeClose } = props

      const renderNotify = () => {
        // 渲染notify
        return keys.value?.map(({ config }, motionIndex) => {
          const { key, times } = config as InnerOpenConfig
          const strKey = String(key)
          const {
            className: configClassName,
            style: configStyle,
            classNames: configClassNames,
            styles: configStyles,
            ...restConfig
          } = config as NoticeConfig
          const dataIndex = keys.value?.findIndex(item => item.key === strKey)
          // If dataIndex is -1, that means this notice has been removed in data, but still in dom
          // Should minus (motionIndex - 1) to get the correct index because keys.length is not the same as dom length
          const stackStyle: CSSProperties = {}
          if (stack.value) {
            const index = keys.value?.length - 1 - (dataIndex > -1 ? dataIndex : motionIndex - 1)
            const transformX = placement === 'top' || placement === 'bottom' ? '-50%' : '0'
            if (index > 0) {
              stackStyle.height = expanded.value
                ? dictRef[strKey]?.offsetHeight
                : lastestNotice.value?.offsetHeight

              // Transform
              let verticalOffset = 0
              for (let i = 0; i < index; i++) {
                verticalOffset += dictRef[keys.value[keys.value?.length - 1 - i]?.key]?.offsetHeight + gap?.value
              }

              const transformY
                  = (expanded.value ? verticalOffset : index * offset?.value) * (placement?.startsWith('top') ? 1 : -1)
              const scaleX = !expanded.value && lastestNotice.value?.offsetWidth && dictRef[strKey]?.offetWidth
                ? (lastestNotice.value?.offsetWidth - offset?.value * 2 * (index < 3 ? index : 3))
                / dictRef[strKey]?.offsetWidth
                : 1

              stackStyle.transform = `translate3d(${transformX}, ${transformY}px, 0) scaleX(${scaleX})`
            }
            else {
              stackStyle.transform = `translate3d(${transformX}, 0, 0)`
            }
          }

          return (
            <div
              class={clsx(
                `${prefixCls}-notice-wrapper`,
                configClassNames?.wrapper,
              )}
              style={{
                ...stackStyle,
                ...configStyles?.wrapper,
              }}
              onMouseenter={() => {
                hoverKeys.value = hoverKeys.value?.includes(strKey) ? hoverKeys.value : [...hoverKeys.value, strKey]
              }}
              onMouseleave={() => {
                hoverKeys.value = hoverKeys.value?.filter(k => k !== strKey)
              }}
            >
              <Notice
                {...restConfig}
                ref={(el) => {
                  if (dataIndex > -1) {
                    dictRef[strKey] = unrefElement<HTMLDivElement>(el)
                  }
                  else {
                    delete dictRef[strKey]
                  }
                }}
                prefixCls={prefixCls}
                classNames={configClassNames}
                styles={configStyles}
                class={clsx(configClassName, ctx.classNames?.notice)}
                style={configStyle}
                times={times}
                key={key}
                onNoticeClose={onNoticeClose}
                hovering={stack.value && hoverKeys.value.length > 0}
              >
              </Notice>

            </div>
          )
        })
      }
      return (
        <TransitionGroup
          key={placement}
          tag="div"
          css={false}
          appear
          class={
            clsx(
              prefixCls,
              `${prefixCls}-${placement}`,
              ctx.classNames?.list,
              attrs.class,
              {
                [`${prefixCls}-expanded`]: expanded.value,
                [`${prefixCls}-stack`]: stack.value,
              },
            )
          }
        >
          {renderNotify()}
        </TransitionGroup>
      )
    }
  },
  {
    name: 'NoticeList',
  },
)

export default NoticeList
