// import { classnames } from 'classnames'
import { computed, defineComponent } from 'vue'
import { generatorCollapsePanelProps } from './interface'

const CollapsePanel = defineComponent({
  name: 'CollapsePanel',
  props: generatorCollapsePanelProps(),
  setup(props) {
    const disabled = computed(() => props.collapsible === 'disabled')
    return () => {

    }
  },
})

export default CollapsePanel
