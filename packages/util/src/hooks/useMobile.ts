import { onMounted, onUpdated, shallowRef } from 'vue'
import isMobile from '../isMobile'

export function useMobile() {
  const mobile = shallowRef(false)
  onMounted(() => {
    mobile.value = isMobile()
  })

  onUpdated(() => {
    mobile.value = isMobile()
  })
  return mobile
}

export default useMobile
