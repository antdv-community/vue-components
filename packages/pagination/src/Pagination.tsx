import type { Ref } from 'vue'
import useMergedState from '@v-c/util/dist/hooks/useMergedState'
import pickAttrs from '@v-c/util/dist/pickAttrs'
import classNames from 'classnames'
import { computed, defineComponent, ref, toRef } from 'vue'
import { paginationProps } from './interface'
// function isInteger(value: unknown) {
//   return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
// }

// function defaultItemRender({ originalElement }) {
//   return originalElement;
// }

function calculatePage(p: number | undefined, pageSize: number, total: number) {
  const _pageSize = typeof p === 'undefined' ? pageSize : p
  return Math.floor((total - 1) / _pageSize) + 1
}

const Pagination = defineComponent({
  name: 'VCPagination',
  inheritAttrs: false,
  props: paginationProps(),
  setup(props) {
    const paginationRef = ref()
    const defaultPrefixCls = 'vc-pagination'

    const pageSizeProp = toRef(props, 'pageSize')
    const [pageSize, setPageSize] = useMergedState(10, {
      value: pageSizeProp as Ref<number>,
      defaultValue: props.defaultPageSize || 10,
    })

    const currentProp = toRef(props, 'current')
    const [current, setCurrent] = useMergedState(1, {
      value: currentProp as Ref<number>,
      defaultValue: props.defaultCurrent || 1,
      postState: (c: number | undefined) => Math.max(1, Math.min(c!, calculatePage(undefined, pageSize.value!, props.total))),
    })

    const calcPaginationCls = computed(() => {
      const { prefixCls = defaultPrefixCls, align, simple, disabled } = props
      classNames(props.prefixCls, {
        [`${prefixCls}-start`]: align === 'start',
        [`${prefixCls}-center`]: align === 'center',
        [`${prefixCls}-end`]: align === 'end',
        [`${prefixCls}-simple`]: simple,
        [`${prefixCls}-disabled`]: disabled,
      })
    })

    return () => {
      const {
        style,
        prefixCls = defaultPrefixCls,
        selectPrefixCls = 'vc-select',
        showTotal,
        total = 0,
      } = props

      const dataOrAriaAttributeProps = pickAttrs(props, {
        aria: true,
        data: true,
      })

      const totalText = showTotal && (
        <li class={`${prefixCls}-total-text`}>
          {showTotal(total, [
            total === 0 ? 0 : (current.value - 1) * pageSize.value + 1,
            current.value * pageSize.value > total ? total : current.value * pageSize.value,
          ])}
        </li>
      )

      return (
        <ul
          ref={paginationRef}
          class={calcPaginationCls}
          style={style}
          {...dataOrAriaAttributeProps}
        >
          {totalText}
        </ul>
      )
    }
  },
})

export default Pagination
