import type { Component, Ref, VNode } from 'vue'
import type { ItemRender } from './interface'
import useMergedState from '@v-c/util/dist/hooks/useMergedState'
import KeyCode from '@v-c/util/dist/KeyCode'
import pickAttrs from '@v-c/util/dist/pickAttrs'
import { cloneElement } from '@v-c/util/dist/vnode'
import classNames from 'classnames'
import { computed, defineComponent, h, ref, toRef, watchEffect } from 'vue'
import { paginationProps } from './interface'
import zh_CN from './locale/zh_CN'

function isInteger(value: unknown) {
  return typeof value === 'number' && isFinite(value) && Math.floor(value) === value
}

const defaultItemRender: ItemRender = (
  page,
  type,
  element,
) => element

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
    const allPages = computed(() => calculatePage(undefined, pageSize.value!, props.total))
    const [current, setCurrent] = useMergedState(1, {
      value: currentProp as Ref<number>,
      defaultValue: props.defaultCurrent || 1,
      postState: (c: number | undefined) => Math.max(1, Math.min(c!, calculatePage(undefined, pageSize.value!, props.total))),
    })

    const internalInputVal = ref(current.value)
    watchEffect(() => {
      internalInputVal.value = current.value
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

    function isValid(page: number) {
      return isInteger(page) && page !== current.value && isInteger(props.total) && props.total > 0
    }

    function getItemIcon(
      icon: VNode | Component | undefined,
      label: string,
    ) {
      let iconNode = icon || (
        <button
          type="button"
          aria-label={label}
          class={`${props.prefixCls}-item-link`}
        />
      )
      if (typeof icon === 'function') {
        iconNode = h(icon, { ...props })
      }
      return iconNode as VNode
    }

    const prevPage = computed(() => current.value - 1 > 0 ? current.value - 1 : 0)
    const jumpPrevPage = computed(() => Math.max(1, current.value - (props.showLessItems ? 3 : 5)))
    const jumpNextPage = computed(() => Math.min(
      calculatePage(undefined, pageSize.value, props.total),
      current.value + (props.showLessItems ? 3 : 5),
    ))
    const hasPrev = computed(() => current.value > 1)
    const hasNext = computed(() => current.value < calculatePage(undefined, pageSize.value, props.total))

    function handleChange(page: number) {
      if (isValid(page) && !props.disabled) {
        const currentPage = calculatePage(undefined, pageSize.value, props.total)
        let newPage = page
        if (page > currentPage) {
          newPage = currentPage
        }
        else if (page < 1) {
          newPage = 1
        }

        if (newPage !== internalInputVal.value) {
          internalInputVal.value = newPage
        }

        setCurrent(newPage)
        props.onChange?.(newPage, pageSize.value)

        return newPage
      }

      return current
    }

    function prevHandle() {
      if (hasPrev.value)
        handleChange(current.value - 1)
    }

    function nextHandle() {
      if (hasNext.value)
        handleChange(current.value + 1)
    }

    function jumpPrevHandle() {
      handleChange(jumpPrevPage.value)
    }

    function jumpNextHandle() {
      handleChange(jumpNextPage.value)
    }

    function runIfEnter(
      event: KeyboardEvent,
      callback: (...args: any[]) => void,
      ...restParams: any[]
    ) {
      if (
        event.key === 'Enter'
        || event.charCode === KeyCode.ENTER
        || event.keyCode === KeyCode.ENTER
      ) {
        callback(...restParams)
      }
    }

    function runIfEnterPrev(event: KeyboardEvent) {
      runIfEnter(event, prevHandle)
    }

    function runIfEnterNext(event: KeyboardEvent) {
      runIfEnter(event, nextHandle)
    }

    function runIfEnterJumpPrev(event: KeyboardEvent) {
      runIfEnter(event, jumpPrevHandle)
    }

    function runIfEnterJumpNext(event: KeyboardEvent) {
      runIfEnter(event, jumpNextHandle)
    }

    function renderPrev(prevPage: number) {
      const itemRender = props.itemRender || defaultItemRender
      const prevButton = itemRender(
        prevPage,
        'prev',
        getItemIcon(props.prevIcon, 'prev page'),
      )
      return 'setup' in prevButton ? cloneElement(prevButton, { disabled: !hasPrev.value }) : prevButton
    }

    return () => {
      const {
        style,
        prefixCls = defaultPrefixCls,
        selectPrefixCls = 'vc-select',
        showTotal,
        total = 0,
        locale = zh_CN,
      } = props

      const dataOrAriaAttributeProps = pickAttrs(props, {
        aria: true,
        data: true,
      })

      let prev = renderPrev(prevPage.value)
      if (prev) {
        const prevDisabled = !hasPrev.value || !allPages.value
        prev = (
          <li
            title={props.showTitle ? locale.prev_page : undefined}
            onClick={prevHandle}
            tabindex={prevDisabled ? undefined : 0}
            onKeydown={runIfEnterPrev}
            class={classNames(`${prefixCls}-prev`, {
              [`${prefixCls}-disabled`]: prevDisabled,
            })}
            aria-disabled={prevDisabled}
          >
            {prev}
          </li>
        )
      }

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
          {prev}
        </ul>
      )
    }
  },
})

export default Pagination
