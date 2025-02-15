import type { CSSProperties, PropType } from 'vue'
import classnames from 'classnames'
import { defineComponent, ref, watch } from 'vue'

const PanelContent = defineComponent({
  name: 'PanelContent',
  props: {
    isActive: Boolean,
    prefixCls: String,
    className: String,
    classNames: Object as PropType<{ header?: string, body?: string }>,
    style: Object as PropType<Record<string, string>>,
    styles: Object as PropType<{
      header?: CSSProperties
      body?: CSSProperties
    }>,
    role: String,
    forceRender: Boolean,
  },
  setup(props, { slots }) {
    const rendered = ref(props.isActive || props.forceRender)

    watch(
      () => [props.isActive, props.forceRender],
      () => {
        if (props.isActive || props.forceRender) {
          rendered.value = true
        }
      },
    )

    return () => {
      if (!rendered.value) {
        return null
      }

      const {
        prefixCls,
        isActive,
        style,
        role,
        className,
        classNames: customizeizeClassNames,
        styles,
      } = props

      return (
        <div
          class={classnames(
            `${prefixCls}-content`,
            {
              [`${prefixCls}-content-active`]: isActive,
              [`${prefixCls}-content-inactive`]: !isActive,
            },
            className,
          )}
          style={style}
          role={role}
        >
          <div
            class={classnames(
              `${prefixCls}-content-box`,
              customizeizeClassNames?.body,
            )}
            style={styles?.body}
          >
            {slots.default?.()}
          </div>
        </div>
      )
    }
  },
})

export default PanelContent
