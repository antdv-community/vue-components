import { defineComponent } from 'vue'
import { toArray } from '@vue-components/util/Children/toArray'
import { warning } from '@vue-components/util'
import { _rs } from './utils/observerUtil'
import SingleObserver from './SingleObserver'
import { Collection } from './Collection.tsx'

const INTERNAL_PREFIX_KEY = 'vc-observer-key'
export {
  /** @private Test only for mock trigger resize event */
  _rs,
}

export interface SizeInfo {
  width: number
  height: number
  offsetWidth: number
  offsetHeight: number
}

export type OnResize = (size: SizeInfo, element: HTMLElement) => void

export interface ResizeObserverProps {
  /** Pass to ResizeObserver.Collection with additional data */
  data?: any
  disabled?: boolean
  /** Trigger if element resized. Will always trigger when first time render. */
  onResize?: OnResize
}

const ResizeObserver = defineComponent<ResizeObserverProps>({
  setup(props, { slots }) {
    return () => {
      const childNodes = toArray(slots.default?.())
      if (process.env.NODE_ENV !== 'production') {
        if (childNodes.length > 1) {
          warning(
            false,
            'Find more than one child node with `children` in ResizeObserver. Please use ResizeObserver.Collection instead.',
          )
        }
        else if (childNodes.length === 0) {
          warning(false, '`children` of ResizeObserver is empty. Nothing is in observe.')
        }
      }
      return childNodes.map((child, index) => {
        const key = child?.key || `${INTERNAL_PREFIX_KEY}-${index}`
        return (
          <SingleObserver {...props} key={key}>
            {child}
          </SingleObserver>
        )
      })
    }
  },
})

ResizeObserver.Collection = Collection

export default ResizeObserver as typeof ResizeObserver & {
  Collection: typeof Collection
}
