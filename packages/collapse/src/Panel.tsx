import type { HTMLAttributes } from 'vue'
import classnames from 'classnames'
import { computed, defineComponent, Transition, useSlots } from 'vue'
import { generatorCollapsePanelProps } from './interface'
import PanelContent from './PanelContent'

const CollapsePanel = defineComponent({
  name: 'CollapsePanel',
  props: generatorCollapsePanelProps(),
  setup(props, { attrs }) {
    const disabled = computed(() => props.collapsible === 'disabled')

    const ifExtraExist = computed(
      () =>
        props.extra !== null
        && props.extra !== undefined
        && typeof props.extra !== 'boolean',
    )

    const collapsibleProps = computed(() => {
      return {
        onClick: () => {
          props.onItemClick?.(props.panelKey!)
        },
      }
    })

    const slots = useSlots()

    return () => {
      const {
        extra,
        prefixCls,
        isActive,
        className,
        expandIcon,
        forceRender,
        headerClass,
        collapsible,
        accordion,
        openMotion = {},
        destroyInactivePanel,
        classNames: customizeClassNames = {},
        showArrow = true,
        styles = {},
        header,
      } = props

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
        ...(['header', 'icon'].includes(collapsible!)
          ? {}
          : collapsibleProps.value),
      }

      // ======================== Icon ========================
      const iconNodeInner
        = typeof expandIcon === 'function'
          ? (
              expandIcon(props)
            )
          : (
              <i class="arrow" />
            )
      const iconNode = iconNodeInner && (
        <div
          class={`${prefixCls}-expand-icon`}
          {...(['header', 'icon'].includes(collapsible!)
            ? collapsibleProps.value
            : {})}
        >
          {iconNodeInner}
        </div>
      )

      const panelContent = (
        <PanelContent
          v-show={isActive}
          prefixCls={prefixCls}
          classNames={customizeClassNames}
          styles={styles}
          isActive={isActive}
          forceRender={forceRender}
          role={accordion ? 'tabpanel' : undefined}
          v-slots={{ default: () => <div>123</div> }}
        />
      )

      const transitionProps = {
        'appear': false,
        'css': false,
        'leave-to-class': `${prefixCls}-panel-hidden`,
        ...openMotion,
      }

      return (
        <div {...restProps} class={collapsePanelClassNames}>
          <div {...headerProps}>
            {showArrow && iconNode}
            <span
              class={classnames(
                `${prefixCls}-title`,
                customizeClassNames?.title,
              )}
              style={styles?.title}
              {...(collapsible === 'header' ? collapsibleProps : {})}
            >
              {header}
            </span>
            {ifExtraExist && <div class={`${prefixCls}-extra`}>{extra}</div>}
          </div>

          <Transition {...transitionProps}>
            {!destroyInactivePanel || isActive ? panelContent : null}
          </Transition>
        </div>
      )
    }
  },
})

export default CollapsePanel
