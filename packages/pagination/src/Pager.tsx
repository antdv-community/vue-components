import type { PropType } from 'vue'
import type { ItemRender } from './interface'
import { defineComponent } from 'vue'

type OnClick = (page: number) => void

const Pager = defineComponent({
  props: {
    itemRender: {
      type: Function as PropType<ItemRender>,
    },
    rootPrefixCls: {
      type: String,
    },
    page: {
      type: Number,
    },
    active: {
      type: Boolean,
    },
    showTitle: {
      type: Boolean,
    },
    onClick: {
      type: Function as PropType<OnClick>,
    },
    onKeyPress: {
      type: Function as PropType<(e: KeyboardEvent, onClick: OnClick, page: number) => void>,
    },
  },
  setup() {
    return <div>TODO</div>
  },
})

export default Pager
