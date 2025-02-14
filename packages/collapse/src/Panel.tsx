import type { HTMLAttributes } from 'vue'
import classnames from 'classnames'
import { computed, defineComponent } from 'vue'
import { generatorCollapsePanelProps } from './interface'

const CollapsePanel = defineComponent({
  name: 'CollapsePanel',
  props: generatorCollapsePanelProps(),
  setup(props, { attrs }) {
    const disabled = computed(() => props.collapsible === 'disabled')
    const ifExtraExist = computed(() => props.extra !== null && props.extra !== undefined && typeof props.extra !== 'boolean')

    const collapsibleProps = computed(() => {
      return {
        onClick: () => {
          props.onItemClick?.(props.panelKey!)
        },
      }
    })

    return () => {
      const { extra, prefixCls, isActive, className, expandIcon, headerClass, collapsible, classNames: customizeClassNames = {}, showArrow, styles = {}, header } = props
      const { ...restProps } = attrs
      const collapsePanelClassNames = classnames(
        `${prefixCls}-item`,
        {
          [`${prefixCls}-item-active`]: isActive,
          [`${prefixCls}-item-disabled`]: disabled.value,
        },
        className,
      )
      const headerClassName = classnames(
        headerClass,
        `${prefixCls}-header`,
        {
          [`${prefixCls}-collapsible-${collapsible}`]: !!collapsible,
        },
        customizeClassNames.header,
      )

      const headerProps: HTMLAttributes = {
        class: headerClassName,
        style: styles.header,
      }

      // ======================== Icon ========================
      const iconNodeInner
    = typeof expandIcon === 'function' ? expandIcon(props) : <i class="arrow" />
      const iconNode = iconNodeInner && (
        <div
          class={`${prefixCls}-expand-icon`}
          {...(['header', 'icon'].includes(collapsible!) ? collapsibleProps : {})}
        >
          {iconNodeInner}
        </div>
      )

      return (
        <div {...restProps} class={collapsePanelClassNames}>
          <div {...headerProps}>
            {showArrow && iconNode}
            <span
              class={classNames(`${prefixCls}-title`, customizeClassNames?.title)}
              style={styles?.title}
              {...(collapsible === 'header' ? collapsibleProps : {})}
            >
              {header}
            </span>
            {ifExtraExist && <div class={`${prefixCls}-extra`}>{extra}</div>}
          </div>
        </div>
      )
    }
  },
})

export default CollapsePanel
