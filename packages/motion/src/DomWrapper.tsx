import { defineComponent } from 'vue'

const DomWrapper = defineComponent({
  setup(_, { slots }) {
    return () => {
      return slots?.default?.()
    }
  },
})

export default DomWrapper
