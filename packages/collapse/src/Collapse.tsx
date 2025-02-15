import type { Ref } from 'vue'
import useMergedState from '@v-c/util/dist/hooks/useMergedState'
import pickAttrs from '@v-c/util/dist/pickAttrs'
import classNames from 'classnames'
import { defineComponent, ref, toRef } from 'vue'
import { generatorCollapseProps, type Key } from './interface'

function getActiveKeysArray(activeKey: Key | Array<Key>) {
  let currentActiveKey = activeKey
  if (!Array.isArray(currentActiveKey)) {
    const activeKeyType = typeof currentActiveKey
    currentActiveKey
      = activeKeyType === 'number' || activeKeyType === 'string'
        ? [currentActiveKey]
        : []
  }
  return currentActiveKey.map(key => String(key))
}

const Collapse = defineComponent({
  props: generatorCollapseProps(),
  name: 'VcCollapse',
  setup(props, { attrs }) {
    const refWrapper = ref<HTMLDivElement>()

    const [activeKey, setActiveKey] = useMergedState<
      Key | Key[],
      Ref<Array<Key>>
    >([], {
      value: toRef(props, 'activeKey') as Ref<Key | Key[]>,
      onChange: v => props.onChange?.(v as Key[]),
      defaultValue: props.defaultActiveKey,
      postState: getActiveKeysArray,
    })

    const getActiveKey = (key: Key) => {
      if (props.accordion) {
        return activeKey.value[0] === key ? [] : [key]
      }

      const index = activeKey.value.indexOf(key)
      const isActive = index > -1
      if (isActive) {
        return activeKey.value.filter(item => item !== key)
      }

      return [...activeKey.value, key]
    }
    const onItemClick = (key: Key) => {
      setActiveKey(getActiveKey(key))
    }

    return () => {
      const { prefixCls, className, style, accordion } = props

      const collapseClassName = classNames(prefixCls, className)

      const mergedProps = { ...props, ...attrs }

      return (
        <div
          ref={refWrapper}
          class={collapseClassName}
          style={style}
          role={accordion ? 'tablist' : undefined}
          {...pickAttrs(mergedProps, { aria: true, data: true })}
        >
        </div>
      )
    }
  },
})

export default Collapse
