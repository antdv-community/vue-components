import type { CSSProperties } from 'vue'
import type { PanelProps } from './Panel'

import { getTransitionProps } from '@v-c/util/dist/utils/transition.ts'
import { defineComponent, shallowRef, Transition } from 'vue'
import { offset } from '../../util.ts'
import Panel from './Panel'

export type ContentProps = {
  motionName?: string
  ariaId: string
  onVisibleChanged: (visible: boolean) => void
} & PanelProps

const Content = defineComponent<ContentProps>(
  (props, { slots }) => {
    const dialogRef = shallowRef<HTMLDivElement>()
    return () => {
      const {
        prefixCls,
        className,
        style,
        visible,
        destroyOnClose,
        forceRender,
        onVisibleChanged,
        mousePosition,
        ariaId,
        title,
        motionName,
      } = props
      // ============================= Style ==============================
      let transformOrigin = ''
      const contentStyle: CSSProperties = {}
      if (transformOrigin) {
        contentStyle.transformOrigin = transformOrigin
      }
      function onPrepare() {
        if (dialogRef.value) {
          const elementOffset = offset(dialogRef.value)
          transformOrigin = mousePosition && (mousePosition.x || mousePosition.y) ? `${mousePosition.x - elementOffset.left}px ${mousePosition.y - elementOffset.top}px` : ''
        }
      }
      // ============================= Render =============================
      const transitionProps = getTransitionProps(motionName)
      const dom = (
        <Panel
          {...props}
          v-slots={slots}
          title={title}
          ariaId={ariaId}
          prefixCls={prefixCls}
          style={{ ...style, ...contentStyle }}
          class={[className]}
        />
      )
      // 改造render函数
      const renderDom = () => {
        if ((destroyOnClose || forceRender) && visible) {
          return dom
        }
        else if (!destroyOnClose && !forceRender) {
          return dom
        }
        else {
          return null
        }
      }
      return (
        <Transition
          {...transitionProps}
          onBeforeEnter={onPrepare}
          onBeforeAppear={onPrepare}
          onAfterEnter={() => onVisibleChanged?.(true)}
          onAfterLeave={() => onVisibleChanged?.(false)}
        >
          {renderDom()}
        </Transition>
      )
    }
  },
  {
    name: 'Content',
  },
)

export default Content
