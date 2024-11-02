import { defineComponent } from 'vue'
import { paginationProps } from './interface'

// function isInteger(value: unknown) {
//   return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
// }

// function defaultItemRender({ originalElement }) {
//   return originalElement;
// }

// function calculatePage(p, state, props) {
//   const pageSize = typeof p === 'undefined' ? state.statePageSize : p;
//   return Math.floor((props.total - 1) / pageSize) + 1;
// }

const Pagination = defineComponent({
  name: 'VCPagination',
  inheritAttrs: false,
  props: paginationProps(),
  setup() {
    //
  },
})

export default Pagination
