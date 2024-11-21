import type { VueNode } from '@v-c/util/dist/type'
import type { CSSProperties } from 'vue'
import type { StepProps } from './interface'
import KeyCode from '@v-c/util/dist/KeyCode'
import classNames from 'classnames'
import { computed, defineComponent } from 'vue'

function isString(str: any): str is string {
  return typeof str === 'string'
}

export default defineComponent<StepProps>((props, { attrs }) => {
  const clickable = computed(() => !!props.onStepClick && !props.disabled)

  const accessibilityProps = computed(() => {
    if (clickable) {
      return {
        role: 'button',
        tabIndex: 0,
        onClick: (e: MouseEvent) => {
          props.onClick?.(e)
          props.onStepClick?.(props.stepIndex)
        },
        onKeydown: (e: KeyboardEvent) => {
          const { which } = e
          if (which === KeyCode.ENTER || which === KeyCode.SPACE) {
            props.onStepClick?.(props.stepIndex)
          }
        },
      }
    }

    return {}
  })

  const renderIconNode = () => {
    const { stepIcon, stepNumber, title, description, progressDot, prefixCls, iconPrefix, status, icons, icon } = props
    let iconNode: VueNode
    const iconClassName = classNames(`${prefixCls}-icon`, `${prefixCls}icon`, {
      [`${iconPrefix}icon-${icon}`]: icon && isString(icon),
      [`${iconPrefix}icon-check`]:
        !icon && status === 'finish' && ((icons && !icons.finish) || !icons),
      [`${iconPrefix}icon-cross`]:
        !icon && status === 'error' && ((icons && !icons.error) || !icons),
    })

    const iconDot = <span class={`${prefixCls}-icon-dot`} />

    if (progressDot) {
      if (typeof progressDot === 'function') {
        iconNode = (
          <span class={`${prefixCls}-icon`}>
            {progressDot(iconDot, {
              index: stepNumber - 1,
              status: status!,
              title,
              description,
            })}
          </span>
        )
      }
      else {
        iconNode = <span class={`${prefixCls}-icon`}>{iconDot}</span>
      }
    }
    else if (icon && !isString(icon)) {
      iconNode = <span class={`${prefixCls}-icon`}>{icon}</span>
    }
    else if (icons && icons.finish && status === 'finish') {
      iconNode = <span class={`${prefixCls}-icon`}>{icons.finish}</span>
    }
    else if (icons && icons.error && status === 'error') {
      iconNode = <span class={`${prefixCls}-icon`}>{icons.error}</span>
    }
    else if (icon || status === 'finish' || status === 'error') {
      iconNode = <span class={iconClassName} />
    }
    else {
      iconNode = <span class={`${prefixCls}-icon`}>{stepNumber}</span>
    }

    if (stepIcon) {
      iconNode = stepIcon({
        index: stepNumber - 1,
        status: status!,
        title,
        description,
        node: iconNode,
      })
    }

    return iconNode
  }

  const mergedStatus = computed(() => props.status || 'wait')
  return () => {
    const { prefixCls, className, icon, active, disabled,tailContent, onClick,title,subTitle,description, render } = props
    const classString = classNames(
      `${prefixCls}-item`,
      `${prefixCls}-item-${mergedStatus}`,
      className,
      {
        [`${prefixCls}-item-custom`]: icon,
        [`${prefixCls}-item-active`]: active,
        [`${prefixCls}-item-disabled`]: disabled === true,
      },
    )

    const { style = {}, ...restProps } = attrs
    const stepItemStyle: CSSProperties = { ...(style as CSSProperties) }
    let stepNode: VueNode = (
      <div {...restProps} class={classString} style={stepItemStyle}>
        <div onClick={onClick} {...accessibilityProps} class={`${prefixCls}-item-container`}>
          <div class={`${prefixCls}-item-tail`}>{tailContent}</div>
          <div class={`${prefixCls}-item-icon`}>{renderIconNode()}</div>
          <div class={`${prefixCls}-item-content`}>
            <div class={`${prefixCls}-item-title`}>
              {title}
              {subTitle && (
                <div
                  title={typeof subTitle === 'string' ? subTitle : undefined}
                  class={`${prefixCls}-item-subtitle`}
                >
                  {subTitle}
                </div>
              )}
            </div>
            {description && <div class={`${prefixCls}-item-description`}>{description}</div>}
          </div>
        </div>
      </div>
    )

    if (render) {
      stepNode = (render(stepNode) || null);
    }

    return stepNode;
  }
})