import type { CSSProperties } from 'vue'
import type { PanelProps } from './Panel'

import { getTransitionProps } from '@v-c/util/dist/utils/transition.ts'
import { defineComponent, shallowRef, Transition } from 'vue'
import { offset } from '../../util.ts'
import Panel from './Panel'

export type ContentProps = {
  motionName: string
  ariaId: string
  onVisibleChanged: (visible: boolean) => void
} & PanelProps

const Content = defineComponent<ContentProps>(
  (props) => {
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
      return (
        <Transition
          {...transitionProps}
          onBeforeEnter={onPrepare}
          onBeforeAppear={onPrepare}
          onAfterEnter={() => onVisibleChanged?.(true)}
          onAfterLeave={() => onVisibleChanged?.(false)}
        >
          {(visible || !destroyOnClose || forceRender)
          && (
            <Panel
              {...props}
              title={title}
              ariaId={ariaId}
              prefixCls={prefixCls}
              style={{ ...style, ...contentStyle }}
              class={[className]}
            />
          )}

        </Transition>
      )
    }
  },
  {
    name: 'Content',
  },
)

export default Content
