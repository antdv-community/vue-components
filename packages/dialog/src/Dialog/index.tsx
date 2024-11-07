import type { IDialogPropTypes } from '../IDialogPropTypes.ts'
import type { ContentRef } from './Content/Panel.tsx'
import { warning } from '@v-c/util'
import { defineComponent, shallowRef } from 'vue'

const defaults = {
  prefixCls: 'vc-dialog',
  visible: true,
  keyboard: true,
  focusTriggerAfterClose: true,
  closable: true,
  mask: true,
  maskClosable: true,
} as IDialogPropTypes

const Dialog = defineComponent<IDialogPropTypes>(
  (props = defaults, { expose }) => {
    if (process.env.NODE_ENV !== 'production') {
      ['wrapStyle', 'bodyStyle', 'maskStyle'].forEach((prop) => {
        // (prop in props) && console.error(`Warning: ${prop} is deprecated, please use styles instead.`)
        warning(!(prop in props), `${prop} is deprecated, please use styles instead.`)
      })
      if ('wrapClassName' in props) {
        warning(false, `wrapClassName is deprecated, please use classNames instead.`)
      }
    }

    const lastOutSideActiveElementRef = shallowRef<HTMLDivElement>()
    const wrapperRef = shallowRef<HTMLDivElement>()
    const contentRef = shallowRef<ContentRef>()
    expose({})
    return () => {

    }
  },
  {
    name: 'Dialog',
  },
)

export default Dialog
